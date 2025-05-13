import os
from datetime import datetime, timedelta

import cv2
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt,JWTError
from passlib.context import CryptContext
from sqlalchemy import Column, Integer, String, DateTime, JSON, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from deepface import DeepFace

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL env var is required")
SECRET_KEY = os.getenv("SECRET_KEY", "change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30  ))
EMBEDDING_THRESHOLD = float(os.getenv("EMBEDDING_THRESHOLD", 0.6))

facenet_model = DeepFace.build_model("Facenet")

Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    face_embedding = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
async def decode_face(file: UploadFile) -> np.ndarray:
    data = await file.read()
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Face processing error: cannot decode image")
    return img

import shutil

@app.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    face: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    username = username.strip()
    email = email.strip()
    if db.query(User).filter((User.username == username) | (User.email == email)).first():
        raise HTTPException(status_code=409, detail="Username or email already registered")


    img = await decode_face(face)
    try:
        reps = DeepFace.represent(
            img_path=img,
            model_name="Facenet",
            detector_backend='mtcnn',
            enforce_detection=True,
            align=True
        )
        embedding = reps[0]["embedding"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Face processing error: {e}")

    user = User(
        username=username,
        email=email,
        password_hash=pwd_context.hash(password),
        face_embedding=[float(x) for x in embedding]
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.username, "email": user.email})
    return {"access_token": token, "token_type": "bearer"}
@app.post("/signin")
async def signin(
    username: str = Form(...),
    password: str = Form(...),
    face: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user or not pwd_context.verify(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    img = await decode_face(face)
    try:
        reps_new = DeepFace.represent(
            img_path=img,
            model_name="Facenet",
            detector_backend='mtcnn',
            enforce_detection=True,
            align=True
        )
        new_emb = reps_new[0]["embedding"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Face processing error: {e}")

    try:
        result = DeepFace.verify(
            img1_path=new_emb,
            img2_path=user.face_embedding,
            model_name="Facenet",
            enforce_detection=False,
            align=False,
            distance_metric="cosine",
            threshold=EMBEDDING_THRESHOLD
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Face verification error: {e}")

    if not result.get("verified", False):
        raise HTTPException(status_code=401, detail="Face verification failed")

    token = create_access_token({"sub": user.username, "email": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/logout")
def logout(token: str = Depends(oauth2_scheme)):
    return {"msg": "Logged out"}

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        email: str = payload.get("email")
        if username is None or email is None:
            raise credentials_exception
        return {"username": username, "email": email}
    except JWTError as e:
        # Optionally, check for expiration in the error message
        if "Signature has expired" in str(e):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise credentials_exception

@app.get("/me")
async def read_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at,
            # Do not return password_hash or face_embedding in production!
        }
        for user in users
    ]
