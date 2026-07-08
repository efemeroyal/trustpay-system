# TrustPay Backend

This folder contains the Express + MongoDB backend for the TrustPay student-fee and receipt platform. It handles authentication, payments, receipt generation, admin verification, analytics, and realtime updates.

## What it does

- Student and admin signup with JWT authentication
- Role-based access control for student and admin flows
- Mobile-money payment initiation through Fapshi
- Receipt creation with QR payloads and receipt records
- Optional blockchain/SBT minting when wallet information is available
- Admin verification with validated/rejected receipt state updates
- Student payment history, installment status, and analytics endpoints
- WebSocket broadcasts for live UI updates

## Tech stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Helmet, CORS, Morgan
- Axios
- QR code generation with qrcode
- WebSocket support with ws

## Prerequisites

- Node.js 18+
- MongoDB instance or Atlas cluster
- A local `.env` file in this folder

## Environment variables

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

## Run locally

```bash
npm install
npm run dev
```

Production mode:

```bash
npm start
```

The API and WebSocket server run on `http://localhost:5000` by default.

## API overview

### Auth

- `POST /api/auth/register/student`
- `POST /api/auth/register/admin`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/auth/users` (admin only)

### Payments

- `POST /api/payments/initiate` (student only)
- `GET /api/payments/my-payments` (student only)

### Receipts

- `GET /api/receipts/my-receipts`
- `GET /api/receipts/all` (admin only)

### Verification

- `POST /api/verify/verify` (admin only)
- `GET /api/verify/history` (admin only)

### History and analytics

- `GET /api/history/my-history`
- `GET /api/history/installments`
- `GET /api/history/student/:studentId` (admin only)
- `POST /api/history/required-fees` (admin only)
- `GET /api/history/required-fees` (admin only)
- `GET /api/analytics/dashboard` (admin only)

## Realtime events

The backend broadcasts these WebSocket events:

- `payment_confirmed`
- `mint_complete`
- `tx_failed`
- `receipt_validated`
- `receipt_rejected`
- `ping`

## Project structure

- `server.js` — Express and WebSocket bootstrap
- `wsServer.js` — websocket broadcast helpers
- `config/db.js` — MongoDB connection
- `controllers/` — request handlers
- `routes/` — API route definitions
- `middleware/` — auth and error handling
- `models/` — Mongoose schemas
- `utils/` — receipt, QR, and blockchain helpers

## Notes

- Admin verification updates a receipt to `validated` or `rejected` and notifies the student through the realtime layer.
- Receipts can be linked to SBT records when the student has a wallet configured.
- Fapshi credentials must be present if payment initiation should reach the gateway successfully.
