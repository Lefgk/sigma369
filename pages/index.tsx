// pages/index.tsx
import { useAccount } from "wagmi";
import Link from "next/link";

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="neon-heading text-6xl md:text-8xl font-extrabold mb-6">SIGMA 369 CLUB</h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the exclusive Sigma 369 Club. Claim your NFT, stake for rewards, and be part of the PulseChain revolution.
          </p>

          {!isConnected ? (
            <div className="card-neon max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">Get Started</h3>
              <p className="text-gray-400 mb-6">Connect your wallet to begin your Sigma 369 journey</p>
              <div className="text-center">
                <p className="text-sm text-purple-400">👆 Click "Connect Wallet" above</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Link href="/claim" className="card-neon hover:scale-105 transition-transform cursor-pointer">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎁</div>
                  <h3 className="text-xl font-semibold mb-2">Claim Your NFT</h3>
                  <p className="text-gray-400">Get your exclusive Club Member NFT for 369k Σ tokens</p>
                </div>
              </Link>

              <Link href="/stake" className="card-neon hover:scale-105 transition-transform cursor-pointer">
                <div className="text-center">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-semibold mb-2">Stake & Earn</h3>
                  <p className="text-gray-400">Stake your NFT to earn PLS rewards continuously</p>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="stat-card text-center">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Exclusive Membership</h3>
            <p className="text-gray-400 text-sm">Limited edition NFTs for true Sigma community members</p>
          </div>

          <div className="stat-card text-center">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Passive Rewards</h3>
            <p className="text-gray-400 text-sm">Earn PLS tokens by staking your Club Member NFT</p>
          </div>

          <div className="stat-card text-center">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold mb-2">PulseChain Native</h3>
            <p className="text-gray-400 text-sm">Built on the fastest, most efficient blockchain</p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="neon-heading text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Connect Wallet</h3>
              <p className="text-sm text-gray-400">Link your PulseChain-compatible wallet</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Claim NFT</h3>
              <p className="text-sm text-gray-400">Pay 369k Σ tokens to claim your membership</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Stake NFT</h3>
              <p className="text-sm text-gray-400">Lock your NFT to start earning rewards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50">
                <span className="text-2xl">4️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Earn PLS</h3>
              <p className="text-sm text-gray-400">Collect passive income in PLS tokens</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card-neon text-center">
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">369</div>
            <h3 className="font-semibold mb-1">Club Number</h3>
            <p className="text-sm text-gray-400">The sacred Sigma number</p>
          </div>

          <div className="card-neon text-center">
            <div className="text-4xl mb-4">🔥</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
            <h3 className="font-semibold mb-1">Earning</h3>
            <p className="text-sm text-gray-400">Continuous reward generation</p>
          </div>

          <div className="card-neon text-center">
            <div className="text-4xl mb-4">💎</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">PLS</div>
            <h3 className="font-semibold mb-1">Network</h3>
            <p className="text-sm text-gray-400">Built on PulseChain</p>
          </div>
        </div>

        {/* Call to Action */}
        {isConnected ? (
          <div className="text-center">
            <h2 className="neon-heading text-3xl font-bold mb-6">Ready to Join?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/claim" className="btn-neon inline-block">
                Claim Your NFT
              </Link>
              <Link href="/portfolio" className="btn neon-purple-outline inline-block">
                View Portfolio
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="neon-heading text-3xl font-bold mb-6">Join the Elite</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Connect your wallet to access exclusive Sigma 369 Club features and start your journey to financial freedom.
            </p>
            <div className="inline-flex items-center space-x-2 text-purple-400">
              <span>👆</span>
              <span className="font-semibold">Click "Connect Wallet" above to begin</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
