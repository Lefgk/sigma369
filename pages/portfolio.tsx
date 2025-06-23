// pages/portfolio.tsx
import { useAccount } from "wagmi";
import OwnedList from "./OwnedList";
import { MyNFTs } from "../components/MyNFTs";
import Link from "next/link";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="neon-heading text-4xl md:text-6xl font-extrabold mb-4">
            YOUR PORTFOLIO
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            View and manage your Sigma 369 Club NFTs
          </p>
        </div>

        {!isConnected ? (
          <div className="card-neon text-center">
            <div className="text-6xl mb-6">🔌</div>
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to view your NFT portfolio
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="stat-card text-center">
                <div className="text-3xl mb-2">💼</div>
                <div className="text-white stat-value">Active</div>
                <p className="text-gray-400 text-sm">Portfolio Status</p>
              </div>
              <div className="stat-card text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-white stat-value">Member</div>
                <p className="text-gray-400 text-sm">Club Status</p>
              </div>
              <div className="stat-card text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-white stat-value">PLS</div>
                <p className="text-gray-400 text-sm">Network</p>
              </div>
            </div>

            {/* NFT Gallery */}
            <div className="card-neon">
              <h2 className="neon-heading text-2xl font-semibold mb-6 text-center">
                Your NFT Collection
              </h2>
              <OwnedList />
            </div>

            {/* Quick Actions */}
            <div className="card-neon">
              <h2 className="neon-heading text-2xl font-semibold mb-6 text-center">
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/claim"
                  className="btn-neon inline-block"
                >
                  🎁 Claim More NFTs
                </Link>
                <Link
                  href="/stake"
                  className="btn-neon inline-block"
                >
                  ⚡ Stake for Rewards
                </Link>
              </div>
            </div>

            {/* Portfolio Summary */}
            <div className="card-neon">
              <h2 className="neon-heading text-2xl font-semibold mb-6 text-center">
                Portfolio Summary
              </h2>
              <MyNFTs />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
