# Smart Water Quality Prediction System 💧

An end-to-end Machine Learning and Web Application designed to preprocess water quality datasets, evaluate classification algorithms, predict potability, visualize parameter metrics, and generate downloadable screening reports.

> **NOTICE:** Predictions provided by this system are automated screening results based on computational models and **MUST NOT** be used as a substitute for certified laboratory water testing.

---

## 🏗️ Architecture & Project Structure

```text
water-quality-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI application entry point
│   │   ├── config.py                 # Application settings & environment paths
│   │   ├── preprocessing.py          # Imputation, IQR capping & scaling
│   │   ├── model.py                  # ML model training, comparison & prediction
│   │   ├── schemas.py                # Pydantic v2 data models
│   │   └── utils.py                  # PDF report generator (ReportLab)
│   ├── models/                       # Checkpoint directory (.pkl / .joblib)
│   │   └── .gitkeep
│   ├── uploads/                      # Temporary CSV storage
│   ├── train_and_save.py             # Standalone offline model builder
│   └── requirements.txt              # Python backend dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx         # CSV upload & training controller
│   │   │   ├── Charts.jsx             # Recharts feature importance & accuracy charts
│   │   │   └── PredictionAndReport.jsx# Live prediction & PDF download form
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Main application dashboard view
│   │   │   └── Analytics.jsx          # Parameter descriptive statistics view
│   │   ├── services/
│   │   │   └── api.js                 # Axios API wrapper client
│   │   ├── App.js                     # Root component & navigation
│   │   ├── index.js                   # React entry point
│   │   └── index.css                  # Tailwind CSS directives
│   ├── package.json
│   └── tailwind.config.js
└── README.md
