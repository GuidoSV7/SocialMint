import { BlockchainClient } from "@/lib/blockchain/client";
import { encodeFunctionData, TransactionSerializable } from "viem";
import { avalancheFuji } from "viem/chains";
import { serialize } from "wagmi";

export class EventError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'EventError';
  }
}

export interface EventData {
  poadId: string;
  name: string;
  tags: string[];
  address: string;
  participantsAddress: string[];
  startTime: bigint;
  duration: bigint;
  closed: boolean;
  registeredQuantity: bigint;
}

export class EventService {
  private static blockchainClient = BlockchainClient.getInstance();

  /**
     * Get the event data from the blockchain
     * @param eventCode The code of the event to get
     * @returns The event data
     * @throws EventError if the event is not found or if there is an error fetching the event data
     */
  static async getEvent(eventCode: string): Promise<EventData> {
    try {
      const eventData = await this.blockchainClient.getClient().readContract({
        address: this.blockchainClient.getContractAddress(),
        abi: this.blockchainClient.getAbi(),
        functionName: "getEvent",
        args: [eventCode.toLowerCase()],
      });

      const parsedData = this.parseEventData(eventData);
      
      if (!parsedData.tags || parsedData.tags.length === 0) {
        throw new EventError('Event not found', 'EVENT_NOT_FOUND');
      }

      return parsedData;
    } catch (error) {
      if (error instanceof EventError) {
        throw error;
      }
      throw new EventError(
        'Failed to fetch event data',
        'FETCH_EVENT_ERROR'
      );
    }
  }

  /**
   * Create a transaction to add a participant to an event
   * @param eventCode The code of the event to add a participant to
   * @returns The transaction data
   * @throws EventError if the transaction is not created or if there is an error creating the transaction
   */
  static async createAddParticipantTransaction(eventCode: string): Promise<string> {
    try {
      const data = encodeFunctionData({
        abi: this.blockchainClient.getAbi(),
        functionName: "addParticipant",
        args: [eventCode],
      });

      const tx: TransactionSerializable = {
        to: this.blockchainClient.getContractAddress(),
        data: data,
        chainId: avalancheFuji.id,
        type: "legacy",
      };

      return serialize(tx);
    } catch (error) {
      throw new EventError(
        'Failed to create transaction',
        'CREATE_TRANSACTION_ERROR'
      );
    }
  }

  /**
   * Parse the event data from the raw data
   * @param rawData The raw data to parse
   * @returns The parsed event data
   * @throws EventError if the event data is not parsed correctly
   */
  private static parseEventData(rawData: any): EventData {
    try {
      return {
        poadId: rawData[0] as string,
        name: rawData[1] as string,
        tags: Array.isArray(rawData[2]) ? rawData[2] : [],
        address: rawData[3] as string,
        participantsAddress: Array.isArray(rawData[4]) ? rawData[4] : [],
        startTime: rawData[5] as bigint,
        duration: rawData[6] as bigint,
        closed: rawData[7] as boolean,
        registeredQuantity: rawData[8] as bigint,
      };
    } catch (error) {
      throw new EventError(
        'Failed to parse event data',
        'PARSE_EVENT_ERROR'
      );
    }
  }
} 