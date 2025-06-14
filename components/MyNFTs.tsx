// components/MyNFTs.tsx
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "../wagmi.config";

// You'll need to import your ABI from the config folder
// import { memberDropABI } from "../config/abis";

interface NFTData {
  id: string;
  name: string;
  balance: bigint;
}

export function MyNFTs() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTData[] | null>(null);

  // Example read contract call - you'll need to adjust based on your actual ABI
  const { data: balance, isLoading } = useReadContract({
    address: CONTRACTS.MEMBER_DROP,
    abi: [], // Import your ABI here: memberDropABI
    functionName: "balanceOf",
    args: address ? [address, 0] : undefined, // assuming token ID 0
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    if (!address || isLoading) {
      setNfts(null);
      return;
    }

    // For now, we'll create a simple implementation
    // You'll need to update this based on your contract's actual functions
    if (balance && balance > 0) {
      setNfts([
        {
          id: "0",
          name: "Sigma 369 Club Member #0",
          balance: balance,
        },
      ]);
    } else {
      setNfts([]);
    }
  }, [address, balance, isLoading]);

  if (!address) return null;
  if (nfts === null || isLoading) return <p>Loading your NFTs…</p>;
  if (nfts.length === 0) return <p className="text-gray-400">You don't own any Club Member NFTs yet.</p>;

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded space-y-2">
      <h3 className="text-lg font-semibold">Your Club Member NFT(s):</h3>
      {nfts.map((nft) => (
        <div key={nft.id} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
          <div className="font-mono bg-gray-700 px-2 py-1 rounded">#{nft.id}</div>
          <div>
            <p className="font-medium">{nft.name}</p>
            <p className="text-sm text-gray-400">Balance: {nft.balance.toString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
