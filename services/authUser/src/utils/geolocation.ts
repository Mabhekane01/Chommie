import axios from 'axios';

export const getGeoLocationFromIP = async (
  ip: string
): Promise<{ country: string; city: string }> => {
  try {
    const response = await axios.get(
      `http://ip-api.com/json/${ip}?fields=country,city,status`
    );
    if (response.data.status === 'success') {
      return {
        country: response.data.country || 'Unknown',
        city: response.data.city || 'Unknown',
      };
    }
    return { country: 'Unknown', city: 'Unknown' };
  } catch (err) {
    return { country: 'Unknown', city: 'Unknown' };
  }
};
