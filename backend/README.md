# TrustPay Backend

This folder contains the TrustPay backend API server for the student fee and receipt platform. The service is built with Express, MongoDB, and a WebSocket layer for live updates between the backend, students, and admin users.

## Features

- Student and admin registration with JWT authentication
- Role-based access control for student and admin flows
- Mobile-money payment initiation through Fapshi using Axios
- Receipt generation with QR payloads and blockchain-backed receipt records
- SBT minting support for successful receipts when wallet data is available
- Receipt verification and duplicate-protection logic
- Student payment and installment history
- Admin-required fee configuration and analytics endpoints
- Real-time event broadcasts for payment, mint, and failure updates

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- Helmet, CORS, Morgan for security and logging
- Axios for gateway requests
- WebSocket support via ws
- QR code generation
- Hardhat (dev dependency for blockchain tasks)

## Prerequisites

- Node.js 18+ or compatible runtime
- MongoDB instance or Atlas cluster
- A local `.env` file in this folder with the required variables

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file with values similar to the following:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRE=30d
NODE_ENV=development

FAPSHI_API_USER=<your-fapshi-api-user>
FAPSHI_API_KEY=<your-fapshi-api-key>
FAPSHI_API_URL=https://sandbox.fapshi.com/direct-pay
```

If the blockchain or pinning integrations are enabled, add any required provider credentials as well.

## Running the server

Start the backend in development mode:

```bash
npm run dev
```

Start production mode:

```bash
npm start
```

The API and WebSocket server run on the same host by default at `http://localhost:5000`.

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

### Payments

- `POST /api/payments/initiate`
  - Initiate a mobile-money payment for a student
  - Student only
  - Body: `amount`, `paymentType`, `academicYear`, `level`, `installment`, `momoProvider`, `momoNumber`
  - Uses the configured Fapshi gateway and stores the provider transaction ID

- `GET /api/payments/my-payments`
  - Get payment history for the current student
  - Student only

### Receipts

- `GET /api/receipts/my-receipts`
  - Get receipts for the current student

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
  - Get receipt and payment history for the current student
  - Query options: `academicYear`, `paymentType`

- `GET /api/history/installments`
  - Get installment status for the current student
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

## Real-Time Events

The backend also exposes a WebSocket server on the same HTTP port. Frontend clients can subscribe to the following event types:

- `payment_confirmed`
- `mint_complete`
- `tx_failed`
- `ping`

These events are emitted after payment processing or receipt minting updates so the UI can refresh automatically.

## Folder Structure

- `server.js` — Express and WebSocket bootstrap
- `wsServer.js` — WebSocket broadcast helpers
- `config/db.js` — MongoDB connection
- `controllers/` — Business logic for routes
- `routes/` — API route definitions
- `middleware/` — Auth, error handling, and request guards
- `models/` — Mongoose schemas
- `utils/` — Receipt helpers, QR generation, blockchain bridge

## Notes

- Student registration can prepare blockchain wallet information for receipt minting.
- Payment initiation now uses the Fapshi direct-pay flow and generates a receipt only after a successful gateway response.
- Receipt creation includes QR payload generation and can mint an SBT on-chain if wallet details exist.
- Admin verification marks receipts as verified and prevents duplicate verification.

## Troubleshooting

- Ensure `MONGO_URI` is valid and reachable.
- Verify `JWT_SECRET` is set and matches the value used by the frontend.
- Confirm the Fapshi credentials are configured if payment initiation is expected to work.
- If the server fails to start, check whether the port is already in use or whether the database connection fails.

## License

This backend is provided as part of the TrustPay system. Adjust licensing details as needed for your project.
