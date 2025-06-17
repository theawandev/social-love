// backend/src/services/ai/image-generator.service.js
const axios = require('axios');

const generateImage = async (prompt, style = 'realistic', size = '1024x1024') => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Return placeholder image URL for demo
      return `https://picsum.photos/${size.replace('x', '/')}?random=${Date.now()}`;
    }

    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      prompt: `${style} style: ${prompt}`,
      n: 1,
      size: size,
      quality: 'standard'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data[0].url;
  } catch (error) {
    console.error('Image generation error:', error);

    // Return placeholder image URL for demo
    return `https://picsum.photos/${size.replace('x', '/')}?random=${Date.now()}`;
  }
};

const generateImageVariations = async (imageUrl, count = 2, size = '1024x1024') => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Return placeholder variations
      return Array.from({ length: count }, (_, i) =>
        `https://picsum.photos/${size.replace('x', '/')}?random=${Date.now() + i}`
      );
    }

    const response = await axios.post('https://api.openai.com/v1/images/variations', {
      image: imageUrl,
      n: count,
      size: size
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data.map(img => img.url);
  } catch (error) {
    console.error('Image variation error:', error);

    // Return placeholder variations
    return Array.from({ length: count }, (_, i) =>
      `https://picsum.photos/${size.replace('x', '/')}?random=${Date.now() + i}`
    );
  }
};

module.exports = {
  generateImage,
  generateImageVariations
};