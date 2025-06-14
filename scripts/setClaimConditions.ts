import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { parseUnits } from "ethers/lib/utils";

async function main() {
  // 1) Connect to PulseChain
  const sdk = new ThirdwebSDK("https://rpc.pulsechain.com");

  // 2) Get your drop & token contracts
  const memberDrop = await sdk.getContract(
    "0xdbDa9CAfD6f19cB11E23158686e6Fc146e5E37bE",
    "nft-drop"
  );
  const sigmaToken = await sdk.getContract(
    "0x4FfF88B8d2cAe7d0e913198DF18B7f6a02850EC5",
    "token"
  );

  // 3) Set a claim condition: price = 369,000 Σ369, max 1 per wallet
  await memberDrop.setClaimConditions([
    {
      startTime: new Date(),
      maxQuantity: 10000,                   // total supply you want
      quantityLimitPerTransaction: 1,
      waitInSeconds: 0,
      price: parseUnits("369000", 18),
      currencyAddress: sigmaToken.getAddress(),
      snapshot: [],                         // optional: wallet snapshot
    },
  ]);

  console.log("✅ Claim conditions set!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
