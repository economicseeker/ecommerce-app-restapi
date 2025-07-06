# E-commerce REST API Endpoints

## Base URL
```
http://localhost:3000/api
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
- **Response**: User data (without password)

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
- **Response**: JWT token and user data

### User Logout
- **POST** `/auth/logout`
- **Description**: Logout user (invalidate token)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

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
- **Response**: List of categories

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
- **Description**: Get all products with filtering
- **Query Parameters**:
  - `category_id`: Filter by category
  - `search`: Search in name/description
  - `min_price`: Minimum price filter
  - `max_price`: Maximum price filter
  - `page`: Page number for pagination
  - `limit`: Items per page
  - `sort`: Sort by (price_asc, price_desc, name_asc, name_desc, newest)
- **Response**: Paginated list of products

### Get Product by ID
- **GET** `/products/:id`
- **Description**: Get specific product details
- **Response**: Product data with category info

### Get Product by SKU
- **GET** `/products/sku/:sku`
- **Description**: Get product by SKU
- **Response**: Product data

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
- **Response**: Created product data

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
- **Description**: Get current user's cart
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Cart with items and totals

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
- **Response**: Updated cart data

### Update Cart Item
- **PUT** `/cart/items/:itemId`
- **Description**: Update cart item quantity
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Response**: Updated cart data

### Remove Item from Cart
- **DELETE** `/cart/items/:itemId`
- **Description**: Remove item from cart
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Updated cart data

### Clear Cart
- **DELETE** `/cart`
- **Description**: Clear all items from cart
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

## Order Endpoints

### Get User Orders
- **GET** `/orders`
- **Description**: Get current user's order history
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `page`, `limit`, `status`
- **Response**: Paginated list of orders

### Get Order by ID
- **GET** `/orders/:id`
- **Description**: Get specific order details
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Order data with items

### Create Order (Checkout)
- **POST** `/orders`
- **Description**: Create new order from cart
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "shipping_address": "123 Main St, City, State 12345",
    "billing_address": "123 Main St, City, State 12345",
    "payment_method": "credit_card",
    "notes": "Please deliver after 6 PM"
  }
  ```
- **Response**: Created order data

### Update Order Status (Admin)
- **PATCH** `/orders/:id/status`
- **Description**: Update order status (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "status": "shipped",
    "tracking_number": "1Z999AA1234567890"
  }
  ```
- **Response**: Updated order data

### Get All Orders (Admin)
- **GET** `/admin/orders`
- **Description**: Get all orders (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `page`, `limit`, `status`, `user_id`
- **Response**: Paginated list of orders

## Admin Endpoints

### Dashboard Statistics
- **GET** `/admin/dashboard`
- **Description**: Get admin dashboard statistics
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Sales, orders, users, products statistics

### Product Analytics
- **GET** `/admin/analytics/products`
- **Description**: Get product sales analytics
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `period` (daily, weekly, monthly, yearly)
- **Response**: Product performance data

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict (e.g., duplicate email)
- **422**: Validation Error
- **500**: Internal Server Error

## Authentication

### JWT Token Format
```
Authorization: Bearer <jwt_token>
```

### Token Expiration
- Access tokens expire after 24 hours
- Refresh tokens expire after 7 days

## Pagination

### Standard Pagination Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Rate Limiting

- **Public endpoints**: 100 requests per hour
- **Authenticated endpoints**: 1000 requests per hour
- **Admin endpoints**: 5000 requests per hour

## API Versioning

Current version: `v1`
- All endpoints are prefixed with `/api/v1/`
- Version can be specified in headers: `Accept: application/vnd.api+json;version=1` 