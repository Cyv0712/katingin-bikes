# Katingin Bikes 🏍️

**Ang Toy Kingdom ng mga Tito.**  
A premium, high-performance web application designed for a high-end pre-owned motorcycle dealership in Metro Manila. Built with a modern full-stack architecture, Katingin Bikes features an immersive "dark showroom" aesthetic, a robust custom inventory management system, and automated cloud-based media delivery.

## 🌟 Key Features

- **Immersive User Experience**: Cinematic dark-mode design with smooth scroll-triggered animations (Intersection Observer API) to highlight premium motorcycle photography.
- **Dynamic Inventory Management**: A secure Admin Dashboard allowing staff to easily add, edit, and remove motorcycle listings.
- **Automated Media Handling**: Integrated with **Cloudinary v2 SDK**. Features parallel image uploads, automatic thumbnail selection, and zero-waste storage logic (deleting a bike automatically destroys its associated cloud images).
- **Intelligent Stock Tracking**: Real-time cross-referencing between static showcase data and the live database to display accurate "Available" or "Sold Out" badges.
- **Traffic Insights**: Built-in **Vercel Web Analytics** integration to track visitor engagement and popular listings.
- **White-Label Architecture**: Designed with decoupled brand configurations (`brandConfig.js`), allowing the entire platform's identity, colors, and assets to be swapped in minutes.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** & **Vite**: For lightning-fast local development and optimized production builds.
- **React Router DOM**: Client-side routing for seamless page transitions.
- **React Bootstrap**: Responsive grid system and component structure.
- **Vercel Analytics**: Real-time traffic monitoring.

### Backend & Database
- **Node.js & Express**: Fast, lightweight REST API architecture.
- **MongoDB Atlas**: Fully managed cloud database for inventory persistence.
- **Cloudinary**: Cloud-based media storage and image optimization.
- **Multer**: Handling multipart/form-data for image uploads.

### Hosting
- **Frontend**: Hosted on [Vercel](https://vercel.com).
- **Backend**: Hosted on [Render](https://render.com).

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js installed (v18 or higher recommended)
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account for image storage

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/katingin-bikes.git
cd katingin-bikes
```

### 2. Set up the Backend
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and add the following keys:
```env
# MongoDB Connection
MONGO_URI=your_mongodb_atlas_connection_string

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=katingin-bikes/bikes

# Security
PORT=5000
```
Start the backend server:
```bash
node server.js
```

### 3. Set up the Frontend
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder and add the following keys:
```env
# Point this to your backend server
VITE_API_URL=http://localhost:5000

# Admin Access Credentials
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=your_secure_password
```
Start the Vite development server:
```bash
npm run dev
```

---

## 🎨 Modifying the Brand (White-Labeling)

To deploy a clone of this showroom for a different dealership:
1. Open `frontend/src/data/brandConfig.js`.
2. Update the `name`, `theme.accent` color, `description`, and `images` URLs.
3. The entire site (including headers, buttons, and footers) will automatically re-theme itself to match the new configuration.

---

## 🔒 License
This is a proprietary codebase built specifically for Katingin Bikes. Unauthorized distribution or copying of this repository is prohibited.
