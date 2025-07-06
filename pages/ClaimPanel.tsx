import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, NFT_TYPES } from "../wagmi.config";
import { memberDropABI, sigmaTokenABI } from "../abis";
import Link from "next/link";
import { Address } from "viem";
// Video mapping for MEMBER and VIP NFTs
const NFT_VIDEOS = {
  MEMBER: "/videos/club.mp4",
  VIP: "/videos/vip.mp4",
} as const;

interface ClaimPanelProps {
  nftType: "MEMBER" | "VIP";
}

export default function ClaimPanel({ nftType }: ClaimPanelProps) {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const currentNFT = NFT_TYPES[nftType] || NFT_TYPES.MEMBER;

  // Get price using useEffect
  useEffect(() => {
    if (currentNFT?.price) {
      const calculatedPrice = Number(currentNFT.price) / 1e18;
      setPrice(calculatedPrice);
    }
  }, [currentNFT?.price]);

  // Contract reads
  const {
    data: allowance,
    isLoading: isAllowanceLoading,
    refetch: refetchAllowance,
  } = useReadContract({
    address: CONTRACTS.SIGMA_TOKEN,
    abi: sigmaTokenABI,
    functionName: "allowance",
    args: address ? [address, currentNFT.contract] : undefined,
    query: { enabled: !!address, retry: 3, retryDelay: 1000 },
  });

  const { data: sigmaBalance, isLoading: isBalanceLoading } = useReadContract({
    address: CONTRACTS.SIGMA_TOKEN,
    abi: sigmaTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, retry: 3, retryDelay: 1000 },
  });

  const { data: nftBalance, isLoading: isNftBalanceLoading } = useReadContract({
    address: currentNFT.contract,
    abi: memberDropABI,
    functionName: "balanceOf",
    args: address ? [address, BigInt(currentNFT.tokenId)] : undefined,
    query: { enabled: !!address, retry: 3, retryDelay: 1000 },
  });

  // Transaction hooks for approval
  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Transaction hooks for claim
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();
  const { isLoading: isClaimLoading, isSuccess: isClaimTransactionSuccess } =
    useWaitForTransactionReceipt({ hash: claimHash });

  // Refetch allowance after approval
  useEffect(() => {
    if (isApproveSuccess) refetchAllowance();
  }, [isApproveSuccess, refetchAllowance]);

  // Handle claim success
  useEffect(() => {
    if (isClaimTransactionSuccess) {
      setClaimSuccess(true);
      setIsModalOpen(false);
    }
  }, [isClaimTransactionSuccess]);

  const needsApproval = allowance ? allowance < BigInt(currentNFT.price) : true;
  const hasEnoughTokens = sigmaBalance
    ? sigmaBalance >= BigInt(currentNFT.price)
    : false;
  const alreadyOwnsNFT = nftBalance ? nftBalance > 0 : false;

  const sigmaBalanceFormatted = useMemo(() => {
    return sigmaBalance ? parseFloat(sigmaBalance.toString()) / 1e18 : 0;
  }, [sigmaBalance]);

  const handleApprove = async () => {
    if (!address) return setError("🔌 Connect your wallet first");
    if (!hasEnoughTokens)
      return setError(
        `❌ Insufficient Sigma 369 tokens. Need ${
          currentNFT && (Number(currentNFT.price) / 1e18).toLocaleString()
        }`
      );

    try {
      setError(null);
      writeApprove({
        address: CONTRACTS.SIGMA_TOKEN,
        abi: sigmaTokenABI,
        functionName: "approve",
        args: [currentNFT.contract, BigInt(currentNFT.price)],
      });
    } catch (e: any) {
      setError(`❌ ${e.message || "Approval failed"}`);
    }
  };

  const handleClaimWithWagmi = async () => {
    try {
      if (!address) return setError("🔌 Connect your wallet first");
      if (!hasEnoughTokens)
        return setError(
          `❌ Insufficient Sigma 369 tokens. Need ${
            currentNFT && (Number(currentNFT.price) / 1e18).toLocaleString()
          }`
        );
      if (alreadyOwnsNFT)
        return setError(`❌ You already own a ${currentNFT.name}`);

      setError(null);

      // Use wagmi's writeContract with the memberDropABI
      writeClaim({
        address: currentNFT.contract,
        abi: memberDropABI,
        functionName: "claim",
        args: [
          address, // _receiver
          BigInt(currentNFT.tokenId), // _tokenId
          BigInt(1), // _quantity
          CONTRACTS.SIGMA_TOKEN, // _currency (using Sigma token address)
          BigInt(currentNFT.price), // _pricePerToken
          {
            proof: [], // empty proof for public claims
            quantityLimitPerWallet: BigInt(0), // 0 means no limit for this wallet
            pricePerToken: BigInt(currentNFT.price),
            currency: "0x0000000000000000000000000000000000000000",
          }, // _allowlistProof
          "0x", // _data (empty bytes)
        ],
      });
    } catch (error: any) {
      console.error("Claim error:", error);
      const message = error.message || error.reason || "Unknown error";
      if (
        message.toLowerCase().includes("already claimed") ||
        message.toLowerCase().includes("exceed limit")
      ) {
        setError(`❌ You have already claimed your ${currentNFT.name}.`);
      } else {
        setError(`❌ ${message}`);
      }
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (!address) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="card-neon">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-xl font-semibold mb-2">Wallet Not Connected</h3>
          <p className="text-gray-400">Please connect your wallet to claim.</p>
        </div>
      </div>
    );
  }

  if (isAllowanceLoading || isBalanceLoading || isNftBalanceLoading) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="card-neon">Loading...</div>
      </div>
    );
  }

  if (claimSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="card-neon">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2 text-green-400">Success!</h3>
          <p className="text-green-400 mb-4">
            ✅ {currentNFT.name} claimed successfully!
          </p>
          <div className="mb-6">
            <video
              className="w-full rounded-lg border-2 border-purple-500/50"
              controls
              autoPlay
              muted
              playsInline
              onError={(e) => {
                setError("❌ Failed to load video");
                console.error("Video error:", e);
              }}
            >
              <source src={NFT_VIDEOS[nftType]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            You can now stake your NFT to earn {currentNFT.rewardRate} PLS per
            second.
          </p>
          <Link href="/stake" className="btn neon-purple-outline inline-block">
            Go to Staking →
          </Link>
        </div>
      </div>
    );
  }

  if (alreadyOwnsNFT) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="card-neon">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold mb-2">Already Claimed!</h3>
          <p className="text-gray-400">You already own a {currentNFT.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-4">
      {/* NFT Info Card */}
      <div className="card-neon">
        <h3 className="neon-heading text-xl font-semibold mb-4">
          {currentNFT.name}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Price:</span>
            <span className="text-white font-semibold">
              {(Number(currentNFT.price) / 1e18).toLocaleString()} Σ369
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Reward Rate:</span>
            <span className="text-white font-semibold">
              {currentNFT.rewardRate} PLS/sec
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Your Balance:</span>
            <span
              className={`font-semibold ${
                hasEnoughTokens ? "text-green-400" : "text-red-400"
              }`}
            >
              {sigmaBalanceFormatted.toLocaleString()} Σ369
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!hasEnoughTokens ? (
        <div className="card-neon">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-semibold mb-2 text-red-400">
            Insufficient Balance
          </h3>
          <p className="text-gray-400 text-sm">
            You need {(Number(currentNFT.price) / 1e18).toLocaleString()} Sigma
            369 tokens to claim this NFT
          </p>
        </div>
      ) : needsApproval && !isApproveSuccess ? (
        <div>
          <div className="mb-4">
            <p className="text-sm text-white mb-2">
              First, approve spending{" "}
              {(Number(currentNFT.price) / 1e18).toLocaleString()} Σ369 tokens
            </p>
          </div>
          <button
            onClick={handleApprove}
            disabled={isApproveLoading}
            className="btn neon-purple-outline w-full"
            style={{ color: "white" }}
          >
            {isApproveLoading ? "Approving…" : `Approve Σ369 Tokens`}
          </button>
        </div>
      ) : (
        <button
          onClick={openModal}
          disabled={isClaimLoading}
          className="btn-neon inline-block"
        >
          {isClaimLoading ? "Claiming…" : `Claim ${currentNFT.name}`}
        </button>
      )}

      {error && (
        <div className="card-neon border-red-500/50">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Preview {currentNFT.name}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <video
                className="w-full rounded-lg border-2 border-purple-500/50"
                controls
                autoPlay
                muted
                playsInline
                onError={(e) => {
                  setError("❌ Failed to load video");
                  console.error("Video error:", e);
                }}
              >
                <source src={NFT_VIDEOS[nftType]} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <button
              onClick={handleClaimWithWagmi}
              disabled={isClaimLoading}
              className="btn-neon w-full"
            >
              {isClaimLoading
                ? "Claiming…"
                : `Confirm Claim ${currentNFT.name}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
