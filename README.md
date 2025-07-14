# E-commerce App (Full Stack)

A modern, production-ready e-commerce platform with a Node.js/Express/PostgreSQL backend and a React frontend. Features a beautiful, Airbnb-inspired UI, robust authentication, cart and checkout flows, and a complete order history.

---

## 🚀 Features

### User Experience
- Register, log in, and manage your account
- Browse products by category with images
- Add, update, and remove items in your cart
- Seamless checkout and order placement
- View detailed order history
- Responsive, modern design

### Backend (Node.js/Express/PostgreSQL)
- JWT authentication and secure password hashing
- RESTful API with full CRUD for products, categories, cart, and orders
- Role-based access (user/admin)
- Comprehensive validation and error handling
- Optimized PostgreSQL schema with indexes and audit trails
- Full test suite with Jest and Supertest
- OpenAPI/Swagger documentation

### Frontend (React)
- Modern, Airbnb-inspired UI
- Category-based product browsing
- Cart and checkout flows with real-time updates
- Order history with detailed cards
- Responsive and mobile-friendly

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)

### Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables in `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce
   JWT_SECRET=your_jwt_secret_here
   ```
3. Set up the database:
   ```bash
   createdb ecommerce
   psql -d ecommerce -f database/schema.sql
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Go to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   npm start
   ```
   The app will run at [http://localhost:3001](http://localhost:3001) (or the next available port).

---

## 🌐 API Endpoints (Backend)
See [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md) and [swagger.yaml](swagger.yaml) for full details.

---

## 🧪 Testing
- Run backend tests with `npm test` in the root directory.
- Run frontend tests with `npm test` in the `frontend/` directory.

---

## 📦 Deployment
- Build the frontend with `npm run build` in `frontend/` and deploy the `build/` folder to your static host.
- Deploy the backend to your preferred Node.js host (Render, Heroku, etc.).
- Set environment variables for production as needed.

---

## 📄 License
MIT 