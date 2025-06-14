// components/OwnedList.tsx
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "../wagmi.config";

// Import your ABI from config folder
// import { memberDropABI } from "../config/abis";

interface NFTMetadata {
  id: string;
  name: string;
  image?: string;
  animation_url?: string;
}

interface NFTItem {
  id: string;
  metadata: NFTMetadata;
  balance: bigint;
}

// helper to resolve ipfs:// → https://ipfs.io/ipfs/
function resolveIpfs(uri: string) {
  return uri.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
}

// Base URI for your token JSONs (0,1,…)
const TOKEN_BASE = "ipfs://QmaEZDr8LBrFHsE685439FnYcarPQ6yHw3HS7gYH6jXGju/";

export default function OwnedList() {
  const { address } = useAccount();
  const [items, setItems] = useState<NFTItem[] | null>(null);

  // Check balance for token ID 0
  const { data: balance, isLoading } = useReadContract({
    address: CONTRACTS.MEMBER_DROP,
    abi: [], // memberDropABI
    functionName: "balanceOf",
    args: address ? [address, 0] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get token URI
  const { data: tokenUri } = useReadContract({
    address: CONTRACTS.MEMBER_DROP,
    abi: [], // memberDropABI
    functionName: "uri",
    args: [0],
    query: {
      enabled: !!address && balance && balance > 0,
    },
  });

  useEffect(() => {
    if (!address || isLoading) {
      setItems(null);
      return;
    }

    if (!balance || balance === 0) {
      setItems([]);
      return;
    }

    // Fetch metadata for the NFT
    const fetchMetadata = async () => {
      try {
        const jsonUrl = resolveIpfs(`${TOKEN_BASE}0`);
        const res = await fetch(jsonUrl);
        const metadata = await res.json();

        setItems([
          {
            id: "0",
            metadata: {
              id: "0",
              name: metadata.name || "Sigma 369 Club Member #0",
              image: metadata.image,
              animation_url: metadata.animation_url,
            },
            balance: balance,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
        setItems([
          {
            id: "0",
            metadata: {
              id: "0",
              name: "Sigma 369 Club Member #0",
            },
            balance: balance,
          },
        ]);
      }
    };

    fetchMetadata();
  }, [address, balance, isLoading]);

  if (!address) return null;
  if (items === null || isLoading) return <p>Loading your NFTs…</p>;
  if (items.length === 0)
    return (
      <p className="text-gray-400">You don't own any Club Member NFTs yet.</p>
    );

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded space-y-4">
      <h3 className="text-lg font-semibold">Your Club Member NFT(s):</h3>
      <ul className="space-y-6">
        {items.map(({ id, metadata, balance }) => {
          const name = metadata.name || `Sigma 369 Club Member #${id}`;
          const anim = metadata.animation_url;
          const img = metadata.image;
          const raw = anim || img || "";
          const mediaUrl = raw.startsWith("ipfs://") ? resolveIpfs(raw) : raw;
          const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

          return (
            <li
              key={id}
              className="flex flex-col items-center bg-gray-800 p-4 rounded space-y-2"
            >
              {mediaUrl ? (
                isVideo ? (
                  <video
                    src={mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-64 h-64 object-cover rounded"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={name}
                    className="w-64 h-64 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-700 rounded">
                  <span className="text-gray-500">No media</span>
                </div>
              )}
              <p className="font-medium">{name}</p>
              <p className="text-xs text-gray-400">Token ID {id}</p>
              <p className="text-xs text-gray-400">
                Balance: {balance.toString()}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
