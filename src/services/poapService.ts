
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface POAPDeliveryRequest {
  slug: string;
  card_title: string;
  card_text: string;
  page_title: string;
  page_text: string;
  event_ids: string;
  secret_codes: string;
  image: string;
  page_title_image: string;
  metadata_title: string;
  metadata_description: string;
  addresses: Array<{
    address: string;
    events: number[];
  }>;
}

export class POAPService {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://api.poap.tech',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });

  }

  
  async createDelivery(data: POAPDeliveryRequest): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.client.post('/deliveries', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.response?.data || error.message;
        throw new Error(`POAP API Error: ${error.response?.status} - ${message}`);
      }
      throw error;
    }
  }



  
  async  getEventInfo(eventId: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.client.get(`/events/id/${eventId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.response?.data || error.message;
        throw new Error(`POAP API Error: ${error.response?.status} - ${message}`);
      }
      throw error;
    }
  }

  

  
}
