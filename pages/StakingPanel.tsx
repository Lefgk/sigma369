// components/StakingPanel.tsx
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS, NFT_TYPES } from "../wagmi.config";
import { memberDropABI, stakingABI } from "../abis";
import { useState, useEffect } from "react";

interface NFTStakingData {
  balance: bigint;
  isApproved: boolean;
  isStaked: boolean;
  amountStaked: number;
  timeOfLastUpdate: number;
  unclaimedRewards: bigint;
  liveRewards: bigint;
  totalClaimableRewards: bigint;
}

export default function StakingPanel() {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<NFTStakingData>({
    balance: BigInt(0),
    isApproved: false,
    isStaked: false,
    amountStaked: 0,
    timeOfLastUpdate: 0,
    unclaimedRewards: BigInt(0),
    liveRewards: BigInt(0),
    totalClaimableRewards: BigInt(0),
  });
  const [vipData, setVipData] = useState<NFTStakingData>({
    balance: BigInt(0),
    isApproved: false,
    isStaked: false,
    amountStaked: 0,
    timeOfLastUpdate: 0,
    unclaimedRewards: BigInt(0),
    liveRewards: BigInt(0),
    totalClaimableRewards: BigInt(0),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Early return if no address
  if (!address) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          border: "1px solid #333",
          textAlign: "center",
          color: "white",
        }}
      >
        <h2 style={{ color: "white", marginBottom: "16px" }}>
          Connect Your Wallet
        </h2>
        <p style={{ color: "#888" }}>
          Please connect your wallet to access staking
        </p>
      </div>
    );
  }

  // Contract reads
  const { data: memberBalance } = useReadContract({
    address: CONTRACTS.MEMBER_DROP,
    abi: memberDropABI,
    functionName: "balanceOf",
    args: [address, BigInt(0)],
  });

  const { data: vipBalance } = useReadContract({
    address: CONTRACTS.VIP_DROP,
    abi: memberDropABI,
    functionName: "balanceOf",
    args: [address, BigInt(0)],
  });

  const { data: memberApproved } = useReadContract({
    address: NFT_TYPES.MEMBER?.contract,
    abi: memberDropABI,
    functionName: "isApprovedForAll",
    args: [address, NFT_TYPES.MEMBER?.stakingContract],
  });

  const { data: vipApproved } = useReadContract({
    address: NFT_TYPES.VIP?.contract,
    abi: memberDropABI,
    functionName: "isApprovedForAll",
    args: [address, NFT_TYPES.VIP?.stakingContract],
  });

  const { data: memberStakerInfo } = useReadContract({
    address: NFT_TYPES.MEMBER?.stakingContract,
    abi: stakingABI,
    functionName: "stakers",
    args: [BigInt(NFT_TYPES.MEMBER?.tokenId || 0), address],
  });

  const { data: vipStakerInfo } = useReadContract({
    address: NFT_TYPES.VIP?.stakingContract,
    abi: stakingABI,
    functionName: "stakers",
    args: [BigInt(NFT_TYPES.VIP?.tokenId || 0), address],
  });

  const { data: memberStakeInfoForToken } = useReadContract({
    address: NFT_TYPES.MEMBER?.stakingContract,
    abi: stakingABI,
    functionName: "getStakeInfoForToken",
    args: [BigInt(NFT_TYPES.MEMBER?.tokenId || 0), address],
  });

  const { data: vipStakeInfoForToken } = useReadContract({
    address: NFT_TYPES.VIP?.stakingContract,
    abi: stakingABI,
    functionName: "getStakeInfoForToken",
    args: [BigInt(NFT_TYPES.VIP?.tokenId || 0), address],
  });

  // Additional contract info
  const { data: memberRewardTokenBalance } = useReadContract({
    address: NFT_TYPES.MEMBER?.stakingContract,
    abi: stakingABI,
    functionName: "getRewardTokenBalance",
  });

  const { data: vipRewardTokenBalance } = useReadContract({
    address: NFT_TYPES.VIP?.stakingContract,
    abi: stakingABI,
    functionName: "getRewardTokenBalance",
  });

  const { data: memberRewardsPerUnitTime } = useReadContract({
    address: NFT_TYPES.MEMBER?.stakingContract,
    abi: stakingABI,
    functionName: "getRewardsPerUnitTime",
    args: [BigInt(NFT_TYPES.MEMBER?.tokenId || 0)],
  });

  const { data: vipRewardsPerUnitTime } = useReadContract({
    address: NFT_TYPES.VIP?.stakingContract,
    abi: stakingABI,
    functionName: "getRewardsPerUnitTime",
    args: [BigInt(NFT_TYPES.VIP?.tokenId || 0)],
  });

  // Write contracts
  const { writeContract: writeApproval, data: approvalHash } =
    useWriteContract();
  const { writeContract: writeStake, data: stakeHash } = useWriteContract();
  const { writeContract: writeUnstake, data: unstakeHash } = useWriteContract();
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();

  // Transaction states
  const { isLoading: isApprovalLoading, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({ hash: approvalHash });
  const { isLoading: isStakeLoading, isSuccess: isStakeSuccess } =
    useWaitForTransactionReceipt({ hash: stakeHash });
  const { isLoading: isUnstakeLoading, isSuccess: isUnstakeSuccess } =
    useWaitForTransactionReceipt({ hash: unstakeHash });
  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({ hash: claimHash });

  // Process contract data into state
  useEffect(() => {
    const processNFTData = (
      balance: any,
      approved: any,
      stakerInfo: any,
      stakeInfoForToken: any
    ): NFTStakingData => {
      const stakerData = stakerInfo as any;
      const stakeData = stakeInfoForToken as any;

      const amountStaked = stakerData ? Number(stakerData[1]) : 0;
      const timeOfLastUpdate = stakerData ? Number(stakerData[2]) : 0;
      const unclaimedRewards = stakerData ? stakerData[3] : BigInt(0);
      const liveRewards = stakeData ? stakeData[1] : BigInt(0);
      const totalClaimableRewards =
        liveRewards > unclaimedRewards ? liveRewards : unclaimedRewards;

      return {
        balance: balance || BigInt(0),
        isApproved: approved || false,
        isStaked: amountStaked > 0,
        amountStaked,
        timeOfLastUpdate,
        unclaimedRewards,
        liveRewards,
        totalClaimableRewards,
      };
    };

    // Update member data
    const newMemberData = processNFTData(
      memberBalance,
      memberApproved,
      memberStakerInfo,
      memberStakeInfoForToken
    );
    setMemberData(newMemberData);

    // Update VIP data
    const newVipData = processNFTData(
      vipBalance,
      vipApproved,
      vipStakerInfo,
      vipStakeInfoForToken
    );
    setVipData(newVipData);

    // Set loading to false once we have some data
    if (memberBalance !== undefined || vipBalance !== undefined) {
      setIsLoading(false);
    }

    // Debug logging
    console.log("=== CONTRACT DATA DEBUG ===");
    console.log("Member Data:", newMemberData);
    console.log("VIP Data:", newVipData);
    console.log("=== END DEBUG ===");
  }, [
    memberBalance,
    vipBalance,
    memberApproved,
    vipApproved,
    memberStakerInfo,
    vipStakerInfo,
    memberStakeInfoForToken,
    vipStakeInfoForToken,
    memberRewardTokenBalance,
    vipRewardTokenBalance,
    memberRewardsPerUnitTime,
    vipRewardsPerUnitTime,
  ]);

  // Handler functions
  const handleApproval = async (nftType: "MEMBER" | "VIP") => {
    if (!address) return;
    const currentNFT = NFT_TYPES[nftType];
    if (!currentNFT) return;

    try {
      setError(null);
      console.log("Approving NFT for staking...", nftType);
      writeApproval({
        address: currentNFT.contract,
        abi: memberDropABI,
        functionName: "setApprovalForAll",
        args: [currentNFT.stakingContract, true],
      });
    } catch (error: any) {
      console.error("Approval error:", error);
      setError(`❌ ${error.message || "Approval failed"}`);
    }
  };

  const handleStake = async (nftType: "MEMBER" | "VIP") => {
    if (!address) return;
    const currentNFT = NFT_TYPES[nftType];
    if (!currentNFT) return;

    try {
      setError(null);
      console.log("Staking NFT...", nftType);
      writeStake({
        address: currentNFT.stakingContract,
        abi: stakingABI,
        functionName: "stake",
        args: [BigInt(currentNFT.tokenId), BigInt(1)],
      });
    } catch (error: any) {
      console.error("Staking error:", error);
      setError(`❌ ${error.message || "Staking failed"}`);
    }
  };

  const handleUnstake = async (nftType: "MEMBER" | "VIP") => {
    if (!address) return;
    const currentNFT = NFT_TYPES[nftType];
    if (!currentNFT) return;

    try {
      setError(null);
      console.log("Unstaking NFT...", nftType);
      writeUnstake({
        address: currentNFT.stakingContract,
        abi: stakingABI,
        functionName: "withdraw",
        args: [BigInt(currentNFT.tokenId), BigInt(1)],
      });
    } catch (error: any) {
      console.error("Unstaking error:", error);
      setError(`❌ ${error.message || "Unstaking failed"}`);
    }
  };

  const handleClaim = async (nftType: "MEMBER" | "VIP") => {
    if (!address) return;
    const currentNFT = NFT_TYPES[nftType];
    if (!currentNFT) return;

    try {
      setError(null);
      console.log("Claiming rewards...", nftType);
      writeClaim({
        address: currentNFT.stakingContract,
        abi: stakingABI,
        functionName: "claimRewards",
        args: [BigInt(currentNFT.tokenId)],
      });
    } catch (error: any) {
      console.error("Claiming error:", error);
      setError(`❌ ${error.message || "Claiming failed"}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          border: "1px solid #333",
          textAlign: "center",
          color: "white",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  // Render NFT Card
  const renderNFTCard = (nftType: "MEMBER" | "VIP", data: NFTStakingData) => {
    const currentNFT = NFT_TYPES[nftType];
    const borderColor = nftType === "MEMBER" ? "#8b5cf6" : "#ec4899";
    const icon = nftType === "MEMBER" ? "🏅" : "👑";
    const hasNFT = data.isStaked;

    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "20px",
          borderRadius: "8px",
          border: `1px solid ${borderColor}`,
        }}
      >
        <h3
          style={{
            color: "white",
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "22px",
          }}
        >
          <span style={{ fontSize: "32px", marginRight: "8px" }}>{icon}</span>
          {currentNFT?.name} Staking
        </h3>

        {!hasNFT ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎁</div>
            <h4
              style={{ color: "white", marginBottom: "8px", fontSize: "18px" }}
            >
              No {currentNFT?.name} Found
            </h4>
            <p
              style={{ color: "#888", marginBottom: "16px", fontSize: "14px" }}
            >
              You need to own a {currentNFT?.name} to stake
            </p>
          </div>
        ) : (
          <div>
            {/* Status Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {/* Staking Status */}
              <div
                style={{
                  textAlign: "center",
                  padding: "12px",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "8px",
                  border: "1px solid #444",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                  {data.isStaked ? "🔒" : "🔓"}
                </div>
                <div
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
                >
                  {data.isStaked ? "Staked" : "Not Staked"}
                </div>
                <div style={{ fontSize: "10px", color: "#888" }}>
                  {data.isStaked
                    ? `Amount: ${data.amountStaked}`
                    : "Ready to stake"}
                </div>
                {data.timeOfLastUpdate > 0 && (
                  <div
                    style={{
                      fontSize: "8px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Since:{" "}
                    {new Date(
                      data.timeOfLastUpdate * 1000
                    ).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Rewards */}
              <div
                style={{
                  textAlign: "center",
                  padding: "12px",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "8px",
                  border: "1px solid #fbbf24",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>💰</div>
                <div
                  style={{
                    color: "#fbbf24",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
                >
                  {parseFloat(
                    formatUnits(data.totalClaimableRewards, 18)
                  ).toFixed(4)}{" "}
                  PLS
                </div>
                <div style={{ fontSize: "10px", color: "#888" }}>
                  Claimable Rewards
                </div>
                <div
                  style={{ fontSize: "8px", color: "#666", marginTop: "4px" }}
                >
                  Live:{" "}
                  {parseFloat(formatUnits(data.liveRewards, 18)).toFixed(4)} PLS
                </div>
              </div>
            </div>

            {/* Earning Rate */}
            <div
              style={{
                textAlign: "center",
                padding: "12px",
                backgroundColor: "#064e3b",
                borderRadius: "8px",
                border: "1px solid #059669",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}
              >
                Earning Rate
              </div>
              <div
                style={{
                  color: "#10b981",
                  fontWeight: "bold",
                  fontSize: "16px",
                  marginBottom: "4px",
                }}
              >
                {currentNFT?.rewardRate} PLS per second
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                ≈{" "}
                {(
                  parseFloat(currentNFT?.rewardRate || "0") * 86400
                ).toLocaleString()}{" "}
                PLS per day
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {!data.isStaked ? (
                <>
                  {!data.isApproved && !isApprovalSuccess ? (
                    <button
                      onClick={() => handleApproval(nftType)}
                      disabled={isApprovalLoading}
                      style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: isApprovalLoading
                          ? "#666"
                          : borderColor,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        cursor: isApprovalLoading ? "not-allowed" : "pointer",
                        opacity: isApprovalLoading ? 0.7 : 1,
                      }}
                    >
                      {isApprovalLoading
                        ? "Approving..."
                        : "Approve for Staking"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStake(nftType)}
                      disabled={isStakeLoading}
                      style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: isStakeLoading ? "#666" : borderColor,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        cursor: isStakeLoading ? "not-allowed" : "pointer",
                        opacity: isStakeLoading ? 0.7 : 1,
                      }}
                    >
                      {isStakeLoading ? "Staking..." : "Stake NFT"}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleClaim(nftType)}
                    disabled={
                      isClaimLoading || data.totalClaimableRewards === BigInt(0)
                    }
                    style={{
                      flex: 1,
                      padding: "10px",
                      backgroundColor:
                        isClaimLoading ||
                        data.totalClaimableRewards === BigInt(0)
                          ? "#666"
                          : borderColor,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor:
                        isClaimLoading ||
                        data.totalClaimableRewards === BigInt(0)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        isClaimLoading ||
                        data.totalClaimableRewards === BigInt(0)
                          ? 0.7
                          : 1,
                    }}
                  >
                    {isClaimLoading
                      ? "Claiming..."
                      : `💰 Claim ${parseFloat(
                          formatUnits(data.totalClaimableRewards, 18)
                        ).toFixed(2)} PLS`}
                  </button>
                  <button
                    onClick={() => handleUnstake(nftType)}
                    disabled={isUnstakeLoading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      backgroundColor: "transparent",
                      color: "#ef4444",
                      border: "1px solid #ef4444",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: isUnstakeLoading ? "not-allowed" : "pointer",
                      opacity: isUnstakeLoading ? 0.7 : 1,
                    }}
                  >
                    {isUnstakeLoading ? "Unstaking..." : "🔓 Unstake"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h2
        style={{
          color: "white",
          textAlign: "center",
          marginBottom: "24px",
          fontSize: "32px",
          fontWeight: "bold",
        }}
      >
        Your Staking Dashboard
      </h2>

      {/* Contract Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #8b5cf6",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "20px", marginBottom: "8px" }}>🏅</div>
          <div
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "4px",
            }}
          >
            Member Pool Balance
          </div>
          <div style={{ color: "#8b5cf6", fontSize: "14px" }}>
            {memberRewardTokenBalance
              ? parseFloat(
                  formatUnits(memberRewardTokenBalance, 18)
                ).toLocaleString()
              : "0"}{" "}
            PLS
          </div>
          <div style={{ color: "#888", fontSize: "12px", marginTop: "4px" }}>
            Rate:{" "}
            {memberRewardsPerUnitTime
              ? formatUnits(memberRewardsPerUnitTime, 18)
              : "0"}{" "}
            PLS/sec
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #ec4899",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "20px", marginBottom: "8px" }}>👑</div>
          <div
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "4px",
            }}
          >
            VIP Pool Balance
          </div>
          <div style={{ color: "#ec4899", fontSize: "14px" }}>
            {vipRewardTokenBalance
              ? parseFloat(
                  formatUnits(vipRewardTokenBalance, 18)
                ).toLocaleString()
              : "0"}{" "}
            PLS
          </div>
          <div style={{ color: "#888", fontSize: "12px", marginTop: "4px" }}>
            Rate:{" "}
            {vipRewardsPerUnitTime
              ? formatUnits(vipRewardsPerUnitTime, 18)
              : "0"}{" "}
            PLS/sec
          </div>
        </div>
      </div>

      {/* Both NFT Cards Side by Side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Member NFT Card */}
        {renderNFTCard("MEMBER", memberData)}

        {/* VIP NFT Card */}
        {renderNFTCard("VIP", vipData)}
      </div>

      {/* Global Success/Error Messages */}
      {isStakeSuccess && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#064e3b",
            border: "1px solid #059669",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#10b981", margin: 0 }}>
            ✅ NFT staked successfully! You're now earning rewards.
          </p>
        </div>
      )}

      {isClaimSuccess && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#064e3b",
            border: "1px solid #059669",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#10b981", margin: 0 }}>
            ✅ Rewards claimed successfully!
          </p>
        </div>
      )}

      {isUnstakeSuccess && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#7c2d12",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#f59e0b", margin: 0 }}>
            ⚠️ NFT unstaked. You're no longer earning rewards.
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#7f1d1d",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
        </div>
      )}
    </div>
  );
}
