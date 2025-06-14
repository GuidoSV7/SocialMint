import { BlockchainClient } from "@/lib/blockchain/client";
import { encodeFunctionData, TransactionSerializable, WalletClient, PublicClient } from "viem";
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

export interface CreateEventParams {
  code: string;
  name: string;
  hashtags: string[];
  durationSeconds: bigint;
  poapId: string;
}

export interface PaginatedEvent {
  code: string;
  name: string;
  creator: `0x${string}`;
  startTime: bigint;
  duration: bigint;
  closed: boolean;
  poapId: string;
  hashtags: readonly string[];
  participantCount: bigint;
}

export interface PaginatedEventsResponse {
  events: PaginatedEvent[];
  totalEvents: bigint;
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

  /**
   * Create a new event on the blockchain
   * @param params The parameters for creating the event
   * @param walletClient The wallet client to use for signing the transaction
   * @returns The transaction hash
   * @throws EventError if the transaction creation or signing fails
   */
  static async createEvent(
    params: CreateEventParams,
    walletClient: WalletClient
  ): Promise<`0x${string}`> {
    console.log('Creating event', params);
    console.log('Wallet client', walletClient);
    console.log('Blockchain client', this.blockchainClient.getContractAddress());
    try {
      if (!walletClient.account) {
        throw new EventError('No account connected', 'NO_ACCOUNT_ERROR');
      }

      const data = encodeFunctionData({
        abi: this.blockchainClient.getAbi(),
        functionName: "createEvent",
        args: [
          params.code,
          params.name,
          params.hashtags,
          params.durationSeconds,
          params.poapId
        ],
      });

      const tx: TransactionSerializable = {
        to: this.blockchainClient.getContractAddress(),
        data: data,
        chainId: avalancheFuji.id,
        type: "legacy",
      };

      const hash = await walletClient.sendTransaction({
        ...tx,
        account: walletClient.account,
        chain: avalancheFuji,
      });

      return hash;
    } catch (error) {
      console.log('Error creating event', error);
      throw new EventError(
        'Failed to create event transaction',
        'CREATE_EVENT_ERROR'
      );
    }
  }

  /**
   * Get paginated events from the blockchain
   * @param page The page number (1-based)
   * @param pageSize The number of events per page
   * @returns The paginated events and total count
   * @throws EventError if there is an error fetching the events
   */
  static async getPaginatedEvents(page: number, pageSize: number): Promise<PaginatedEventsResponse> {
    try {
      const start = (page - 1) * pageSize;
      
      const [totalEvents, paginatedData] = await Promise.all([
        this.blockchainClient.getClient().readContract({
          address: this.blockchainClient.getContractAddress(),
          abi: this.blockchainClient.getAbi(),
          functionName: "totalEvents",
        }),
        this.blockchainClient.getClient().readContract({
          address: this.blockchainClient.getContractAddress(),
          abi: this.blockchainClient.getAbi(),
          functionName: "getEventsPaginated",
          args: [BigInt(start), BigInt(pageSize)],
        })
      ]);

      const [
        codes,
        names,
        creators,
        startTimes,
        durations,
        closedStatuses,
        poapIds,
        hashtags,
        participantCounts
      ] = paginatedData;

      const events: PaginatedEvent[] = codes.map((code, index) => ({
        code,
        name: names[index],
        creator: creators[index],
        startTime: startTimes[index],
        duration: durations[index],
        closed: closedStatuses[index],
        poapId: poapIds[index],
        hashtags: hashtags[index],
        participantCount: participantCounts[index]
      }));

      return {
        events,
        totalEvents
      };
    } catch (error) {
      throw new EventError(
        'Failed to fetch paginated events',
        'FETCH_EVENTS_ERROR'
      );
    }
  }
} 