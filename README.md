# Smart Campus Operations Hub

## 📋 Project Overview
The **Smart Campus Operations Hub** is a comprehensive web-based management system designed to streamline university facilities, maintenance, and student services. It provides a unified platform for managing resource catalogues, facility bookings, maintenance ticketing, and real-time notifications. Built with a robust **Spring Boot REST API** and a modern **React** frontend, it ensures high performance, security, and scalability.

## ✨ Features

### Module A: Facilities & Assets Catalogue
- Full CRUD operations for campus resources (labs, lecture halls, equipment).
- Advanced search and multi-criteria filtering.
- Admin dashboard with resource statistics and availability tracking.

### Module B: Booking Management
- End-to-end booking workflow for students and faculty.
- Conflict detection to prevent double-bookings.
- Admin approval/rejection system with custom feedback.

### Module C: Maintenance & Incident Ticketing
- Incident reporting for classroom and facility issues.
- Ticket tracking with image reference support.
- Technician assignment and interactive status updates with comments.

### Module D: Notifications
- Real-time alerts for booking status and ticket updates.
- Unread notification tracking and management panel.
- Email-style notification system integrated into the UI.

### Module E: Authentication & Authorization
- Secure **OAuth 2.0 Google Sign-In** integration.
- JWT-based stateless authentication.
- Role-Based Access Control (RBAC) for Admin, Teacher, and Student roles.

## 🛠️ Technology Stack

**Backend:**
- **Java 21** (Temurin)
- **Spring Boot 3.5.x**
- **Spring Security** (OAuth 2.0 + JWT)
- **Spring Data MongoDB**
- **Maven** (Build Tool)

**Frontend:**
- **React 18**
- **React Router v6** (Navigation)
- **Axios** (API Client)
- **Tailwind CSS** (Styling)
- **React Hot Toast** (Notifications)

**Database:**
- **MongoDB Atlas** (Cloud Database)

**DevOps:**
- **GitHub Actions** (CI/CD)
- **Git** (Version Control)

## 📁 Project Structure
```text
it3030-paf-2026-smart-campus-group71/
├── backend/                 # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/smartcampus/api/
│   │   │   │   ├── controller/   # REST Endpoints
│   │   │   │   ├── service/      # Business Logic
│   │   │   │   ├── repository/   # Data Access
│   │   │   │   ├── model/        # Entities
│   │   │   │   ├── dto/          # Data Transfer Objects
│   │   │   │   ├── config/       # Security & App Config
│   │   │   │   └── exception/    # Global Error Handling
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/            # Unit & Integration Tests
│   └── pom.xml
├── frontend/                # React Web Application
│   ├── src/
│   │   ├── components/      # Reusable UI Components
│   │   ├── pages/           # View Components
│   │   ├── services/        # API Service Layer
│   │   ├── context/         # Global State Management
│   │   └── App.jsx          # Main Application Entry
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions workflow
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **JDK 21** (Temurin/AdoptOpenJDK)
- **Node.js 20+**
- **Maven 3.9+**
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/adrianAbeyrathne/it3030-paf-2026-smart-campus-group71.git
cd it3030-paf-2026-smart-campus-group71
```

2. **Backend Setup**
```bash
cd backend

# Update application.properties with your MongoDB connection string
# File: src/main/resources/application.properties

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```
Backend will start on `http://localhost:8888` (default)

3. **Frontend Setup** (Open new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```
Frontend will start on `http://localhost:3000`

### Default Users (for testing)
- **Admin:** admin@sliit.lk (Role: ADMIN)
- **User:** student@sliit.lk (Role: USER)

## 🔑 Environment Variables

Create `backend/src/main/resources/application.properties`:
```properties
# Server Configuration
server.port=8888

# MongoDB Configuration
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/smart_campus_db
spring.data.mongodb.database=smart_campus_db

# OAuth 2.0 Google Configuration
app.google.client-id=YOUR_GOOGLE_CLIENT_ID

# JWT Configuration
app.jwt.secret=your-secret-key-here
app.jwt.expiration=86400000
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
mvn test
```

### API Testing
Use Thunder Client or Postman with the provided collection.
Import collection from: `/docs/postman-collection.json`

## 📚 API Documentation

Base URL: `http://localhost:8888`

### Module A - Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create resource (ADMIN)
- `GET /api/resources/{id}` - Get resource by ID
- `PUT /api/resources/{id}` - Update resource (ADMIN)
- `DELETE /api/resources/{id}` - Delete resource (ADMIN)

### Module B - Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings (ADMIN)
- `PUT /api/bookings/{id}/review` - Approve/Reject booking (ADMIN)

### Module C - Tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets` - Get all tickets (ADMIN/TECH)
- `POST /api/tickets/{id}/comments` - Add comment

### Module D - Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark as read

### Module E - Authentication
- `POST /api/auth/google` - Google Sign-In Login
- `GET /api/users/me` - Get current user profile

## 👥 Team Contribution

**Member 1: ABEYRATHNE A M D A**
- Module A: Facilities & Assets Catalogue
- Module D: Notifications
- Module E: Role-based access control
- Frontend: Resource pages, Dashboard, Notifications

**Member 2: ATHUKORALA K A K S**
- Module B: Booking Management
- Module C: Maintenance & Incident Ticketing
- Module E: OAuth 2.0 + JWT authentication
- Frontend: Booking pages, Ticket pages

## 🔄 CI/CD Pipeline
The project uses **GitHub Actions** for continuous integration. The workflow automatically:
- ✅ Builds the backend using Maven
- ✅ Executes backend unit and integration tests
- ✅ Builds the React frontend

Workflow configuration can be found in `.github/workflows/ci.yml`.


## 🐛 Troubleshooting
- **Backend won't start:** Ensure JDK 21 is installed (`java -version`). Check if port 8888 is already in use.
- **Frontend won't start:** Try deleting `node_modules` and `package-lock.json`, then run `npm install`.
- **Database errors:** Ensure your IP is whitelisted in MongoDB Atlas and the connection string is correct.

## 📝 License
This project is developed for educational purposes as part of the **IT3030 - Programming Applications and Frameworks** course at SLIIT.

## 📧 Contact
- **Member 1: **it23679962@my.sliit.lk**
- **Member 2: **it23664562@my.sliit.lk**

---
**Maintained with diligence by Group 71 - SLIIT Faculty of Computing**
