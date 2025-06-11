import axios from 'axios';
const apiKey = process.env.API_KEY;
export const apiClient = axios.create({
    baseURL: 'https://twttrapi.p.rapidapi.com',
    headers: {
        'x-rapidapi-key': `${apiKey}`,
        'Content-Type': 'application/json',
    },
});
