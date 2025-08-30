# 🏍️ Motorcycle Service Booking – Frontend

This is the **React frontend** for the Motorcycle Service Booking platform.  
It provides UI for authentication, booking motorcycles, payment checkout, reviews, and analytics.

---

## 🚀 Features

- 🔑 Login & Registration
- 📊 Role-based Dashboard
- 🏍️ Browse & Book Motorcycles
- 💳 Integrated Razorpay Checkout
- 📅 Manage My Bookings
- ⭐ Leave & View Reviews
- 📈 Analytics with Charts.js
- 🌐 Deployed on Netlify

---

## 🛠️ Tech Stack

- React (CRA)
- React Router
- Context API for Auth
- Axios (with interceptor)
- Chart.js
- Razorpay Checkout.js

---

## ⚙️ Setup

### 1️⃣ Clone the repo

```bash
git clone https://github.com/jayachandran-student/bike-service-frontend.git
cd bike-service-frontend
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Create .env file
env
Copy code
REACT_APP_API_BASE=https://motorcycle-service-booking-backend-5.onrender.com
REACT_APP_RAZORPAY_KEY_ID=rzp_test_RB9ml3FDulSn8s


4️⃣ Run locally
npm start


Frontend will start at: http://localhost:3000

🌐 Deployment

Netlify: https://motorcyclebook.netlify.app

🔐 Test Login

You can register a new account or use a seeded one:

Role: Taker → can book

Role: Lister → can add motorcycles

🧪 Test Razorpay

Use Razorpay test card:

Card No: 4111 1111 1111 1111

Expiry: Any future date

CVV: 123

👨‍💻 Author

Developed by Jayachandran K
📧 Contact: jayachandran.k30@gmail.com
```
