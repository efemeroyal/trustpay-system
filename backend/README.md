# TrustPay Backend

This folder contains the TrustPay backend API server, built with Express and MongoDB. It provides authentication, payment processing, receipt generation, verification, history lookup, and analytics endpoints for the TrustPay application.

## Features

- User registration for students and admins
- JWT-based authentication and role-based access control
- Payment initiation with simulated MoMo result handling
- Receipt issuance with QR code and on-chain SBT minting support
- Receipt verification and verification history
- Student payment history and installment status
- Admin-required fee management
- Analytics dashboard data for revenue, payments, and verification status

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- Helmet, CORS, Morgan for security and logging
- QR code generation
- Hardhat (dev dependency for blockchain tasks)

## Prerequisites

- Node.js 18+ or compatible runtime
- MongoDB instance or Atlas cluster
- A `.env` file in this folder with required environment variables

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file based on the variables below.

### Required environment variables

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRE=30d
NODE_ENV=development
```

If your app integrates with external blockchain or pinning services, add additional keys as needed in your local environment.

## Running the server

Start in development mode with automatic restarts:

```bash
npm run dev
```

Start production mode:

```bash
npm start
```

The API listens on `http://localhost:5000` by default, or the value of `PORT`.

## API Overview

### Auth

- `POST /api/auth/register/student`
  - Register a new student
  - Body: `fullName`, `email`, `password`, `studentId`, `programme`, `level`

- `POST /api/auth/register/admin`
  - Register a new admin
  - Body: `fullName`, `email`, `password`, `department`

- `POST /api/auth/login`
  - Authenticate a user
  - Body: `email`, `password`
  - Returns a JWT token

- `GET /api/auth/profile`
  - Get current authenticated user profile
  - Requires `Authorization: Bearer <token>`

- `GET /api/auth/users`
  - Get all users
  - Admin only
  - Requires `Authorization: Bearer <token>`

### Payments

- `POST /api/payments/initiate`
  - Initiate a payment for a student
  - Student only
  - Body: `amount`, `paymentType`, `academicYear`, `level`, `installment`, `momoProvider`, `momoNumber`

- `GET /api/payments/my-payments`
  - Get payment history for the current student
  - Student only

### Receipts

- `GET /api/receipts/my-receipts`
  - Get receipts for the current student
  - Requires authentication

- `GET /api/receipts/all`
  - Get all receipts
  - Admin only

### Verification

- `POST /api/verify/verify`
  - Verify a receipt
  - Admin only
  - Body: `referenceNumber`, `studentId`

- `GET /api/verify/history`
  - Get verified receipt history
  - Admin only

### History

- `GET /api/history/my-history`
  - Get receipt/payment history for current student
  - Query options: `academicYear`, `paymentType`

- `GET /api/history/installments`
  - Get installment status for current student
  - Query options: `academicYear`

- `GET /api/history/student/:studentId`
  - Get history for a student by admin
  - Admin only

- `POST /api/history/required-fees`
  - Create or update required fee records
  - Admin only
  - Body: `paymentType`, `academicYear`, `level`, `requiredAmount`

- `GET /api/history/required-fees`
  - Get all required fee records
  - Admin only

### Analytics

- `GET /api/analytics`
  - Get dashboard analytics data
  - Admin only
  - Query option: `academicYear`

## Folder Structure

- `server.js` — Express app bootstrap
- `config/db.js` — MongoDB connection
- `controllers/` — Business logic for routes
- `routes/` — API route definitions
- `middleware/` — Auth, error handling, and request guards
- `models/` — Mongoose schemas
- `utils/` — Payment receipt helpers, QR generation, blockchain bridge

## Notes

- Student registration automatically creates a custodial wallet using blockchain bridge utilities.
- Payment initiation simulates MoMo payment outcome and generates a receipt only on success.
- Receipt creation includes QR code payload generation and can mint an SBT on-chain if wallet details exist.
- Admin verification marks receipts as verified and prevents duplicate verification.

## Troubleshooting

- Ensure `MONGO_URI` is valid and reachable.
- Verify `JWT_SECRET` is set and matches the value used by any connected frontend.
- If the server fails to start, check whether the port is already in use or if database connection fails.

## License

This backend is provided as part of the TrustPay system. Adjust licensing details as needed for your project.
