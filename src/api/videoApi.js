import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';

export const fetchVideo = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};