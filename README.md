# E-commerce REST API

A comprehensive, production-ready e-commerce REST API built with Node.js, Express.js, and PostgreSQL. This API provides all essential functionality for a modern e-commerce platform including user management, product catalog, shopping cart, and order processing.

## 🚀 Features

### Core Functionality
- **User Authentication & Management**
  - User registration and login with JWT tokens
  - Profile management and updates
  - Role-based access control (User/Admin)
  - Secure password hashing with bcrypt

- **Product Management**
  - Complete product catalog with categories
  - Search and filtering capabilities
  - Pagination for large datasets
  - Stock management and validation
  - Admin CRUD operations

- **Shopping Cart System**
  - Add, update, and remove cart items
  - Real-time stock validation
  - Price tracking at time of addition
  - Cart persistence and management

- **Order Processing**
  - Complete checkout workflow
  - Order history and tracking
  - Order status management
  - Secure order creation from cart

### Technical Features
- **RESTful API Design** - Following REST principles
- **Comprehensive Testing** - Full test suite with Jest and Supertest
- **Input Validation** - Request validation with express-validator
- **Error Handling** - Standardized error responses
- **Database Optimization** - Optimized PostgreSQL schema with indexes
- **Security** - JWT authentication, CORS, SQL injection protection
- **Documentation** - Complete OpenAPI 3.0.3 specification

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/economicseeker/ecommerce-app-restapi.git
   cd ecommerce-app-rest-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Set up the database:**
   ```bash
   # Create PostgreSQL database
   createdb ecommerce
   
   # Run the schema (located in database/schema.sql)
   psql -d ecommerce -f database/schema.sql
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run all tests
- `npm test -- --runInBand` - Run tests sequentially

## 🌐 API Endpoints

### Base URL
- Development: `http://localhost:3000`
- API Version: `/api/v1/`

### Core Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info

#### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users` - Get all users (admin)
- `GET /api/v1/users/:id` - Get user by ID (admin)

#### Products
- `GET /api/v1/products` - Get all products (with filters)
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product (admin)
- `PUT /api/v1/products/:id` - Update product (admin)
- `DELETE /api/v1/products/:id` - Delete product (admin)

#### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create category (admin)
- `PUT /api/v1/categories/:id` - Update category (admin)

#### Cart
- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/:id` - Update cart item
- `DELETE /api/v1/cart/items/:id` - Remove item from cart
- `DELETE /api/v1/cart` - Clear cart
- `POST /api/v1/cart/:cartId/checkout` - Checkout cart

#### Orders
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:orderId` - Get order by ID

#### System
- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /db-test` - Database connection test

## 📁 Project Structure

```
ecommerce-app-rest-api/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── swagger.yaml           # OpenAPI 3.0.3 specification
├── README.md             # Project documentation
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
│
├── config/               # Configuration files
│   └── database.js       # Database configuration
│
├── database/             # Database files
│   ├── schema.sql        # Database schema
│   └── e-commerce_database_schema.svg
│
├── docs/                 # Documentation
│   ├── API_STRUCTURE.md  # API structure overview
│   └── API_ENDPOINTS.md  # Detailed endpoint documentation
│
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication middleware
│   ├── validation.js    # Validation middleware
│   └── productValidation.js
│
├── models/              # Database models
│   ├── User.js          # User model
│   ├── Product.js       # Product model
│   ├── Category.js      # Category model
│   ├── Cart.js          # Cart model
│   └── Order.js         # Order model
│
├── routes/              # API routes
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── products.js      # Product routes
│   ├── categories.js    # Category routes
│   ├── cart.js          # Cart routes
│   ├── orders.js        # Order routes
│   └── test.js          # Test routes
│
└── tests/               # Test files
    ├── auth.test.js     # Authentication tests
    ├── user.test.js     # User management tests
    ├── product.test.js  # Product tests
    ├── cart.test.js     # Cart functionality tests
    ├── checkout.test.js # Checkout process tests
    └── order.test.js    # Order management tests
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Comprehensive request validation
- **SQL Injection Protection** - Parameterized queries
- **CORS** - Cross-origin resource sharing
- **Role-based Access** - User and admin permissions
- **Error Handling** - Secure error responses

## 🧪 Testing

The project includes a comprehensive test suite covering:

- **Authentication Tests** - Registration, login, logout
- **User Management Tests** - Profile operations
- **Product Tests** - CRUD operations, filtering, search
- **Cart Tests** - Add, update, remove items
- **Order Tests** - Order creation and retrieval
- **Checkout Tests** - Complete checkout process

Run tests with:
```bash
npm test
```

## 📚 Documentation

### API Documentation
- **Swagger/OpenAPI**: Complete specification in `swagger.yaml`
- **API Structure**: Overview in `docs/API_STRUCTURE.md`
- **API Endpoints**: Detailed documentation in `docs/API_ENDPOINTS.md`

### Viewing Documentation
1. **Swagger UI**: Upload `swagger.yaml` to [Swagger UI](https://swagger.io/tools/swagger-ui/)
2. **Swagger Editor**: Import the YAML file into [Swagger Editor](https://swagger.io/tools/swagger-editor/)

## 🗄️ Database Schema

The application uses PostgreSQL with the following core tables:
- **users** - User accounts and profiles
- **categories** - Product categories
- **products** - Product catalog
- **carts** - Shopping carts
- **cart_items** - Items in shopping carts
- **orders** - Customer orders
- **order_items** - Items within orders

Features include:
- Soft deletes for data integrity
- Audit trails with timestamps
- Optimized indexes for performance
- Foreign key constraints for data consistency

## 🔧 Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Development & Testing
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **Nodemon** - Development server
- **express-validator** - Input validation

### Documentation
- **OpenAPI 3.0.3** - API specification
- **Swagger** - API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the API specification in `swagger.yaml`
- Run tests to verify functionality
- Check the health endpoints for system status

## 🚀 Deployment

The API is ready for deployment with:
- Environment-based configuration
- Health check endpoints
- Database connection monitoring
- Comprehensive error handling
- Production-ready security features 