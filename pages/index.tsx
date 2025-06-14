import dynamic from "next/dynamic";
import { ConnectWallet } from "@thirdweb-dev/react";
import { ClaimMemberButton } from "../components/ClaimMemberButton";

const OwnedList    = dynamic(() => import("../components/OwnedList").then(m => m.OwnedList),     { ssr: false });
const StakingPanel = dynamic(() => import("../components/StakingPanel").then(m => m.StakingPanel), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center space-y-12">
      {/* Neon heading */}
      <h1 className="neon-heading text-5xl md:text-7xl font-extrabold text-center">
        CLAIM YOUR SIGMA 369 NFT
      </h1>

      {/* Wallet connect, with Claim button directly below */}
      <div className="flex flex-col items-center space-y-4">
        {/* default ConnectWallet styling (no neon glow on hover) */}
        <ConnectWallet />
        {/* our custom neon‐styled Claim button */}
        <ClaimMemberButton />
      </div>

      {/* Your NFT card */}
      <div className="card-neon w-full max-w-md">
        <OwnedList />
      </div>

      {/* Staking section */}
      <h2 className="neon-heading text-2xl md:text-3xl font-semibold text-center">
        STAKE YOUR NFT TO EARN REWARDS
      </h2>
      <div className="card-neon w-full max-w-md">
        <StakingPanel />
      </div>
    </main>
  );
}
