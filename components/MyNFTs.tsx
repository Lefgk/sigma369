// components/MyNFTs.tsx
import { useEffect, useState } from "react";
import { useAddress, useEditionDrop } from "@thirdweb-dev/react";
import type { NFT } from "@thirdweb-dev/sdk";

export function MyNFTs() {
  const address = useAddress();
  const editionDrop = useEditionDrop(
    "0xdbDa9CAfD6f19cB11E23158686e6Fc146e5E37bE"
  );

  const [nfts, setNfts] = useState<NFT[] | null>(null);

  useEffect(() => {
    if (!address || !editionDrop) return;
    setNfts(null);
    editionDrop
      .getOwned(address)
      .then((owned) => setNfts(owned))
      .catch((err) => {
        console.error("Failed to fetch owned NFTs:", err);
        setNfts([]);
      });
  }, [address, editionDrop]);

  if (!address) return null;
  if (nfts === null) return <p>Loading your NFTs…</p>;
  if (nfts.length === 0)
    return <p className="text-gray-400">You don’t own any Club Member NFTs yet.</p>;

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded space-y-2">
      <h3 className="text-lg font-semibold">Your Club Member NFT(s):</h3>
      {nfts.map((nft) => {
        const id   = nft.metadata.id.toString();
        const name = nft.metadata.name || `Sigma 369 Club Member #${id}`;
        return (
          <div
            key={id}
            className="flex items-center space-x-3 p-2 bg-gray-800 rounded"
          >
            <div className="font-mono bg-gray-700 px-2 py-1 rounded">#{id}</div>
            <div>
              <p className="font-medium">{name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
