import { createPublicClient, http, PublicClient } from "viem";
import { BLOCKCHAIN_CONFIG } from "@/config/blockchain";
import { abi } from "@/blockchain/abi";

export class BlockchainClient {
  
  private static instance: BlockchainClient;
  private client: PublicClient;

  private constructor() {
    this.client = createPublicClient({
      chain: BLOCKCHAIN_CONFIG.chain,
      transport: http(BLOCKCHAIN_CONFIG.rpcUrl),
    });
  }

  /**
   * If not exist, create and return the instance of the BlockchainClient
   * @returns The instance of the BlockchainClient
   */

  public static getInstance(): BlockchainClient {
    if (!BlockchainClient.instance) {
      BlockchainClient.instance = new BlockchainClient();
    }
    return BlockchainClient.instance;
  }

  public getClient(): PublicClient {
    return this.client;
  }

  public getContractAddress(): `0x${string}` {
    return BLOCKCHAIN_CONFIG.contractAddress;
  }

  public getAbi() {
    return abi;
  }
} 