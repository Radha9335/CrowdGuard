# 🚨 CrowdGuard — AI-Powered Real-Time Incident Reporting Platform

<div align="center">

![CrowdGuard Banner](https://img.shields.io/badge/CrowdGuard-AI%20Powered-purple?style=for-the-badge&logo=shield&logoColor=white)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Analysis-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)

**A full-stack real-time incident reporting platform powered by Gemini AI, featuring live maps, smart analytics, and role-based access control.**

[🌐 Live Demo](#) • [📸 Screenshots](#-screenshots) • [🚀 Quick Start](#-quick-start) • [✨ Features](#-features)

</div>

---

## 🎯 Problem Statement

Communities face a major challenge when it comes to reporting and tracking local incidents — accidents, fires, crimes, floods — in real time. Traditional reporting systems are slow, not accessible, and lack intelligent analysis.

**CrowdGuard** solves this by giving citizens a platform to instantly report incidents, get AI-powered analysis, view live incident maps, and allow administrators to manage and respond efficiently.

---

## ✨ Features

### 👤 User Features
- 📍 **Report Incidents** — Submit incidents with title, description, location, photo upload
- 🤖 **AI Severity Detection** — Gemini AI automatically analyzes and assigns severity (Low / Medium / High)
- 🚨 **SOS Emergency Alert** — One-click emergency button that instantly notifies all users in real time
- 📍 **Auto Location Detection** — Browser geolocation with reverse geocoding using Nominatim API
- 👍 **Upvote System** — Upvote incidents to increase their credibility
- 💬 **Comment System** — Add and delete comments on any incident
- 👤 **My Incidents Tab** — View personal incident history
- 🔔 **Real-Time Notifications** — Live bell notifications for new incidents and status updates

### 🗺️ Map Features
- 📍 **Cluster View** — Markers group together when zoomed out, expand on click
- 🔥 **Heat Map** — Visualize incident density with severity-weighted intensity (blue → yellow → red)
- 🎛️ **Map Filters** — Filter incidents by severity and status directly on the map

### 🤖 AI Features
- 🧠 **Gemini AI Analysis** — Each incident gets automatically analyzed for category, severity, emergency level, and recommended actions
- 💬 **AI Chatbot** — Floating chatbot widget powered by Gemini AI, aware of all recent incidents
- 📊 **Smart Analytics** — AI-driven charts showing trends, top reporters, hotspot locations

### 🛡️ Admin Features
- 📊 **Analytics Dashboard** — Advanced charts: 14-day trend line, severity pie chart, status bar chart
- 🏆 **Top Reporters** — See which users report the most incidents
- 📍 **Top Locations** — Identify incident hotspots
- 📅 **Date Range Filter** — Filter incidents between any two dates
- 📥 **Export CSV** — Download all filtered incidents as a spreadsheet
- 📄 **Export PDF Report** — Generate a professional printable report with stats and full incident table
- 🔄 **Status Management** — Update incident status (Pending → Verified → Resolved)
- 🗑️ **Delete Incidents** — Remove false or duplicate reports

### 🔐 Security Features
- 🔑 **JWT Authentication** — Secure login with JSON Web Tokens
- 👮 **Role-Based Access Control** — Separate user and admin roles
- 🚦 **Rate Limiting** — Prevents brute force attacks on auth endpoints
- 🔒 **Protected Routes** — Frontend route guards for user and admin pages

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Real-Time** | Socket.io |
| **AI** | Google Gemini AI, OpenRouter API |
| **Maps** | Leaflet.js, React-Leaflet, Leaflet.markercluster, Leaflet.heat |
| **Charts** | Recharts |
| **Auth** | JWT, bcryptjs |
| **File Upload** | Multer |
| **HTTP Client** | Axios |

---

## 📁 Project Structure

```
CrowdGuard/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Register & Login
│   │   ├── incidentController.js   # CRUD + upvote + comments
│   │   └── adminController.js      # Dashboard stats
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT protect + adminOnly
│   │   ├── errorMiddleware.js      # Global error handler
│   │   └── uploadMiddleware.js     # Multer file upload
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   └── Incident.js             # Incident + comments + upvotes
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── incidentRoutes.js
│   │   ├── adminRoutes.js
│   │   └── aiRoutes.js
│   ├── services/
│   │   ├── geminiService.js        # Gemini AI integration
│   │   └── openRouterService.js    # OpenRouter AI integration
│   └── server.js                   # Express + Socket.io server
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ChatBot.jsx          # Floating AI chatbot
│       │   ├── IncidentCharts.jsx   # Dashboard charts
│       │   ├── MapView.jsx          # Leaflet map with cluster + heat
│       │   ├── ProtectedRoute.jsx   # Auth guard
│       │   └── AdminRoute.jsx       # Admin guard
│       ├── pages/
│       │   ├── Home.jsx             # Landing page
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx        # Main user dashboard
│       │   ├── AdminDashboard.jsx   # Admin panel
│       │   └── Profile.jsx
│       └── services/
│           └── api.js               # Axios instance with interceptor
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gemini API Key ([Get here](https://ai.google.dev/))
- OpenRouter API Key ([Get here](https://openrouter.ai/))

### 1. Clone the repository

```bash
git clone https://github.com/Radha9335/CrowdGuard.git
cd CrowdGuard
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000
```

Start the backend:

```bash
node server.js
```

### 3. Setup Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser

```
http://localhost:5173
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI fallback |
| `PORT` | Backend server port (default: 5000) |

---

## 📸 Screenshots

### 🏠 Landing Page
> Hero section with feature cards and stats

### 📊 User Dashboard
> Report form, real-time stats, charts, interactive map, incident feed with comments and upvotes

### 🗺️ Incident Map
> Cluster view and heat map with severity/status filters

### 🛡️ Admin Dashboard
> Full analytics with 14-day trend, top reporters, top locations, CSV/PDF export

### 🤖 AI Chatbot
> Floating chatbot with real incident context awareness

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Incidents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | Get all incidents (paginated) |
| POST | `/api/incidents` | Create incident (auth required) |
| GET | `/api/incidents/my` | Get my incidents |
| PUT | `/api/incidents/:id` | Update incident |
| DELETE | `/api/incidents/:id` | Delete incident |
| PUT | `/api/incidents/:id/status` | Update status (admin only) |
| PUT | `/api/incidents/:id/upvote` | Toggle upvote |
| POST | `/api/incidents/:id/comments` | Add comment |
| DELETE | `/api/incidents/:id/comments/:commentId` | Delete comment |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get dashboard statistics |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/ask` | Ask AI chatbot a question |

---

## 🔄 Real-Time Events (Socket.io)

| Event | Description |
|-------|-------------|
| `newIncident` | Emitted when a new incident is reported |
| `statusUpdated` | Emitted when admin updates incident status |
| `sosAlert` | Emitted when SOS or critical incident is reported |

---

## 👥 Default Roles

| Role | Access |
|------|--------|
| `user` | Report, upvote, comment, view map |
| `admin` | All user features + status management, delete, analytics, export |

To make a user admin, update their role in MongoDB:
```
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'feat: Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ by [Radha](https://github.com/Radha9335)**

⭐ Star this repo if you found it helpful!

</div>