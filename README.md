# Katingin Bikes 🏍️

A premium, high-performance web application designed for a high-end pre-owned motorcycle dealership in Metro Manila. Built with a modern full-stack architecture, Katingin Bikes features an immersive "dark showroom" aesthetic, a robust custom inventory management system, and automated cloud-based media delivery.

## 🌟 Key Features

- **Immersive User Experience**: Cinematic dark-mode design with smooth scroll-triggered animations (Intersection Observer API) to highlight premium motorcycle photography.
- **Dynamic Inventory Management**: A secure Admin Dashboard allowing staff to easily add, edit, and remove motorcycle listings.
- **Automated Media Handling**: Bike photos are optimized and stored on the API server under `backend/uploads/` (legacy Cloudinary URLs still render if present).
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
- **Multer + Sharp**: Multipart uploads, resized to WebP on disk.

### Hosting
- **Frontend**: [Vercel](https://vercel.com). Production deploys from `main`; staging deploys from `staging`.
- **Backend**: Node/Express API with disk uploads. Production and staging each need their own process and Mongo database — see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Git workflow

`main` is production. `staging` is the integration branch. New work goes on `feature/*` or `fix/*` branches, PRs into `staging`, then a PR from `staging` into `main` to ship.

Ideas and bugs are GitHub Issues on a Project board (Backlog → Done). How to file issues, name branches, and set up staging is in [CONTRIBUTING.md](CONTRIBUTING.md). Do not push straight to `main`.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js installed (v18 or higher recommended)
- MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/Cyv0712/katingin-bikes.git
cd katingin-bikes
```

### 2. Set up the Backend
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and fill in at least:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/katinginbikes
CORS_ORIGIN=http://localhost:5173
ADMIN_PASSWORD_HASH=your_secure_bcrypt_hash
JWT_SECRET=your_secure_jwt_secret_key
```

Generate `ADMIN_PASSWORD_HASH` with `npm run generate-hash` in `backend/`. Start the API:

```bash
node server.js
```

### 3. Set up the Frontend
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
```

Admin login is handled by the API (JWT + `ADMIN_PASSWORD_HASH`). There are no `VITE_ADMIN_*` variables.

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
