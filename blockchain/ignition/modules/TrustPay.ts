import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TrustPayModule = buildModule("TrustPay", (m) => {
  // Define the TrustPaySBT contract using the module's contract builder
  const TrustPaySBT = m.contract("TrustPaySBT");

  return { TrustPaySBT };
});

export default TrustPayModule;
