# Consultation Recording Manager

A full-stack web application for managing client consultation recordings. Upload audio/video files, store metadata, search and filter recordings, and manage your consultation library from a professional dashboard.

## Features

- **Authentication** — User registration, login, and JWT-protected routes
- **Dashboard** — Total recordings, recent uploads, category breakdown, monthly stats
- **Recording Management** — Upload, view, search, filter, download, and delete recordings
- **File Upload** — Supports mp3, wav, mp4, mov with size validation and progress indicator
- **Responsive UI** — Works on desktop, tablet, and mobile
- **Toast Notifications** — Success and error feedback throughout the app

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React.js, React Router, Axios       |
| Backend  | Node.js, Express.js, Multer         |
| Database | MongoDB with Mongoose               |
| Auth     | JWT (JSON Web Tokens)               |

## Project Structure

```
consultation-recording-manager/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile
│   │   └── recordingController.js # CRUD + stats
│   ├── middleware/
│   │   ├── auth.js               # JWT protection
│   │   └── upload.js             # Multer file upload config
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Recording.js          # Recording schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   └── recordingRoutes.js    # /api/recordings routes
│   ├── uploads/                  # Stored recording files
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # Auth & Toast context
│   │   ├── pages/                # Route pages
│   │   ├── services/             # API service layer
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── package.json                  # Root scripts (concurrently)
├── README.md
└── AI_USAGE.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)
- npm (comes with Node.js)

## Setup Instructions

### 1. Clone and install dependencies

```bash
cd "Humara Pandit"
npm install
npm run install-all
```

Or install manually:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

**Backend** — Copy the example env file and edit values:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/consultation_recordings
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=104857600
CLIENT_URL=http://localhost:3000
```

**Frontend** — Copy the example env file:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

> **MongoDB Atlas:** Replace `MONGODB_URI` with your Atlas connection string when provided.

### 3. Start MongoDB

Ensure MongoDB is running locally, or use a cloud Atlas cluster.

```bash
# Windows (if installed as service, it may already be running)
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community
```

### 4. Run the application

From the project root:

```bash
npm run dev
```

This starts:
- **Backend API** at `http://localhost:5000`
- **Frontend app** at `http://localhost:3000`

### 5. Create an account

1. Open `http://localhost:3000`
2. Click **Create one** on the login page
3. Register with your name, email, and password
4. You will be redirected to the dashboard

## API Documentation

Base URL: `http://localhost:5000/api`

All recording endpoints require a JWT token in the header:

```
Authorization: Bearer <your_token>
```

### Authentication

#### Register

```
POST /api/auth/register
```

**Body (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
    "token": "eyJhbG..."
  }
}
```

#### Login

```
POST /api/auth/login
```

**Body (JSON):**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):** Same shape as register.

#### Get Current User

```
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <token>`

---

### Recordings

#### Create Recording

```
POST /api/recordings
```

**Headers:** `Authorization: Bearer <token>`  
**Content-Type:** `multipart/form-data`

| Field              | Type   | Required |
|--------------------|--------|----------|
| file               | File   | Yes      |
| clientName         | String | Yes      |
| title              | String | Yes      |
| consultationDate   | Date   | Yes      |
| category           | String | Yes      |
| notes              | String | No       |

**Allowed file types:** mp3, wav, mp4, mov  
**Max file size:** 100MB (configurable via `MAX_FILE_SIZE`)

#### Get All Recordings

```
GET /api/recordings
```

**Query parameters:**

| Param    | Description                          |
|----------|--------------------------------------|
| search   | Search by client name or title       |
| category | Filter by category                   |
| sort     | `asc` or `desc` (by upload date)     |
| page     | Page number (default: 1)             |
| limit    | Items per page (default: 50)         |

#### Get Dashboard Stats

```
GET /api/recordings/stats
```

Returns total recordings, uploads this month, recent uploads, and category breakdown.

#### Get Recording by ID

```
GET /api/recordings/:id
```

#### Update Recording

```
PUT /api/recordings/:id
```

**Body (JSON):** Any of `clientName`, `title`, `consultationDate`, `notes`, `category`

#### Delete Recording

```
DELETE /api/recordings/:id
```

Deletes the recording and its file from disk.

---

### Health Check

```
GET /api/health
```

## Database Schemas

### User

| Field    | Type   | Description        |
|----------|--------|--------------------|
| name     | String | User's full name   |
| email    | String | Unique email       |
| password | String | Hashed password    |

### Recording

| Field            | Type     | Description                    |
|------------------|----------|--------------------------------|
| clientName       | String   | Client name                    |
| title            | String   | Consultation title             |
| consultationDate | Date     | Date of consultation           |
| notes            | String   | Optional notes                 |
| category         | String   | Category enum                  |
| fileName         | String   | Stored file name               |
| fileUrl          | String   | Public URL to file             |
| fileSize         | Number   | File size in bytes             |
| mimeType         | String   | MIME type                      |
| uploadedBy       | ObjectId | Reference to User              |
| createdAt        | Date     | Auto-generated upload timestamp|

**Categories:** General, Follow-up, Initial Consultation, Therapy, Legal, Medical, Other

## Scripts

| Command              | Description                              |
|----------------------|------------------------------------------|
| `npm run dev`        | Start backend + frontend in development  |
| `npm run install-all`| Install root, backend, and frontend deps |
| `npm start`          | Start both in production mode            |
| `npm run build`      | Build frontend for production            |

## Production Notes

- Set a strong, unique `JWT_SECRET` in production
- Use MongoDB Atlas or a managed MongoDB instance
- Serve the React build via a static host or reverse proxy
- Consider cloud storage (S3, etc.) for uploads instead of local disk
- Enable HTTPS in production

## License

MIT
