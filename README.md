````md
# 🚦 SmartEye — AI Powered Smart Traffic Violation Detection System

SmartEye is a modern AI-powered traffic monitoring and violation management platform built to improve road safety, automate enforcement workflows, and support smart city infrastructure.

The system combines **Computer Vision**, **Artificial Intelligence**, **AI Microservices**, and a **full-stack web dashboard** to detect traffic violations, manage evidence, visualize analytics, and streamline reporting.

🌐 **Live Demo:**  
https://smarteyefrontend.onrender.com/

---

# 📌 Overview

With rapid urbanization and increasing vehicle density, traditional traffic monitoring systems struggle to manage modern traffic challenges efficiently.

### Manual traffic enforcement often suffers from:

- Delayed violation reporting  
- Human error  
- Limited monitoring coverage  
- Inconsistent challan processes  
- Lack of evidence management  
- Poor scalability  

### SmartEye solves these issues using a modern architecture consisting of:

- Frontend Dashboard  
- Backend REST APIs  
- MongoDB Database  
- AI Detection Service  
- Evidence Storage System  

The platform is designed for future **smart city deployment**.

---

# 🎯 Core Features

- 🚗 Traffic Violation Detection  
- 🧠 AI Powered Processing Engine  
- 📊 Real-Time Dashboard Analytics  
- 🔐 Secure Authentication System  
- 🗂️ Evidence Management  
- ⚡ Responsive Modern UI  
- ☁️ Cloud Deployment Ready  
- 📈 Search & Reports System  

---

# 🧠 AI Service Features

SmartEye includes a dedicated **ai-service** built using Python.

### Capabilities include:

- Vehicle Detection  
- Object Tracking  
- OCR Number Plate Reading  
- Video Frame Processing  
- Evidence Generation  
- Real-Time Stream Handling  
- Traffic Analytics Ready Pipeline  

---

# ⚙️ Tech Stack

## Frontend
- React.js  
- React Router  
- Axios  
- CSS / Tailwind CSS  

## Backend
- Node.js  
- Express.js  
- JWT Authentication  
- REST APIs  

## AI Service
- Python  
- FastAPI  
- OpenCV  
- YOLOv8  
- OCR Engine  
- Object Tracking  

## Database
- MongoDB Atlas / MongoDB Compass  

## Deployment
- Render  

---

# 📂 Complete Project Structure

```bash
SmartEye/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── config/
│
├── ai-service/
│   ├── app/
│   │   ├── routes/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── detector.py
│   │   ├── main.py
│   │   ├── ocr.py
│   │   ├── processing.py
│   │   ├── stream_manager.py
│   │   ├── tracker.py
│   │   └── utils.py
│   │
│   ├── evidence/
│   ├── requirements.txt
│   ├── run.bat
│   ├── setup.bat
│   └── yolov8n.pt
│
└── README.md
````

---

# 🚀 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Shourya-Yadav/SmartEye.git
cd SmartEye
```

## 2️⃣ Install Frontend

```bash
cd frontend
npm install
npm start
```

## 3️⃣ Install Backend

```bash
cd backend
npm install
npm run dev
```

## 4️⃣ Install AI Service

```bash
cd ai-service
pip install -r requirements.txt
python -m app.main
```

---

# 🔐 Environment Variables

Create `.env` inside backend:

```env
PORT=8800
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
AI_SERVICE_URL=http://localhost:8000
```

---

# 📊 Use Cases

* Smart City Traffic Monitoring
* Automated Violation Detection
* Number Plate Evidence Logging
* Traffic Authority Dashboard
* Analytics & Reports
* AI Surveillance Systems

---

# 🔮 Future Enhancements

* 🚘 Automatic E-Challan Generation
* 📹 Live CCTV Feed Integration
* 📱 Mobile App for Authorities
* ⚡ Real-Time Alerts
* 🧠 Predictive Traffic Analysis
* ☁️ Edge AI Deployment
* 🗺️ Smart Intersection Control

---

# 👨‍💻 Contributors

* Shourya Yadav
* Shreya Arya
* Shreya Jain
* Yusuf Rehan

---

# 📜 License

Developed for academic, research, and learning purposes.

---

# ⭐ Support

If you found this project useful, give it a **star** on GitHub.

```
```
