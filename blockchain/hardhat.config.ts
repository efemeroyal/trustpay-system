import dotenv from "dotenv";
dotenv.config();

const ALCHEMY_RPC_URL =
  process.env.ALCHEMY_RPC_URL ||
  "https://polygon-amoy.g.alchemy.com/v2/placeholder";
const DEPLOYER_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000001";

import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

export default {
  solidity: "0.8.28",
  plugins: [hardhatToolboxViem], // ← object, not a string
  networks: {
    polygonAmoy: {
      type: "http",
      url: ALCHEMY_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};
