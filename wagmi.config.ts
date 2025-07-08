// wagmi.config.ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// PulseChain Mainnet configuration
export const pulseChain = defineChain({
  id: 369,
  name: "PulseChain",
  nativeCurrency: {
    decimals: 18,
    name: "Pulse",
    symbol: "PLS",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.pulsechain.com"],
    },
  },
  blockExplorers: {
    default: { name: "PulseScan", url: "https://scan.pulsechain.com" },
  },
  testnet: false,
});

// Fallback project ID for development (get your own from https://cloud.walletconnect.com/)
const projectId = "8bcfb9e407220684c6af6186c16bde86";

export const config = getDefaultConfig({
  appName: "Sigma 369 Club",
  projectId: projectId,
  chains: [pulseChain],
  ssr: true,
});

// Contract addresses
export const CONTRACTS = {
  // NFT Contracts
  MEMBER_DROP: "0xdbDa9CAfD6f19cB11E23158686e6Fc146e5E37bE" as const,
  VIP_DROP: "0xDA4963194feC2522337e17406c2957b5B0d11D21" as const,

  // Staking Contracts
  MEMBER_STAKE: "0xca440387bE079F23EC56B40C075B712aa2BAe69C" as const,
  VIP_STAKE: "0x7a9914bBD050ED27b2b692CE6840603e9d38E911" as const,

  // Token Contracts
  SIGMA_TOKEN: "0x4FfF88B8d2cAe7d0e913198DF18B7f6a02850EC5" as const, // E369 token for claiming
  PLS_TOKEN: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27" as const, // PLS reward token

  // Club Wallet
  CLUB_WALLET: "0x9791609dd38ACa2CcAA3Ba92526CF6f02ED4B66B" as const,
} as const;

// NFT Types and their requirements
export const NFT_TYPES = {
  MEMBER: {
    contract: CONTRACTS.MEMBER_DROP,
    stakingContract: CONTRACTS.MEMBER_STAKE,
    price: "369000000000000000000000", // 369,000 Sigma 369 tokens
    rewardRate: "0.0963", // 0.369 PLS per second
    name: "Club Member NFT",
    tokenId: 0,
  },
  VIP: {
    contract: CONTRACTS.VIP_DROP,
    stakingContract: CONTRACTS.VIP_STAKE,
    price: "3690000000000000000000000", // 3,690,000 Sigma 369 tokens
    rewardRate: "0.963", // 0.963 PLS per second
    name: "Club VIP NFT",
    tokenId: 0,
  },
} as const;
