# E-commerce Frontend (React)

This is the frontend for the E-commerce App, built with React and a modern, Airbnb-inspired UI. It connects to the backend REST API for a full-featured shopping experience.

## ✨ Features
- Browse products by category with images
- User registration, login, and authentication
- Add, update, and remove items in the cart
- Cart and checkout flows with real-time updates
- Order history with detailed order cards
- Responsive, modern design

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- Backend API running (see main README)

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
   The app will run at [http://localhost:3001](http://localhost:3001) (or the next available port).

### Environment Variables
- The frontend uses a proxy to connect to the backend at `http://localhost:3000` by default. To change this, update the `proxy` field in `package.json`.

## 🛒 Usage
- Register a new account or log in.
- Browse products by category on the homepage.
- Add products to your cart, update quantities, or remove items.
- Click the arrow in the cart to proceed to checkout.
- Complete checkout to place an order and view your order history.

## 🧑‍💻 Scripts
- `npm start` — Start the development server
- `npm run build` — Build for production
- `npm test` — Run tests

## 📦 Build & Deploy
- Run `npm run build` to create a production build in the `build/` folder.
- Deploy the contents of `build/` to your preferred static hosting provider.

## 📄 License
MIT
