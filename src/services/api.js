import axios from 'axios';

const API_URL = 'https://your-ai-api-endpoint.com';

export const getAIResponse = async(input) => {
    try {
        const response = await axios.post(`${API_URL}/ai-response`, { input });
        return response.data;
    } catch (error) {
        console.error('Error fetching AI response:', error);
        throw error;
    }
};