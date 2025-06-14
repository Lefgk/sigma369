// components/StakingPanel.tsx
import {
  useAddress,
  useContract,
  useNFTBalance,
  useOwnedNFTs,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

export function StakingPanel() {
  const address = useAddress();
  if (!address) return null;

  const { contract: memberDrop } = useContract(
    "0xdbDa9CAfD6f19cB11E23158686e6Fc146e5E37bE",
    "edition-drop"
  );
  const { contract: memberStake } = useContract(
    "0xca440387bE079F23EC56B40C075B712aa2BAe69C",
    "staking"
  );

  // check you own the Member edition
  const { data: bal }      = useNFTBalance(memberDrop, address);
  const { data: owned }    = useOwnedNFTs(memberDrop, address);
  const has               = bal?.gt(0);
  const tokenId           = has ? owned?.[0]?.metadata.id : undefined;
  const stakingContract   = has ? memberStake : null;

  if (!has || tokenId === undefined)
    return <p className="text-gray-400 text-center">No NFT to stake</p>;

  // read your staked amount & rewards
  const { data: info, isLoading } = useContractRead(
    stakingContract,
    "getStakeInfo",
    [address]
  );
  const staked  = (info?.[2] as BigNumber) || BigNumber.from(0);
  const rewards = (info?.[3] as BigNumber) || BigNumber.from(0);

  // write hooks
  const { mutate: stake, isLoading: staking } = useContractWrite(stakingContract, "stake");
  const { mutate: claim, isLoading: harvesting } = useContractWrite(stakingContract, "claimRewards");

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded text-center space-y-4">
      {isLoading ? (
        <p>Loading stake info…</p>
      ) : (
        <>
          <p>Staked: {staked.toString()} NFT</p>
          <p>Rewards: {parseFloat(formatUnits(rewards, 18)).toFixed(4)} PLS</p>
        </>
      )}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => stake([tokenId])}
          disabled={staking}
          className="btn neon-purple-outline"
        >
          {staking ? "Staking…" : "Stake NFT"}
        </button>
        <button
          onClick={() => claim([tokenId])}
          disabled={harvesting}
          className="btn neon-purple"
        >
          {harvesting ? "Claiming…" : "Claim Rewards"}
        </button>
      </div>
    </div>
  );
}
