# TrustPay Blockchain

This folder contains the Hardhat-based smart contract setup for the TrustPay Soulbound Token flow.

## Contract

The main Solidity contract is:

- `contracts/TrustPaySBT.sol`

It implements the TrustPay receipt/SBT logic used by the backend and frontend when a receipt is minted on-chain.

## Tech stack

- Hardhat 3
- TypeScript
- viem
- OpenZeppelin contracts

## Setup

```bash
npm install
```

## Compile

```bash
npm run compile
```

## Run a local node

```bash
npm run node
```

## Run tests

```bash
npm run test
```

## Deploy

Local deployment:

```bash
npm run deploy:local
```

Polygon Amoy deployment:

```bash
npm run deploy
```

## Environment variables

Create a `.env` file in this folder if your deployment or scripts need chain credentials.

Typical values include:

```env
PRIVATE_KEY=<wallet-private-key>
POLYGON_AMOY_RPC_URL=<rpc-url>
```

## Notes

- The backend can mint receipts on-chain when a student wallet is available.
- The deployed contract address and supporting artifacts are stored in the project’s ignition and artifacts folders.
