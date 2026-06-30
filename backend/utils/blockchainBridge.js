// Single source of truth for crossing the CommonJS → ESM boundary.
// Every controller that needs blockchain or viem functionality imports from here.

const mintReceiptOnChain = async (...args) => {
  const { mintReceiptOnChain } =
    await import("../../blockchain/services/mintService.mjs");
  return mintReceiptOnChain(...args);
};

const checkHasReceipt = async (...args) => {
  const { checkHasReceipt } =
    await import("../../blockchain/services/mintService.mjs");
  return checkHasReceipt(...args);
};

const generateWallet = async () => {
  const { generatePrivateKey, privateKeyToAccount } =
    await import("viem/accounts");
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { address: account.address, privateKey };
};

module.exports = { mintReceiptOnChain, checkHasReceipt, generateWallet };
