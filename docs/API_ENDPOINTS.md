# E-commerce REST API Endpoints

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication Endpoints

### User Registration
- **POST** `/auth/register`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "created_at": "2024-01-01T00:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  }
  ```

### User Login
- **POST** `/auth/login`
- **Description**: Authenticate user and return JWT token
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "created_at": "2024-01-01T00:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  }
  ```

### User Logout
- **POST** `/auth/logout`
- **Description**: Logout user (invalidate token)
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

### Get Current User Info
- **GET** `/auth/me`
- **Description**: Get current user's information
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "country": "USA"
    }
  }
  ```

## User Management Endpoints

### Get User Profile
- **GET** `/users/profile`
- **Description**: Get current user's profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile data

### Update User Profile
- **PUT** `/users/profile`
- **Description**: Update current user's profile
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Smith",
    "phone": "+1234567890",
    "address": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90210",
    "country": "USA"
  }
  ```
- **Response**: Updated user data

### Get All Users (Admin)
- **GET** `/users`
- **Description**: Get all users (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `page`, `limit`, `search`
- **Response**: Paginated list of users

### Get User by ID (Admin)
- **GET** `/users/:id`
- **Description**: Get specific user by ID (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User data

### Update User (Admin)
- **PUT** `/users/:id`
- **Description**: Update specific user (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: User data
- **Response**: Updated user data

### Delete User (Admin)
- **DELETE** `/users/:id`
- **Description**: Soft delete user (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

## Category Endpoints

### Get All Categories
- **GET** `/categories`
- **Description**: Get all product categories
- **Query Parameters**: `parent_id` (for subcategories)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Electronics",
        "description": "Electronic devices and accessories",
        "parent_id": null,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### Get Category by ID
- **GET** `/categories/:id`
- **Description**: Get specific category
- **Response**: Category data with products count

### Create Category (Admin)
- **POST** `/categories`
- **Description**: Create new category (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "parent_id": null
  }
  ```
- **Response**: Created category data

### Update Category (Admin)
- **PUT** `/categories/:id`
- **Description**: Update category (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Category data
- **Response**: Updated category data

### Delete Category (Admin)
- **DELETE** `/categories/:id`
- **Description**: Delete category (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

## Product Endpoints

### Get All Products
- **GET** `/products`
- **Description**: Get all products with filtering, search, and pagination
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `category_id`: Filter by category
  - `search`: Search in name/description
  - `min_price`: Minimum price filter
  - `max_price`: Maximum price filter
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "id": 1,
          "name": "iPhone 15 Pro",
          "description": "Latest iPhone with advanced features",
          "price": "999.99",
          "category_id": 1,
          "sku": "IPHONE15PRO",
          "stock_quantity": 50,
          "image_url": "https://example.com/iphone15.jpg",
          "is_active": true,
          "created_at": "2024-01-01T00:00:00.000Z",
          "updated_at": "2024-01-01T00:00:00.000Z"
        }
      ],
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

### Get Product by ID
- **GET** `/products/:id`
- **Description**: Get specific product details
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": "999.99",
      "category_id": 1,
      "sku": "IPHONE15PRO",
      "stock_quantity": 50,
      "image_url": "https://example.com/iphone15.jpg",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Create Product (Admin)
- **POST** `/products`
- **Description**: Create new product (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone with advanced features",
    "price": 999.99,
    "category_id": 1,
    "sku": "IPHONE15PRO",
    "stock_quantity": 50,
    "image_url": "https://example.com/iphone15.jpg"
  }
  ```
- **Response** (201): Created product data

### Update Product (Admin)
- **PUT** `/products/:id`
- **Description**: Update product (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Product data
- **Response**: Updated product data

### Delete Product (Admin)
- **DELETE** `/products/:id`
- **Description**: Soft delete product (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### Update Product Stock (Admin)
- **PATCH** `/products/:id/stock`
- **Description**: Update product stock quantity (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "stock_quantity": 75
  }
  ```
- **Response**: Updated stock data

## Cart Endpoints

### Get User Cart
- **GET** `/cart`
- **Description**: Get current user's cart with items and totals
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "user_id": 1,
      "items": [
        {
          "id": 1,
          "product_id": 1,
          "quantity": 2,
          "price_at_time": "999.99",
          "product": {
            "id": 1,
            "name": "iPhone 15 Pro",
            "description": "Latest iPhone with advanced features",
            "image_url": "https://example.com/iphone15.jpg",
            "price": "999.99",
            "stock_quantity": 50
          }
        }
      ],
      "total_items": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Add Item to Cart
- **POST** `/cart/items`
- **Description**: Add product to cart
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "product_id": 1,
    "quantity": 2
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "Product added to cart successfully",
    "data": {
      "id": 1,
      "cart_id": 1,
      "product_id": 1,
      "quantity": 2,
      "price_at_time": "999.99"
    }
  }
  ```

### Update Cart Item
- **PUT** `/cart/items/:id`
- **Description**: Update cart item quantity
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Response** (200): Updated cart data

### Remove Item from Cart
- **DELETE** `/cart/items/:id`
- **Description**: Remove item from cart
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Item removed from cart successfully"
  }
  ```

### Clear Cart
- **DELETE** `/cart`
- **Description**: Clear all items from cart
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Cart cleared successfully"
  }
  ```

## Order Endpoints

### Get User Orders
- **GET** `/orders`
- **Description**: Get current user's order history
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `page`, `limit`
- **Response** (200):
  ```json
  {
    "success": true,
    "orders": [
      {
        "orderId": 1,
        "orderTotal": "1999.98",
        "orderStatus": "pending",
        "items": [
          {
            "itemId": 1,
            "productId": 1,
            "productName": "iPhone 15 Pro",
            "itemPrice": "999.99",
            "quantity": 2
          }
        ]
      }
    ]
  }
  ```

### Get Order by ID
- **GET** `/orders/:orderId`
- **Description**: Get specific order details for the authenticated user
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "order": {
      "orderId": 1,
      "orderTotal": "1999.98",
      "orderStatus": "pending",
      "items": [
        {
          "itemId": 1,
          "productId": 1,
          "productName": "iPhone 15 Pro",
          "itemPrice": "999.99",
          "quantity": 2
        }
      ]
    }
  }
  ```

## Checkout Process

### Create Order from Cart
- **POST** `/cart/{cartId}/checkout`
- **Description**: Checkout the user's cart and create an order
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `cartId` - The cart ID to checkout
- **Response** (201):
  ```json
  {
    "message": "Order created successfully",
    "orderId": 1
  }
  ```

## Additional Endpoints

### Welcome Message
- **GET** `/`
- **Description**: Welcome message and server status
- **Response** (200):
  ```json
  {
    "message": "Welcome to E-commerce REST API",
    "status": "Server is running successfully!",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

### Health Check
- **GET** `/health`
- **Description**: Server health status
- **Response** (200):
  ```json
  {
    "status": "OK",
    "message": "Server is healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

### Database Test
- **GET** `/db-test`
- **Description**: Test database connection
- **Response** (200):
  ```json
  {
    "status": "OK",
    "message": "Database connection successful",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Missing or invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Duplicate data (email, username, SKU)
- **422**: Validation Error - Invalid data format
- **500**: Internal Server Error

## Authentication

### JWT Token Format
```
Authorization: Bearer <jwt_token>
```

### Token Expiration
- Access tokens expire after 24 hours
- Tokens contain user ID, username, email, and role

### Token Payload
```json
{
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## Pagination

### Standard Pagination Format
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

## Request Validation

### Required Fields
- **User Registration**: username, email, password
- **User Login**: email, password
- **Product Creation**: name, price, category_id, sku, stock_quantity
- **Cart Item**: product_id, quantity

### Validation Rules
- **Email**: Must be valid email format
- **Password**: Minimum 6 characters
- **Username**: 3-50 characters, alphanumeric
- **Price**: Must be positive number
- **Quantity**: Must be positive integer
- **SKU**: Must be unique

## API Versioning

Current version: `v1`
- All endpoints are prefixed with `/api/v1/`
- Version can be specified in headers: `Accept: application/vnd.api+json;version=1`

## Rate Limiting

Currently not implemented, but recommended:
- **Public endpoints**: 100 requests per hour
- **Authenticated endpoints**: 1000 requests per hour
- **Admin endpoints**: 5000 requests per hour

## CORS

Cross-Origin Resource Sharing is enabled for all origins:
```javascript
app.use(cors());
```

## Testing

### Test Coverage
- **Authentication**: Registration, login, logout
- **User Management**: Profile operations
- **Products**: CRUD operations, filtering, search
- **Cart**: Add, update, remove items
- **Orders**: View history and details
- **Checkout**: Complete order process

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --runInBand    # Run tests sequentially
```

## Database Schema

### Core Tables
- **users**: User accounts and profiles
- **categories**: Product categories
- **products**: Product catalog
- **carts**: Shopping carts
- **cart_items**: Items in shopping carts
- **orders**: Customer orders
- **order_items**: Items within orders

### Key Features
- **Soft Deletes**: Products and users marked as inactive
- **Audit Trails**: created_at and updated_at timestamps
- **Referential Integrity**: Foreign key constraints
- **Indexes**: Optimized for common queries
- **Triggers**: Automatic timestamp updates 