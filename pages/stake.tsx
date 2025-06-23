// pages/stake.tsx
import { useAccount } from "wagmi";
import StakingPanel from "./StakingPanel";
import Link from "next/link";

export default function StakePage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="neon-heading text-4xl md:text-6xl font-extrabold mb-4">
            STAKE & EARN
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Stake your Sigma 369 Club Member NFT to earn PLS rewards
          </p>
        </div>

        {!isConnected ? (
          <div className="card-neon text-center">
            <div className="text-6xl mb-6">🔌</div>
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to access staking features
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Staking Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="stat-card text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-white stat-value">Active</div>
                <p className="text-gray-400 text-sm">Staking Status</p>
              </div>
              <div className="stat-card text-center">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-white stat-value">24/7</div>
                <p className="text-gray-400 text-sm">Earning Rewards</p>
              </div>
              <div className="stat-card text-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-white stat-value">Secure</div>
                <p className="text-gray-400 text-sm">Smart Contract</p>
              </div>
            </div>

            {/* How Staking Works */}
            <div className="card-neon">
              <h2 className="neon-heading text-2xl font-semibold mb-6 text-center">
                How Staking Works
              </h2>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="p-4">
                  <div className="text-4xl mb-3">🎁</div>
                  <h3 className="text-gray-400 font-semibold mb-2">Own NFT</h3>
                  <p className="text-sm text-gray-400">
                    Have a Club Member NFT in your wallet
                  </p>
                </div>
                <div className="p-4">
                  <div className=" text-4xl mb-3">🔐</div>
                  <h3 className="text-gray-400 font-semibold mb-2">Stake</h3>
                  <p className="text-sm text-gray-400">
                    Lock your NFT in the staking contract
                  </p>
                </div>
                <div className="p-4">
                  <div className=" text-4xl mb-3">💎</div>
                  <h3 className="text-gray-400 font-semibold mb-2">Earn</h3>
                  <p className="text-sm text-gray-400">
                    Accumulate PLS rewards over time
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-4xl mb-3">💸</div>
                  <h3 className="text-gray-400 font-semibold mb-2">Claim</h3>
                  <p className="text-sm text-gray-400">
                    Withdraw your earned rewards anytime
                  </p>
                </div>
              </div>
            </div>

            {/* Main Staking Panel */}
            <div className="card-neon">
              <h2 className="neon-heading text-2xl font-semibold mb-6 text-center">
                Your Staking Dashboard
              </h2>
              <StakingPanel />
            </div>

            {/* Staking Benefits */}
            <div className="card-neon">
              <h2 className="neon-heading text-2xl font-semibold mb-6 text-center">
                Staking Benefits
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">📈</div>
                    <div>
                      <h3 className="font-semibold mb-1">Passive Income</h3>
                      <p className="text-sm text-gray-400">
                        Earn PLS tokens continuously while your NFT is staked
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🛡️</div>
                    <div>
                      <h3 className="font-semibold mb-1">Secure Staking</h3>
                      <p className="text-sm text-gray-400">
                        Your NFT is safely stored in our audited smart contract
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">⏰</div>
                    <div>
                      <h3 className="font-semibold mb-1">Flexible Timing</h3>
                      <p className="text-sm text-gray-400">
                        Claim rewards anytime, no lock-up periods
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🔄</div>
                    <div>
                      <h3 className="font-semibold mb-1">Compound Growth</h3>
                      <p className="text-sm text-gray-400">
                        Reinvest earnings to maximize your returns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="neon-heading text-2xl font-bold mb-4">
                Don't Have an NFT Yet?
              </h2>
              <Link href="/claim" className="btn-neon inline-block">
                Claim Your NFT First
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
