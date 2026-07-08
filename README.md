# TrustPay System

TrustPay is a full-stack student fee payment and receipt verification platform. It combines a Node.js backend, a React frontend, and a Hardhat-based blockchain layer for receipt-backed Soulbound Token flows.

## What the project includes

- Student and admin authentication
- Fee payment initiation and receipt generation
- Admin receipt verification with QR-based lookup
- Realtime updates for payments, minting, and verification outcomes
- Blockchain/SBT support for receipt proofing

## Repository layout

- `backend/` — Express API, MongoDB models, auth, payments, receipts, and verification routes
- `frontend/` — React + TypeScript app for students and admins
- `blockchain/` — Hardhat contracts, deployment scripts, and tests
- `docs/` — architecture and UML references

## Quick start

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Blockchain

```bash
cd blockchain
npm install
npm run compile
```

## Environment notes

- The backend expects a MongoDB connection string and JWT secret in its `.env` file.
- The frontend expects the backend API and WebSocket URL in its `.env` file.
- The blockchain module uses Hardhat config and optional deployment credentials for local or testnet deployments.

## Documentation

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
- [blockchain/README.md](blockchain/README.md)
