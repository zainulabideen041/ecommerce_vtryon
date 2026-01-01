<div align="center">

# 👗 E-Commerce Virtual Try-On

**AI-Powered Virtual Clothing Try-On Platform**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.5-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <strong>Try on clothes virtually before you buy!</strong><br/>
  Upload your photo and see how any clothing item looks on you in seconds.
</p>

</div>

---

## ✨ Features

### 🛍️ E-Commerce Core
- **Product Catalog** — Browse and search products with advanced filtering
- **Shopping Cart** — Full cart management with quantity controls
- **Checkout & Payments** — Secure PayPal payment integration
- **Order Management** — Track orders and view order history
- **User Reviews** — Rate and review purchased products
- **Address Management** — Save and manage multiple addresses

### 🪄 Virtual Try-On (AI-Powered)
- **Upload Your Photo** — Upload a full-body image to try on clothes
- **Example Models** — Select from pre-loaded model images
- **Real-Time Processing** — Get virtual try-on results in 10-15 seconds
- **High-Quality Output** — AI-generated realistic clothing visualization

### 👔 Admin Dashboard
- **Product Management** — Add, edit, and delete products
- **Order Processing** — View and update order statuses
- **Image Gallery** — Manage example clothes and model images
- **Feature Banners** — Control homepage featured content

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Redux Toolkit, React Router |
| **Styling** | Tailwind CSS, Radix UI Components |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens) |
| **Storage** | Cloudinary (Image uploads) |
| **Payments** | PayPal REST SDK |
| **AI/ML** | RapidAPI Try-On Diffusion API |
| **Deployment** | Vercel (Frontend & Backend) |

---

## 📁 Project Structure

```
App Code/
├── FRONTEND/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components & routes
│   │   ├── store/            # Redux state management
│   │   ├── config/           # Configuration files
│   │   └── lib/              # Utility functions
│   ├── public/               # Static assets
│   └── package.json
│
├── BACKEND/                  # Express.js Backend
│   ├── controllers/          # Request handlers
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API route definitions
│   ├── helpers/              # Utility functions
│   ├── server.js             # Entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB** database (local or MongoDB Atlas)
- **Cloudinary** account (for image uploads)
- **PayPal Developer** account (for payments)
- **RapidAPI** account (for Virtual Try-On API)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/ecommerce-virtual-tryon.git
cd ecommerce-virtual-tryon
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd BACKEND

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure `BACKEND/.env`:**

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
```

```bash
# Start the backend server
npm start
```

The backend will run on `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd FRONTEND

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure `FRONTEND/.env`:**

```env
VITE_API_URL=http://localhost:5000
```

```bash
# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 🔑 API Keys Setup

### RapidAPI (Virtual Try-On)

1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to [Try-On Diffusion API](https://rapidapi.com/try-on-diffusion/api/try-on-diffusion)
3. Copy your API key
4. Update the key in `FRONTEND/src/pages/tryOnPage.jsx` (line 87)

### Cloudinary (Image Storage)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add to backend `.env` file

### PayPal (Payments)

1. Create a [PayPal Developer](https://developer.paypal.com/) account
2. Create sandbox accounts for testing
3. Get Client ID and Secret
4. Add to backend `.env` file

### MongoDB

1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster OR use local MongoDB
2. Get the connection string
3. Add to backend `.env` file as `MONGODB_URI`

---

## 📜 Available Scripts

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend

| Script | Description |
|--------|-------------|
| `npm start` | Start server with nodemon |

---

## 🛡️ Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PAYPAL_CLIENT_ID` | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret |
| `PAYPAL_MODE` | PayPal mode (sandbox/live) |

### Frontend `.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

---

## 🎯 Virtual Try-On Requirements

For best results when using the Virtual Try-On feature:

- **Image Size**: Minimum 700x1000 pixels
- **Image Type**: Full-body photos work best
- **Clothing Type**: Currently optimized for upper-body garments
- **Processing Time**: Approximately 10-15 seconds per try-on

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Zain Ul Abideen**

---

<div align="center">
  <p>Made with ❤️ for the Final Year Project</p>
</div>
