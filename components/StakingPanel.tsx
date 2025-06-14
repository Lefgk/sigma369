// components/StakingPanel.tsx
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS } from "../wagmi.config";
import { useState } from "react";

// Import your ABIs from config folder
// import { memberDropABI, stakingABI } from "../config/abis";

export function StakingPanel() {
  const { address } = useAccount();
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Check NFT balance
  const { data: nftBalance } = useReadContract({
    address: CONTRACTS.MEMBER_DROP,
    abi: [], // memberDropABI
    functionName: "balanceOf",
    args: address ? [address, 0] : undefined, // token ID 0
    query: {
      enabled: !!address,
    },
  });

  // Get staking info
  const { data: stakeInfo, refetch: refetchStakeInfo } = useReadContract({
    address: CONTRACTS.MEMBER_STAKE,
    abi: [], // stakingABI
    functionName: "getStakeInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Write contract hooks
  const { writeContract: writeStake, data: stakeHash } = useWriteContract();
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();

  // Wait for transactions
  const { isLoading: isStakeLoading } = useWaitForTransactionReceipt({
    hash: stakeHash,
  });

  const { isLoading: isClaimLoading } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const hasNFT = nftBalance && nftBalance > 0;

  // Extract staking data (adjust based on your contract structure)
  const stakedAmount = stakeInfo ? (stakeInfo as any)[2] || 0 : 0;
  const rewards = stakeInfo ? (stakeInfo as any)[3] || 0 : 0;

  const handleStake = async () => {
    if (!address) return;

    try {
      setIsStaking(true);
      writeStake({
        address: CONTRACTS.MEMBER_STAKE,
        abi: [], // stakingABI
        functionName: "stake",
        args: [0], // token ID 0
      });
    } catch (error) {
      console.error("Staking error:", error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async () => {
    if (!address) return;

    try {
      setIsClaiming(true);
      writeClaim({
        address: CONTRACTS.MEMBER_STAKE,
        abi: [], // stakingABI
        functionName: "claimRewards",
        args: [0], // token ID 0
      });
    } catch (error) {
      console.error("Claiming error:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!address) return null;

  if (!hasNFT) {
    return <p className="text-gray-400 text-center">No NFT to stake</p>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded text-center space-y-4">
      <div className="space-y-2">
        <p>Staked: {stakedAmount.toString()} NFT</p>
        <p>Rewards: {parseFloat(formatUnits(rewards, 18)).toFixed(4)} PLS</p>
      </div>

      <div className="flex justify-center space-x-4">
        <button onClick={handleStake} disabled={isStaking || isStakeLoading} className="btn neon-purple-outline">
          {isStaking || isStakeLoading ? "Staking…" : "Stake NFT"}
        </button>
        <button onClick={handleClaim} disabled={isClaiming || isClaimLoading} className="btn neon-purple">
          {isClaiming || isClaimLoading ? "Claiming…" : "Claim Rewards"}
        </button>
      </div>
    </div>
  );
}
