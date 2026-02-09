# CompanionCare — Cloud Native Campus Assistance System

This project is a containerised campus assistance platform built using a modular service architecture. It demonstrates service separation, API communication, persistent data storage, and a working frontend interface for accessing campus services such as facility status, queue information, and reward claiming.

---

## 1. Project Setup

### 1.1 Requirements

Before running the project, ensure the following are installed:

- **Docker**
- **Docker Compose**

> **Note:** No local installation of Node.js or PostgreSQL is required. All services run fully inside Docker containers.

---

## 2. How to Run the System

### Step 1 — Clone the repository
```bash
git clone <your-repo-url>
cd companioncare
```

### Step 2 — Start all services
```bash
docker compose up --build
```

This command builds and starts all services automatically:

- `frontend`
- `backend`
- PostgreSQL database

---

## 3. System Architecture

The system follows a **3-tier cloud-native architecture**:

- **Frontend** — User interface and interaction
- **Backend** — Business logic and API processing
- **Database** — Persistent data storage (PostgreSQL)

### Architecture Flow
```
User → Frontend → Backend API → Database
```

This separation ensures:

- High cohesion within services
- Loose coupling between components
- Independent deployment capability

---

## 4. Service Endpoints

### 4.1 Backend API (port 3000)

Example endpoints:

- `GET /api/facilities` — Retrieve facility status
- `GET /api/queue` — View queue information
- `POST /api/rewards/claim` — Claim rewards
- `GET /api/users` — Retrieve user data

*(Edit based on your actual routes if different)*

---

## 5. Frontend Usage (port 5173)

Open in browser:
```
http://localhost:5173
```

### Main Features

- View facility availability
- Check queue status
- Claim campus activity rewards
- Access campus information through a simple interface

---

## 6. Advanced Features Implemented

### 6.1 Service Separation

The system is divided into independent services:

- Frontend container
- Backend container
- Database container

Each service has a single responsibility.

### 6.2 API-Based Communication

- Frontend communicates with backend through REST APIs
- Backend communicates with database through internal service networking

### 6.3 Health Checks

Database service includes health checks to ensure reliability before backend starts.

### 6.4 Fully Containerised System

All services run in isolated Docker containers with internal networking using Docker Compose.

---

## 7. Persistent Storage

The PostgreSQL database stores:

- User information
- Facility data
- Queue records
- Reward records

Data persists using Docker volumes even after container restarts.

---

## 8. Git Practices

This repository follows good version control practices:

- Clear and descriptive commit messages
- Logical commit history with appropriate granularity
- Feature-based branching strategy
- Proper `.gitignore` configuration
- Organized repository structure

### Example Commit Format (Conventional Commits)
```
feat: add reward claiming feature
fix: resolve API connection issue
docs: update README documentation
refactor: improve backend structure
```

---

## 9. Stopping the System

Stop all containers:
```bash
docker compose down
```

---

## 10. Future Improvements

- Backend auto-scaling
- API gateway integration
- Cloud deployment (AWS / Azure / GCP)
- Monitoring and logging tools

---

