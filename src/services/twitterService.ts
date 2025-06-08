import { apiClient } from '@/lib/axiosInstace';
import mockData from '@/mocks/twitter-mock.json';

export async function getLatestTweetByUsername(handler: string): Promise<any> {
    try {
        // Mock response instead of real API call
        // const latestTweets = await apiClient.get(`/user-tweets?username=${handler}`);

        // Return mock data from JSON file
        return mockData.data ?? null;
    } catch (error) {
        console.error(`Error fetching tweet for @${handler}:`, error);
        return null;
    }
}
