
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface POAPDeliveryRequest {

  eventId: string;
  secret_codes: string;
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

  
  async createDelivery(data: POAPDeliveryRequest ): Promise<any> {

    const eventResponse =  await this.getEventInfo(data.eventId);
    const dataEvent = eventResponse;
    console.log(dataEvent);
    const slug = dataEvent.name.toLowerCase().replace(/ /g, '-');

    const dataDelivery = {
      ...data,
      slug: slug,
      image: dataEvent.image_url,
      page_title_image: dataEvent.image_url,
      event_ids: data.eventId,
      metadata_title: dataEvent.name,
      metadata_description: dataEvent.description,
      card_title: "RECLAMA TU POAP!",
      card_text: "¡Gracias por asistir a nuestro evento! 🎉",
      page_title: dataEvent.name,
      page_text: dataEvent.description,

    }  

    try {
      const response: AxiosResponse<any> = await this.client.post('/deliveries', dataDelivery);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.response?.data || error.message;
        throw new Error(`POAP API Error: ${error.response?.status} - ${message}`);
      }
      throw error;
    }
  }




  async getEventInfo(eventId: string): Promise<any> {
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
