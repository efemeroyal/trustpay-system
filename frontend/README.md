# TrustPay Frontend

This is the React + TypeScript web app for TrustPay. It provides the student dashboard, payment flow, receipt history, admin verification tools, and realtime notifications.

## What it includes

- Student login and registration
- Admin login and admin signup
- Fee payment experience with receipt generation
- Receipt view with verification status
- Admin QR-based verification workflow
- Realtime notifications for payments, minting, and verification outcomes

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- TanStack React Query
- GSAP
- React Router
- Axios
- WebSocket client

## Project structure

```text
src/
  components/ui/
  layouts/
  modules/
    auth/
    dashboard/
    payment/
    receipts/
    settings/
    admin/
  routes/
  services/
  store/
  types/
  utils/
```

## Run locally

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env` file in this folder with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

## Authentication flow

- Students sign up and are redirected to the student dashboard.
- Admins sign up and are redirected to the admin area.
- Login uses the backend JWT authentication flow and stores the token in local storage.

## Admin verification flow

The admin verification page supports:

- manual receipt lookup
- QR scanning via the device camera
- validation and rejection results that are surfaced back to the student view

## Notes

The frontend expects the backend to be running and reachable at the configured API URL.
