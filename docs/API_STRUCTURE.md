# API Structure Overview

## Endpoint Categories

```
/api/v1/
├── /auth/                    # Authentication
│   ├── POST /register        # User registration
│   ├── POST /login          # User login
│   └── POST /logout         # User logout
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
│   ├── GET /sku/:sku        # Get product by SKU
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
├── /orders/                  # Order management
│   ├── GET /                # Get user orders
│   ├── GET /:id             # Get order by ID
│   ├── POST /               # Create order (checkout)
│   └── PATCH /:id/status    # Update order status (admin)
│
└── /admin/                   # Admin endpoints
    ├── GET /dashboard       # Dashboard statistics
    ├── GET /orders          # Get all orders
    └── GET /analytics/products # Product analytics
```

## HTTP Methods Usage

| Method | Usage | Examples |
|--------|-------|----------|
| **GET** | Retrieve data | Get products, users, orders |
| **POST** | Create new resources | Register user, create order |
| **PUT** | Update entire resource | Update user profile, product |
| **PATCH** | Partial updates | Update stock, order status |
| **DELETE** | Remove resources | Delete user, remove cart item |

## Authentication Levels

### Public Endpoints (No Auth Required)
- `GET /products` - Browse products
- `GET /categories` - View categories
- `GET /products/:id` - View product details
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### User Endpoints (JWT Token Required)
- `GET /users/profile` - View own profile
- `PUT /users/profile` - Update own profile
- `GET /cart` - View own cart
- `POST /cart/items` - Add to cart
- `GET /orders` - View own orders
- `POST /orders` - Create order

### Admin Endpoints (Admin Role Required)
- `GET /users` - View all users
- `POST /products` - Create products
- `PUT /products/:id` - Update products
- `DELETE /products/:id` - Delete products
- `GET /admin/dashboard` - Admin dashboard
- `PATCH /orders/:id/status` - Update order status

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
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Query Parameters

### Common Parameters
- `page` - Page number for pagination
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field and direction
- `search` - Search term

### Product-Specific Parameters
- `category_id` - Filter by category
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `in_stock` - Filter by stock availability

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
| 409 | Conflict | Duplicate data (email, SKU) |
| 422 | Validation Error | Invalid data format |
| 500 | Server Error | Internal server error |

## Rate Limiting Tiers

| Tier | Requests/Hour | Endpoints |
|------|---------------|-----------|
| Public | 100 | Product browsing, auth |
| User | 1000 | User operations, cart, orders |
| Admin | 5000 | Admin operations |

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - User vs Admin permissions
- **Input Validation** - Request data validation
- **SQL Injection Protection** - Parameterized queries
- **Rate Limiting** - Prevent abuse
- **CORS** - Cross-origin resource sharing
- **HTTPS Ready** - Secure communication 