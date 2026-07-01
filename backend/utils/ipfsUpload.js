const pinataSDK = require("@pinata/sdk");

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET,
);

const uploadReceiptToIPFS = async (receiptData) => {
  try {
    // Test authentication first
    await pinata.testAuthentication();

    const body = {
      receiptId: receiptData.receiptId,
      referenceNumber: receiptData.referenceNumber,
      studentId: receiptData.studentId,
      amount: receiptData.amount,
      paymentType: receiptData.paymentType,
      academicYear: receiptData.academicYear,
      level: receiptData.level,
      issuedAt: receiptData.issuedAt,
      issuer: "TrustPay — University of Buea",
      network: "Polygon Amoy Testnet",
    };

    const options = {
      pinataMetadata: {
        name: `TrustPay-Receipt-${receiptData.referenceNumber}`,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    const result = await pinata.pinJSONToIPFS(body, options);
    console.log(`  ✓ IPFS upload success — CID: ${result.IpfsHash}`);
    return result.IpfsHash; // ← this is the real CID
  } catch (error) {
    console.error("IPFS upload failed:", error.message);
    // Return a fallback so minting still works if IPFS is down
    return `fallback-${receiptData.receiptId.substring(0, 16)}`;
  }
};

module.exports = { uploadReceiptToIPFS };
