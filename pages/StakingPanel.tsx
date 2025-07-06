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

export default function StakingPanel() {
  const { address } = useAccount();
  const [selectedNFT, setSelectedNFT] = useState<"MEMBER" | "VIP">("MEMBER");
  const [error, setError] = useState<string | null>(null);

  // Early return if no address - show basic message
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

  const currentNFT = NFT_TYPES[selectedNFT];

  // Check NFT balances
  const { data: memberBalance, isLoading: memberBalanceLoading } =
    useReadContract({
      address: CONTRACTS.MEMBER_DROP,
      abi: memberDropABI,
      functionName: "balanceOf",
      args: [address, BigInt(0)],
    });

  const { data: vipBalance, isLoading: vipBalanceLoading } = useReadContract({
    address: CONTRACTS.VIP_DROP,
    abi: memberDropABI,
    functionName: "balanceOf",
    args: [address, BigInt(0)],
  });

  // Check approval
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: currentNFT?.contract,
    abi: memberDropABI,
    functionName: "isApprovedForAll",
    args:
      currentNFT && address ? [address, currentNFT.stakingContract] : undefined,
  });

  // Get staker info from the stakers mapping
  const { data: stakerInfo, refetch: refetchStakerInfo } = useReadContract({
    address: currentNFT?.stakingContract,
    abi: stakingABI,
    functionName: "stakers",
    args:
      currentNFT && address ? [BigInt(currentNFT.tokenId), address] : undefined,
  });

  // Get stake info for token
  const { data: stakeInfoForToken, refetch: refetchStakeInfoForToken } =
    useReadContract({
      address: currentNFT?.stakingContract,
      abi: stakingABI,
      functionName: "getStakeInfoForToken",
      args:
        currentNFT && address
          ? [BigInt(currentNFT.tokenId), address]
          : undefined,
    });

  // Get overall stake info
  const { data: overallStakeInfo, refetch: refetchOverallStakeInfo } =
    useReadContract({
      address: currentNFT?.stakingContract,
      abi: stakingABI,
      functionName: "getStakeInfo",
      args: address ? [address] : undefined,
    });

  // Console log all contract data
  useEffect(() => {
    console.log("=== CONTRACT DATA DEBUG ===");
    console.log("Address:", address);
    console.log("Selected NFT:", selectedNFT);
    console.log("Current NFT Config:", currentNFT);
    console.log("CONTRACTS:", CONTRACTS);
    console.log("Member Balance:", memberBalance?.toString());
    console.log("VIP Balance:", vipBalance?.toString());
    console.log("Is Approved:", isApproved);
    console.log("Staker Info (raw):", stakerInfo);
    console.log("Stake Info For Token (raw):", stakeInfoForToken);
    console.log("Overall Stake Info (raw):", overallStakeInfo);

    if (stakerInfo) {
      const stakerData = stakerInfo as any;
      console.log("Staker Info Breakdown:");
      console.log("  - conditionIdOfLastUpdate:", stakerData[0]?.toString());
      console.log("  - amountStaked:", stakerData[1]?.toString());
      console.log("  - timeOfLastUpdate:", stakerData[2]?.toString());
      console.log("  - unclaimedRewards:", stakerData[3]?.toString());
    }

    if (stakeInfoForToken) {
      const stakeData = stakeInfoForToken as any;
      console.log("Stake Info For Token Breakdown:");
      console.log("  - tokensStaked:", stakeData[0]?.toString());
      console.log("  - rewards:", stakeData[1]?.toString());
    }

    if (overallStakeInfo) {
      const overallData = overallStakeInfo as any;
      console.log("Overall Stake Info Breakdown:");
      console.log("  - tokensStaked array:", overallData[0]);
      console.log("  - tokenAmounts array:", overallData[1]);
      console.log("  - totalRewards:", overallData[2]?.toString());
    }
    console.log("=== END DEBUG ===");
  }, [
    address,
    selectedNFT,
    currentNFT,
    memberBalance,
    vipBalance,
    isApproved,
    stakerInfo,
    stakeInfoForToken,
    overallStakeInfo,
  ]);

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

  // Process data
  const currentBalance = selectedNFT === "MEMBER" ? memberBalance : vipBalance;
  const hasNFT = currentBalance && currentBalance > 0;

  // Extract staker data
  const stakerData = stakerInfo as any;
  const amountStaked = stakerData ? Number(stakerData[1]) : 0;
  const timeOfLastUpdate = stakerData ? Number(stakerData[2]) : 0;
  const unclaimedRewards = stakerData ? stakerData[3] : BigInt(0);
  const isStaked = amountStaked > 0;

  // Extract rewards from stakeInfoForToken (this has the live rewards)
  const stakeData = stakeInfoForToken as any;
  const liveRewards = stakeData ? stakeData[1] : BigInt(0);

  // Use the higher of the two reward values
  const totalClaimableRewards =
    liveRewards > unclaimedRewards ? liveRewards : unclaimedRewards;

  // Auto-select NFT type
  useEffect(() => {
    if (
      memberBalance &&
      memberBalance > 0 &&
      (!vipBalance || vipBalance === BigInt(0))
    ) {
      setSelectedNFT("MEMBER");
    } else if (vipBalance && vipBalance > 0) {
      setSelectedNFT("VIP");
    }
  }, [memberBalance, vipBalance]);

  // Refetch after transactions
  useEffect(() => {
    if (
      isApprovalSuccess ||
      isStakeSuccess ||
      isUnstakeSuccess ||
      isClaimSuccess
    ) {
      console.log("Transaction success detected, refetching data...");
      refetchApproval();
      refetchStakerInfo();
      refetchStakeInfoForToken();
      refetchOverallStakeInfo();
    }
  }, [isApprovalSuccess, isStakeSuccess, isUnstakeSuccess, isClaimSuccess]);

  // Handler functions
  const handleApproval = async () => {
    if (!address || !currentNFT) return;
    try {
      setError(null);
      console.log("Approving NFT for staking...");
      console.log("NFT Contract:", currentNFT.contract);
      console.log("Staking Contract:", currentNFT.stakingContract);
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

  const handleStake = async () => {
    if (!address || !currentNFT) return;
    try {
      setError(null);
      console.log("Staking NFT...");
      console.log("Token ID:", currentNFT.tokenId);
      console.log("Amount:", 1);
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

  const handleUnstake = async () => {
    if (!address || !currentNFT) return;
    try {
      setError(null);
      console.log("Unstaking NFT...");
      console.log("Token ID:", currentNFT.tokenId);
      console.log("Amount:", 1);
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

  const handleClaim = async () => {
    if (!address || !currentNFT) return;
    try {
      setError(null);
      console.log("Claiming rewards...");
      console.log("Token ID:", currentNFT.tokenId);
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
  if (memberBalanceLoading || vipBalanceLoading) {
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

  const hasMember = memberBalance && memberBalance > 0;
  const hasVIP = vipBalance && vipBalance > 0;
  const hasMultiple = hasMember && hasVIP;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      {/* NFT Selection */}
      {hasMultiple && (
        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #333",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            Select NFT to Stake
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <button
              onClick={() => setSelectedNFT("MEMBER")}
              style={{
                padding: "16px",
                borderRadius: "8px",
                border:
                  selectedNFT === "MEMBER"
                    ? "2px solid #8b5cf6"
                    : "1px solid #666",
                backgroundColor:
                  selectedNFT === "MEMBER" ? "#581c87" : "#2a2a2a",
                color: "white",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🏅</div>
              <div style={{ fontWeight: "bold" }}>Member NFT</div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                0.369 PLS/sec
              </div>
            </button>
            <button
              onClick={() => setSelectedNFT("VIP")}
              style={{
                padding: "16px",
                borderRadius: "8px",
                border:
                  selectedNFT === "VIP"
                    ? "2px solid #ec4899"
                    : "1px solid #666",
                backgroundColor: selectedNFT === "VIP" ? "#831843" : "#2a2a2a",
                color: "white",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>👑</div>
              <div style={{ fontWeight: "bold" }}>VIP NFT</div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                0.963 PLS/sec
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #333",
        }}
      >
        <h2
          style={{ color: "white", textAlign: "center", marginBottom: "20px" }}
        >
          {currentNFT?.name} Staking
        </h2>

        {!isStaked && !hasNFT ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎁</div>
            <h3 style={{ color: "white", marginBottom: "8px" }}>
              No {currentNFT?.name} Found
            </h3>
            <p style={{ color: "#888", marginBottom: "16px" }}>
              You need to own a {currentNFT?.name} to stake
            </p>
            <a
              href="/claim"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#8b5cf6",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              Claim NFT First
            </a>
          </div>
        ) : (
          <div>
            {/* Status Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              {/* Staking Status */}
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "8px",
                  border: "1px solid #444",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                  {isStaked ? "🔒" : "🔓"}
                </div>
                <div
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  {isStaked ? "Staked" : "Not Staked"}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {isStaked ? `Amount: ${amountStaked}` : "Ready to stake"}
                </div>
                {timeOfLastUpdate > 0 && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Since:{" "}
                    {new Date(timeOfLastUpdate * 1000).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Rewards */}
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "8px",
                  border: "1px solid #fbbf24",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>💰</div>
                <div
                  style={{
                    color: "#fbbf24",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  {parseFloat(
                    formatUnits(totalClaimableRewards || BigInt(0), 18)
                  ).toFixed(6)}{" "}
                  PLS
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  Claimable Rewards
                </div>
                <div
                  style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}
                >
                  Live:{" "}
                  {parseFloat(
                    formatUnits(liveRewards || BigInt(0), 18)
                  ).toFixed(6)}{" "}
                  PLS
                </div>
              </div>
            </div>

            {/* Earning Rate */}
            <div
              style={{
                textAlign: "center",
                padding: "16px",
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
                  fontSize: "18px",
                  marginBottom: "8px",
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
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {!isStaked ? (
                // User has NFT but hasn't staked yet
                <>
                  {!isApproved && !isApprovalSuccess ? (
                    <button
                      onClick={handleApproval}
                      disabled={isApprovalLoading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: isApprovalLoading ? "#666" : "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
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
                      onClick={handleStake}
                      disabled={isStakeLoading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: isStakeLoading ? "#666" : "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: isStakeLoading ? "not-allowed" : "pointer",
                        opacity: isStakeLoading ? 0.7 : 1,
                      }}
                    >
                      {isStakeLoading ? "Staking..." : "Stake NFT"}
                    </button>
                  )}
                </>
              ) : (
                // User has staked NFT - show claim and unstake options
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleClaim}
                    disabled={
                      isClaimLoading || totalClaimableRewards === BigInt(0)
                    }
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor:
                        isClaimLoading || totalClaimableRewards === BigInt(0)
                          ? "#666"
                          : "#8b5cf6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor:
                        isClaimLoading || totalClaimableRewards === BigInt(0)
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        isClaimLoading || totalClaimableRewards === BigInt(0)
                          ? 0.7
                          : 1,
                    }}
                  >
                    {isClaimLoading
                      ? "Claiming..."
                      : `💰 Claim ${parseFloat(
                          formatUnits(totalClaimableRewards, 18)
                        ).toFixed(2)} PLS`}
                  </button>
                  <button
                    onClick={handleUnstake}
                    disabled={isUnstakeLoading}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "transparent",
                      color: "#ef4444",
                      border: "1px solid #ef4444",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: isUnstakeLoading ? "not-allowed" : "pointer",
                      opacity: isUnstakeLoading ? 0.7 : 1,
                    }}
                  >
                    {isUnstakeLoading ? "Unstaking..." : "🔓 Unstake"}
                  </button>
                </div>
              )}
            </div>

            {/* Success/Error Messages */}
            {isStakeSuccess && (
              <div
                style={{
                  marginTop: "16px",
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
                  marginTop: "16px",
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
                  marginTop: "16px",
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
                  marginTop: "16px",
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
        )}
      </div>
    </div>
  );
}
