// components/OwnedList.tsx
import { useEffect, useState } from "react";
import { useAddress, useEditionDrop, useOwnedNFTs } from "@thirdweb-dev/react";
import type { NFT } from "@thirdweb-dev/sdk";

// helper to resolve ipfs:// → https://ipfs.io/ipfs/
function resolveIpfs(uri: string) {
  return uri.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
}

// Base URI for your token JSONs (0,1,…)
const TOKEN_BASE = "ipfs://QmaEZDr8LBrFHsE685439FnYcarPQ6yHw3HS7gYH6jXGju/";

export function OwnedList() {
  const address = useAddress();
  const drop = useEditionDrop(
    "0xdbDa9CAfD6f19cB11E23158686e6Fc146e5E37bE"
  );
  const { data: nfts, isLoading: loadingIds } = useOwnedNFTs(drop, address);

  // Once we have IDs, fetch each metadata JSON
  const [items, setItems] = useState<{ id: string; metadata: any }[] | null>(
    null
  );
  useEffect(() => {
    if (!nfts) return;
    setItems(null);
    Promise.all(
      nfts.map(async (nft: NFT) => {
        const id = nft.metadata.id.toString();
        const jsonUrl = resolveIpfs(`${TOKEN_BASE}${id}`);
        try {
          const res = await fetch(jsonUrl);
          const json = await res.json();
          return { id, metadata: json };
        } catch {
          return { id, metadata: {} };
        }
      })
    ).then(setItems);
  }, [nfts]);

  if (!address) return null;
  if (loadingIds || items === null) return <p>Loading your NFTs…</p>;
  if (items.length === 0)
    return <p className="text-gray-400">You don’t own any Club Member NFTs yet.</p>;

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded space-y-4">
      <h3 className="text-lg font-semibold">Your Club Member NFT(s):</h3>
      <ul className="space-y-6">
        {items.map(({ id, metadata }) => {
          const name = metadata.name || `Sigma 369 Club Member #${id}`;
          const anim = metadata.animation_url as string | undefined;
          const img  = metadata.image as string | undefined;
          const raw  = anim || img || "";
          const mediaUrl = raw.startsWith("ipfs://")
            ? resolveIpfs(raw)
            : raw;
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
                  />
                )
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-700 rounded">
                  <span className="text-gray-500">No media</span>
                </div>
              )}
              <p className="font-medium">{name}</p>
              <p className="text-xs text-gray-400">Token ID {id}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
