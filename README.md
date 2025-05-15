
# Web-based-Facial-Recognition-Security-System
# FaceAuth API

A **FastAPI** application that provides:

* **User signup** with username, email, password, and face embedding (using DeepFace/FaceNet)
* **User signin** with two-factor authentication: password + face verification against stored embedding
* **Token-based auth** via JWT (Bearer tokens)
* **Logout** endpoint (token revocation placeholder)
* **Profile** endpoint (`/me`) to retrieve current user info

---

## Features

* Face embeddings stored in a PostgreSQL database (JSON column)
* Face detection, alignment, and embedding via DeepFace (Model: FaceNet)
* Secure password hashing with bcrypt (via Passlib)
* JWT issuance and validation (via python-jose)
* Easy configuration with environment variables
* Ready for deployment (Neon.tech, Heroku, Docker, etc.)

---

## Prerequisites

* Python 3.8+
* PostgreSQL database (local or cloud; tested with [Neon.tech](https://neon.tech))

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USER/FaceAuth-API.git
   cd FaceAuth-API
   ```

2. **Create and activate a virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate   # Linux / macOS
   venv\\Scripts\\activate  # Windows PowerShell
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

---

## Configuration

Set the following environment variables in your shell:

```bash
# PostgreSQL connection string
export DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/<dbname>?sslmode=require"

# JWT secret key (use a strong random string)
export SECRET_KEY="your-secret-key"

# (Optional) Token expiration in minutes
export ACCESS_TOKEN_EXPIRE_MINUTES=30

# (Optional) Face verification threshold (cosine distance)
export EMBEDDING_THRESHOLD=0.6
```

On Windows PowerShell:

```powershell
$Env:DATABASE_URL = "postgresql://..."
$Env:SECRET_KEY    = "your-secret-key"
```

---

## Running the Server

1. **Initialize database tables** (auto-creates on startup):

   ```bash
   python main.py --create-db
   ```

2. **Start Uvicorn**

   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://127.0.0.1:8000` with Swagger UI at `/docs`.

---

## API Endpoints

### `POST /signup`

* **Request:** `multipart/form-data` fields:

  * `username`: string
  * `email`: string
  * `password`: string
  * `face`: file (JPEG/PNG image)

* **Response:** `201 Created`

  ```json
  { "access_token": "<jwt>", "token_type": "bearer" }
  ```

### `POST /signin`

* **Request:** same form-data as `/signup`
* **Response:** `200 OK` with JWT on success, `401 Unauthorized` on failure

### `POST /logout`

* **Auth:** Bearer token
* **Response:** `200 OK` `{ "msg": "Logged out" }`

### `GET /me`

* **Auth:** Bearer token
* **Response:** `200 OK` `{ "username": "..." }`

---

## Frontend
install next dependencies:

```bash
npm install
```
Install reCAPTCHA library:

```bash
npm install react-google-recaptcha
```

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.
