import { avalancheFuji } from "viem/chains";

export const BLOCKCHAIN_CONFIG = {
  chain: avalancheFuji,
  rpcUrl: `https://avalanche-fuji.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
} as const; 