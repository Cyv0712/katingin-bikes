# Jett Lau Done Deal - Premium Bigbike Platform

A high-performance, white-label web platform designed for premium motorcycle sellers in the Philippines. Built with a focus on immersive UX, cinematic design, and transparent communication.

![Project Preview](https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1470&auto=format&fit=crop)

## 🏍️ Features

- **Inventory Showcase:** Real-time motorcycle inventory with high-resolution imagery and "Honest Notes" transparency.
- **Buyer Community:** Dedicated testimonials portal featuring 10+ cinematic "Happy Buyer" stories.
- **Direct Conversion:** Optimized for the Philippine market with integrated **WhatsApp**, **Viber**, and **Messenger** direct-action buttons.
- **Cinematic About Page:** Immersive storytelling layout detailing the brand's history and philosophy.
- **White-Label Ready:** Architectural decoupling of brand identity and logic for rapid site cloning.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, React-Bootstrap, React Icons, React Router 7.
- **Backend:** Node.js, Express, MongoDB Atlas.
- **Media:** Cloudinary for optimized image delivery.
- **Styling:** Vanilla CSS with a global CSS Variable theme system.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Cyv0712/jett-lau-done-deal.git

# Install Frontend dependencies
cd frontend
npm install

# Install Backend dependencies
cd ../backend
npm install
```

### 3. Environment Setup
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secure_secret
```

### 4. Run Locally
```bash
# Start Backend (from /backend)
npm start

# Start Frontend (from /frontend)
npm run dev
```

---

## 🎨 White-Labeling (How to Clone)

This site is designed to be rebranded for a new seller in under 5 minutes.

1.  **Change Identity:** Edit `frontend/src/data/brandConfig.js` to update the Seller Name, Slogan, and "About" narrative.
2.  **Change Theme:** Open `frontend/src/index.css` and modify the `--accent-color` (default is Orange).
3.  **Update Contact:** Edit `frontend/src/data/contactInfo.js` with the new seller's phone, email, and social links.
4.  **Isolate Backend:** Create a new MongoDB cluster and Cloudinary account, then update the `.env` file.

---

## 📄 License
Custom license for Jett Lau Done Deal. All rights reserved.
