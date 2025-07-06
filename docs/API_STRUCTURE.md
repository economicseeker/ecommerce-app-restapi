# API Structure Overview

## Project Information
- **Project Name**: E-commerce REST API
- **Version**: 1.0.0
- **Base URL**: `http://localhost:3000`
- **API Version**: `/api/v1/`
- **Documentation**: Swagger/OpenAPI 3.0.3 (`swagger.yaml`)

## Technology Stack
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Testing**: Jest with Supertest
- **Validation**: express-validator
- **CORS**: Enabled for cross-origin requests

## Endpoint Categories

```
/api/v1/
├── /auth/                    # Authentication
│   ├── POST /register        # User registration
│   ├── POST /login          # User login
│   ├── POST /logout         # User logout
│   └── GET /me              # Get current user info
│
├── /users/                   # User management
│   ├── GET /profile         # Get current user profile
│   ├── PUT /profile         # Update current user profile
│   ├── GET /                # Get all users (admin)
│   ├── GET /:id             # Get user by ID (admin)
│   ├── PUT /:id             # Update user (admin)
│   └── DELETE /:id          # Delete user (admin)
│
├── /categories/              # Category management
│   ├── GET /                # Get all categories
│   ├── GET /:id             # Get category by ID
│   ├── POST /               # Create category (admin)
│   ├── PUT /:id             # Update category (admin)
│   └── DELETE /:id          # Delete category (admin)
│
├── /products/                # Product management
│   ├── GET /                # Get all products (with filters)
│   ├── GET /:id             # Get product by ID
│   ├── POST /               # Create product (admin)
│   ├── PUT /:id             # Update product (admin)
│   ├── DELETE /:id          # Delete product (admin)
│   └── PATCH /:id/stock     # Update stock (admin)
│
├── /cart/                    # Shopping cart
│   ├── GET /                # Get user cart
│   ├── DELETE /             # Clear cart
│   ├── POST /items          # Add item to cart
│   ├── PUT /items/:itemId   # Update cart item
│   └── DELETE /items/:itemId # Remove item from cart
│
└── /orders/                  # Order management
    ├── GET /                # Get user orders
    └── GET /:orderId        # Get order by ID
```

## Additional Endpoints

```
/                           # Welcome message
/health                     # Health check
/db-test                    # Database connection test
/api/test                   # Test endpoints
```

## HTTP Methods Usage

| Method | Usage | Examples |
|--------|-------|----------|
| **GET** | Retrieve data | Get products, users, orders, cart |
| **POST** | Create new resources | Register user, create order, add to cart |
| **PUT** | Update entire resource | Update user profile, product, cart item |
| **PATCH** | Partial updates | Update stock, order status |
| **DELETE** | Remove resources | Delete user, remove cart item, clear cart |

## Authentication Levels

### Public Endpoints (No Auth Required)
- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /db-test` - Database test
- `GET /api/v1/products` - Browse products
- `GET /api/v1/categories` - View categories
- `GET /api/v1/products/:id` - View product details
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### User Endpoints (JWT Token Required)
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/users/profile` - View own profile
- `PUT /api/v1/users/profile` - Update own profile
- `GET /api/v1/cart` - View own cart
- `POST /api/v1/cart/items` - Add to cart
- `PUT /api/v1/cart/items/:id` - Update cart item
- `DELETE /api/v1/cart/items/:id` - Remove from cart
- `DELETE /api/v1/cart` - Clear cart
- `GET /api/v1/orders` - View own orders
- `GET /api/v1/orders/:id` - View specific order

### Admin Endpoints (Admin Role Required)
- `GET /api/v1/users` - View all users
- `GET /api/v1/users/:id` - View specific user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `PATCH /api/v1/products/:id/stock` - Update stock

## Response Patterns

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 100,
      "items_per_page": 10,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

## Query Parameters

### Common Parameters
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term for products

### Product-Specific Parameters
- `category_id` - Filter by category
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter

### Order-Specific Parameters
- `status` - Filter by order status
- `date_from` - Orders from date
- `date_to` - Orders to date

## Status Codes Summary

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate data (email, username, SKU) |
| 422 | Validation Error | Invalid data format |
| 500 | Server Error | Internal server error |

## Database Schema

### Core Tables
- **users** - User accounts and profiles
- **categories** - Product categories
- **products** - Product catalog
- **carts** - Shopping carts
- **cart_items** - Items in shopping carts
- **orders** - Customer orders
- **order_items** - Items within orders

### Key Features
- **Soft Deletes** - Products and users marked as inactive
- **Audit Trails** - created_at and updated_at timestamps
- **Referential Integrity** - Foreign key constraints
- **Indexes** - Optimized for common queries
- **Triggers** - Automatic timestamp updates

## Security Features

- **JWT Authentication** - Secure token-based auth (24h expiration)
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Request data validation with express-validator
- **SQL Injection Protection** - Parameterized queries
- **CORS** - Cross-origin resource sharing enabled
- **Role-based Access** - User vs Admin permissions
- **HTTPS Ready** - Secure communication ready

## Testing

### Test Coverage
- **User Authentication** - Registration, login, logout
- **Product Management** - CRUD operations, filtering, search
- **Cart Operations** - Add, update, remove items
- **Order Management** - Create orders, view history
- **API Endpoints** - All major endpoints tested

### Test Files
- `tests/auth.test.js` - Authentication tests
- `tests/user.test.js` - User management tests
- `tests/product.test.js` - Product tests
- `tests/cart.test.js` - Cart functionality tests
- `tests/checkout.test.js` - Checkout process tests
- `tests/order.test.js` - Order management tests

### Test Commands
```bash
npm test                    # Run all tests
npm test -- --runInBand    # Run tests sequentially
```

## Development Setup

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Environment Variables
```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Installation
```bash
npm install
npm run dev
```

## API Documentation

The API is documented using OpenAPI 3.0.3 specification in `swagger.yaml`. You can:

1. View the documentation using [Swagger UI](https://swagger.io/tools/swagger-ui/)
2. Import the YAML file into [Swagger Editor](https://swagger.io/tools/swagger-editor/)
3. Generate client SDKs using [Swagger Codegen](https://swagger.io/tools/swagger-codegen/) 