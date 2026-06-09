# 🌍 Safarian CRM

<div align="center">

![MERN](https://img.shields.io/badge/MERN-FullStack-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-success)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Socket.IO](https://img.shields.io/badge/Socket.IO-RealTime-black)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)

A modern Role-Based CRM & Workforce Management System built with the MERN Stack.

Designed to streamline employee management, task assignment, attendance tracking, work reporting, and team collaboration through real-time communication and analytics.

</div>

---

# 🚀 Live Demo

### Frontend
Coming Soon

### Backend API
Coming Soon

---

# 📖 Project Overview

Safarian CRM is a comprehensive workforce and task management platform developed to help organizations efficiently manage teams, monitor employee performance, track attendance, and streamline project workflows.

The application provides role-based access control for different organizational levels:

- 👑 Boss
- 🧑‍💼 Team Leader
- 👨‍💻 Worker

Each role receives a customized dashboard and permissions based on organizational responsibilities.

The platform includes real-time updates using Socket.IO, analytics dashboards, task workflow management, daily reporting systems, attendance monitoring, and secure authentication.

---

# ✨ Key Features

## 🔐 Authentication & Security

- JWT Authentication
- Protected Routes
- Role-Based Authorization
- Change Password Functionality
- Secure Session Management

---

## 👥 Team & Employee Management

- Create Teams
- Manage Team Leaders
- Employee Assignment
- Employee Profile Management
- Department Organization

---

## 📋 Task Management

- Create Tasks
- Assign Tasks
- Set Deadlines
- Track Progress
- Task Status Monitoring

---

## 📌 Kanban Workflow Board

- Drag & Drop Workflow
- To Do
- In Progress
- Review
- Completed

Visual project tracking for teams.

---

## 📅 Attendance Management

- Mark Attendance
- Daily Attendance Records
- Attendance History
- Team Attendance Tracking

---

## 📝 Daily Work Reports

- Submit Daily Reports
- Track Work Progress
- Manager Review System
- Historical Report Records

---

## 📂 Submission Management

- File Upload Support
- Task Deliverables
- Submission Tracking
- Review Workflow

---

## 🔔 Notification System

- Task Assignment Notifications
- Status Change Updates
- Activity Alerts
- Real-Time Event Updates

---

## ⚡ Real-Time Collaboration

Powered by Socket.IO

Features:

- Instant Updates
- Live Activity Monitoring
- Real-Time Notifications
- Dynamic Dashboard Refresh

---

## 📊 Analytics Dashboard

- Employee Performance Metrics
- Attendance Statistics
- Task Completion Analytics
- Team Productivity Insights
- Organizational Overview

---

# 🏗️ System Architecture

```text
Frontend (React + Tailwind)
            │
            ▼
REST API + Socket.IO
            │
            ▼
Backend (Node.js + Express)
            │
            ▼
MongoDB Database
            │
            ▼
Cloudinary Storage
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Tailwind CSS
- Zustand
- React Query
- Framer Motion
- Axios

## Backend

- Node.js
- Express.js
- JWT Authentication
- Socket.IO
- Multer

## Database

- MongoDB
- Mongoose

## Cloud Services

- Cloudinary

## Version Control

- Git
- GitHub

---

# 👨‍💼 User Roles

## 👑 Boss

Full Administrative Access

### Permissions

- Manage Teams
- Manage Employees
- Create Tasks
- View Analytics
- Track Attendance
- Review Reports
- Monitor Activity Timeline

---

## 🧑‍💼 Team Leader

Team Management Access

### Permissions

- Assign Tasks
- Track Team Progress
- Review Reports
- Monitor Attendance
- Manage Assigned Employees

---

## 👨‍💻 Worker

Execution Access

### Permissions

- View Assigned Tasks
- Update Task Status
- Submit Reports
- Upload Deliverables
- Mark Attendance

---

# 📂 Project Structure

```text
safarian-crm/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   └── services/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── sockets/
│
├── docs/
│   └── screenshots/
│
├── .env.example
├── README.md
└── package.json
```

---

# 📸 Screenshots

## Login Page

![Login](docs/screenshots/login.png)

---

## Dashboard

![Dashboard](docs/screenshots/dashboard.png)

---

## Kanban Board

![Kanban](docs/screenshots/kanban.png)

---

## Attendance System

![Attendance](docs/screenshots/attendance.png)

---

## Analytics Dashboard

![Analytics](docs/screenshots/analytics.png)

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/myanmolwork/safarian-crm.git
```

```bash
cd safarian-crm
```

---

# Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside server folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

Run Backend

```bash
npm run dev
```

---

# Frontend Setup

```bash
cd client
npm install
```

Run Frontend

```bash
npm run dev
```

---

# 🔌 API Overview

## Authentication

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/change-password
```

---

## Employees

```http
GET /api/employees
POST /api/employees
PUT /api/employees/:id
DELETE /api/employees/:id
```

---

## Tasks

```http
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

---

## Attendance

```http
GET /api/attendance
POST /api/attendance
```

---

## Reports

```http
GET /api/reports
POST /api/reports
```

---

# 🔒 Environment Variables

## Backend

```env
PORT=
MONGO_URI=
JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CLIENT_URL=
```

---

# 🚀 Deployment

## Frontend

- Vercel

## Backend

- Render

## Database

- MongoDB Atlas

---

# 🎯 Future Improvements

- Email Notifications
- Password Reset via Email
- Audit Logs
- Dark Mode
- Export Reports (PDF/CSV)
- Advanced Search & Filtering
- Docker Support
- CI/CD Pipeline
- Unit Testing
- Multi-Tenant Architecture

---

# 📈 Project Highlights

✔ Full-Stack MERN Application

✔ Real-Time Communication using Socket.IO

✔ Role-Based Access Control (RBAC)

✔ State Management using Zustand

✔ Server State Management using React Query

✔ Cloud-Based File Uploads via Cloudinary

✔ Analytics & Reporting Dashboard

✔ Modern Responsive UI

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork the project and submit pull requests.

---

# 👨‍💻 Author

### Anmol Nagar

Computer Science Graduate | MERN Stack Developer

GitHub: https://github.com/myanmolwork

LinkedIn: Add Your LinkedIn Profile

Portfolio: Add Your Portfolio Link

---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

It helps the project reach more developers and supports future improvements.

---
