# E-commerce REST API

A fully-functional e-commerce REST API built with Express.js, Node.js, and PostgreSQL.

## Features

- User authentication (register/login)
- Product management (CRUD operations)
- User account management
- Shopping cart functionality
- Order processing and management
- API documentation with Swagger

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-app-rest-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
PORT=3000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (to be implemented)

## API Endpoints

### Base URL
- Development: `http://localhost:3000`

### Health Check
- `GET /health` - Check server status

### Welcome
- `GET /` - Welcome message

## Project Structure

```
ecommerce-app-rest-api/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── README.md         # Project documentation
└── .env.example      # Environment variables template
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Documentation**: Swagger/OpenAPI
- **Development**: Nodemon 