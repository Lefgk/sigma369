// pages/claim.tsx
import { useState } from "react";
import { useAccount } from "wagmi";
import { ClaimPanel } from "./ClaimPanel";
import Link from "next/link";

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const [selectedNFT, setSelectedNFT] = useState<"MEMBER" | "VIP">("MEMBER");

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="neon-heading text-4xl md:text-6xl font-extrabold mb-4">
            CLAIM YOUR NFT
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Choose your membership level and join the Sigma 369 Club
          </p>
        </div>

        {!isConnected ? (
          <div className="card-neon text-center max-w-md mx-auto">
            <div className="text-6xl mb-6">🔌</div>
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to claim your NFT
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* NFT Selection */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Member NFT Card */}
              <div
                className={`card-neon cursor-pointer transition-all duration-300 ${
                  selectedNFT === "MEMBER"
                    ? "border-purple-400 bg-purple-900/20"
                    : "hover:border-purple-500/50"
                }`}
                onClick={() => setSelectedNFT("MEMBER")}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🏅</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Club Member NFT
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-purple-400 font-semibold">
                      369,000 Σ369 tokens
                    </p>
                    <p className="text-gray-400">Earn 0.369 PLS per second</p>
                    <p className="text-gray-400">Basic membership benefits</p>
                  </div>
                  {selectedNFT === "MEMBER" && (
                    <div className="mt-4 p-2 bg-purple-500/20 rounded">
                      <p className="text-purple-300 text-sm font-semibold">
                        Selected ✓
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* VIP NFT Card */}
              <div
                className={`card-neon cursor-pointer transition-all duration-300 ${
                  selectedNFT === "VIP"
                    ? "border-pink-400 bg-pink-900/20"
                    : "hover:border-pink-500/50"
                }`}
                onClick={() => setSelectedNFT("VIP")}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">👑</div>
                  <h3 className="text-xl font-semibold mb-2">Club VIP NFT</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-pink-400 font-semibold">
                      3,690,000 Σ369 tokens
                    </p>
                    <p className="text-gray-400">Earn 0.963 PLS per second</p>
                    <p className="text-gray-400">Premium VIP benefits</p>
                  </div>
                  {selectedNFT === "VIP" && (
                    <div className="mt-4 p-2 bg-pink-500/20 rounded">
                      <p className="text-pink-300 text-sm font-semibold">
                        Selected ✓
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="card-neon max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Membership Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4 text-purple-400">
                        Member
                      </th>
                      <th className="text-center py-3 px-4 text-pink-400">
                        VIP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4 text-gray-300">Entry Price</td>
                      <td className="py-3 px-4 text-center">369,000 Σ369</td>
                      <td className="py-3 px-4 text-center">3,690,000 Σ369</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4 text-gray-300">
                        Staking Rewards
                      </td>
                      <td className="py-3 px-4 text-center">0.369 PLS/sec</td>
                      <td className="py-3 px-4 text-center">0.963 PLS/sec</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4 text-gray-300">
                        Daily Earning Potential
                      </td>
                      <td className="py-3 px-4 text-center">~31,881 PLS</td>
                      <td className="py-3 px-4 text-center">~83,203 PLS</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4 text-gray-300">Club Status</td>
                      <td className="py-3 px-4 text-center">Member</td>
                      <td className="py-3 px-4 text-center">VIP</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-300">NFT Rarity</td>
                      <td className="py-3 px-4 text-center">Standard</td>
                      <td className="py-3 px-4 text-center">Premium</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Claim Panel */}
            <div className="max-w-lg mx-auto">
              <ClaimPanel nftType={selectedNFT} />
            </div>

            {/* How to Get Tokens */}
            <div className="card-neon max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                How to Get Σ369 Tokens
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🔄</div>
                  <h3 className="font-semibold mb-2">DEX Trading</h3>
                  <p className="text-sm text-gray-400">
                    Buy Σ369 tokens on PulseX or other DEXs
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">💎</div>
                  <h3 className="font-semibold mb-2">Token Contract</h3>
                  <p className="text-sm text-gray-400 break-all">
                    0x4FfF88B8d2cAe7d0e913198DF18B7f6a02850EC5
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits Overview */}
            <div className="card-neon max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                What You Get
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="font-semibold mb-2">Exclusive NFT</h3>
                  <p className="text-sm text-gray-400">
                    Unique digital collectible with proven ownership
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="font-semibold mb-2">Passive Income</h3>
                  <p className="text-sm text-gray-400">
                    Earn PLS tokens continuously by staking
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="font-semibold mb-2">Club Status</h3>
                  <p className="text-sm text-gray-400">
                    Join the exclusive Sigma 369 community
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="neon-heading text-2xl font-bold mb-4">
                Ready to Stake?
              </h2>
              <p className="text-gray-400 mb-6">
                After claiming your NFT, head to the staking page to start
                earning rewards
              </p>
              <Link
                href="/stake"
                className="btn neon-purple-outline inline-block"
              >
                Go to Staking →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
