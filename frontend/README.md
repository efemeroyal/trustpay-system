# TrustPay — Frontend

Blockchain-based payment verification UI for University of Buea.

## Stack
- **React 18 + TypeScript** — Component framework
- **Vite** — Build tool
- **Tailwind CSS** — Utility-first styling
- **GSAP** — Animations (page transitions, minting ceremony, stagger reveals)
- **Viem** — Type-safe Ethereum/Polygon interaction
- **Polygon Amoy Testnet** — ERC-5192 Soulbound Token deployment

## Project Structure
```
src/
├── components/
│   ├── ui/          # Badge, Button, Card, Input, StatCard, Toast
│   └── layout/      # Topbar, Sidebar, AppShell
├── modules/
│   ├── auth/        # LoginPage
│   ├── dashboard/   # DashboardPage (stats, tx list, chain activity)
│   ├── payment/     # PaymentPage (fee selector + MoMo confirm)
│   ├── minting/     # MintingScreen (GSAP ceremony)
│   ├── vault/       # VaultPage (SBT cards), ReceiptsPage (tx history)
│   ├── admin/       # AdminDashboard (verify by student/wallet)
│   ├── chain/       # ChainActivityPage
│   └── settings/    # SettingsPage
├── services/
│   ├── contractService.ts  # viem — Polygon reads/writes
│   ├── api.ts              # Axios — REST backend calls
│   └── websocket.ts        # WS manager for real-time updates
├── store/           # React Context (Auth, Payment, Notifications)
├── types/           # All TypeScript interfaces
└── utils/           # Formatting, fee catalog, helpers
```

## Quick Start
```bash
cp .env.example .env      # Fill in your contract address + RPC
npm install
npm run dev
```

## Environment Variables
```
VITE_CONTRACT_ADDRESS=0x...   # Deployed ERC-5192 contract on Amoy
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

## Demo Login
Any Student ID (6+ characters) + any password. Prefill: `UB22CS041`

## Connecting to the Backend
The frontend expects a Node.js/Express backend at `VITE_API_URL` with:
- `POST /api/auth/login` → `{ token, student }`
- `POST /api/payment/initiate` → `{ referenceId }`
- `GET  /api/payment/status/:id` → `{ status, momoRef }`
- `POST /api/mint` → `{ txHash, tokenId, ipfsCid }`
- `GET  /api/receipts/:studentId` → `SBTReceipt[]`
- `GET  /api/admin/verify/student/:id` → `SBTReceipt[]`

## Viem Usage
All Polygon reads use `publicClient` from `contractService.ts`.
Writes require MetaMask — call `connectWallet()` then `getWalletClient()`.
