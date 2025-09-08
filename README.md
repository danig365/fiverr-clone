# Fiverr Clone (Django + React)

A full-stack Fiverr-like marketplace application built with **Django REST Framework** (backend) and **React + Vite** (frontend).
Features include authentication, gigs, orders, chat, notifications, and payments.

---

## 📂 Project Structure

```
fiverr-clone/
│
├── backend/       # Django REST Framework API
│   ├── users/     # Authentication & user management
│   ├── gigs/      # Gigs & thumbnails
│   ├── orders/    # Order management
│   ├── chat/      # Messaging system
│   ├── payments/  # Payment integration
│   ├── notifications/ # Notifications system
│   └── fiverrBackend/ # Django project settings
│
├── frontend/      # React (Vite) app
│   ├── src/       # Pages, components, API handlers
│   └── public/
│
└── README.md      # Project documentation
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/fiverr-clone.git
cd fiverr-clone
```

---

### 2. Backend Setup (Django)

1. Go to backend folder:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Create superuser (for Django admin):

   ```bash
   python manage.py createsuperuser
   ```

6. Start the Django server:

   ```bash
   python manage.py runserver
   ```

   Backend will run at: **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

### 3. Frontend Setup (React)

1. Open a new terminal, go to frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   Frontend will run at: **[http://localhost:5173/](http://localhost:5173/)**

---

### 4. Environment Variables

⚠️ Each user must create their own `.env` files with their own keys and credentials.

* **Backend (`backend/.env`)** — example values:

  ```
  SECRET_KEY=your-own-django-secret-key
  DEBUG=True
  ALLOWED_HOSTS=127.0.0.1,localhost
  FRONTEND_HOST=http://localhost:5173

  EMAIL_FROM=your-email@example.com
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@example.com
  SMTP_PASS=your-app-password

  ACCESS_TOKEN_LIFETIME=300
  REFRESH_TOKEN_LIFETIME=86400
  EMAIL_TOKEN_MAX_AGE=3600
  PASSWORD_RESET_TOKEN_MAX_AGE=3600

  STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
  STRIPE_SECRET_KEY=your-stripe-secret-key
  STRIPE_ENDPOINT_SECRET=your-stripe-endpoint-secret
  ```

* **Frontend (`frontend/.env`)** — example values:

  ```
  VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
  VITE_API_BASE_URL=http://127.0.0.1:8000/api
  ```

➡️ Replace the above values with your own credentials. Do **not** commit real keys or passwords to GitHub.

---

## 🛠 Tech Stack

* **Backend:** Django, Django REST Framework, SQLite (dev)
* **Frontend:** React, Vite, Axios
* **Auth:** JWT authentication
* **Payments:** Stripe/PayPal integration (if configured)

---

## 📜 Scripts

* Run backend:

  ```bash
  cd backend
  python manage.py runserver
  ```

* Run frontend:

  ```bash
  cd frontend
  npm run dev
  ```

---

## 📌 Notes

* Do **not commit `.env`, `db.sqlite3`, `media/`, or `node_modules/`** (already excluded in `.gitignore`).
* Production setup will require configuring **PostgreSQL/MySQL**, **Nginx/Gunicorn**, and environment variables.

---

## 📄 License

This project is for learning and demonstration purposes.
