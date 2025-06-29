const axios = require('axios');
const { truncateText, capitalizeFirst } = require('../../utils/helpers');
const logger = require('../../utils/logger');

// Text generation using OpenAI GPT
const generateText = async (prompt, platform = null, postType = null) => {
  try {
    // Sanitize and prepare prompt
    const cleanPrompt = truncateText(prompt, 500);

    // Add platform-specific context to prompt
    let enhancedPrompt = cleanPrompt;

    if (platform) {
      const platformContext = {
        facebook: "Create engaging Facebook post content that encourages interaction",
        instagram: "Write Instagram-style content with emojis and hashtags",
        linkedin: "Generate professional LinkedIn content for business networking",
        tiktok: "Create catchy, trendy TikTok content that appeals to younger audience",
        youtube: "Write compelling YouTube content that drives engagement"
      };

      enhancedPrompt = `${platformContext[platform]}. ${cleanPrompt}`;
    }

    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured, using fallback');
      return getFallbackText(platform, cleanPrompt);
    }

    logger.info('Generating AI text', { platform, postType, promptLength: cleanPrompt.length });

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a social media content creator. Generate engaging, platform-appropriate content.'
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const generatedText = response.data.choices[0].message.content.trim();

    logger.info('AI text generation successful', {
      platform,
      generatedLength: generatedText.length
    });

    return generatedText;
  } catch (error) {
    logger.error('Text generation error', {
      error: error.message,
      platform,
      promptLength: prompt?.length
    });

    return getFallbackText(platform, prompt);
  }
};

const getFallbackText = (platform, prompt) => {
  const fallbackResponses = {
    facebook: "🌟 Exciting news! We're thrilled to share this amazing update with our community. What are your thoughts? Let us know in the comments! #Community #Updates #Exciting",
    instagram: "✨ New day, new possibilities! 📸 Sharing some inspiration to brighten your feed. What's inspiring you today? 💫 #Inspiration #Daily #Motivation #Instagram",
    linkedin: "Excited to share insights on industry trends and professional growth. Looking forward to connecting with fellow professionals and learning from this amazing community. #Professional #Networking #Growth",
    tiktok: "🔥 This trend is everything! Quick tip that will change your day 💯 Try this and let me know what you think! #Trending #Tips #Viral #ForYou",
    youtube: "Welcome back to our channel! Today we're diving deep into something amazing that you won't want to miss. Make sure to like and subscribe for more content like this!"
  };

  const fallback = fallbackResponses[platform] || `Here's some great content about: ${truncateText(prompt, 50)}. Let us know what you think in the comments! #Content #Social #Engagement`;

  logger.info('Using fallback text', { platform, fallbackLength: fallback.length });

  return fallback;
};

// Image generation using DALL-E or similar
const generateImage = async (prompt, style = 'realistic', size = '1024x1024') => {
  try {
    const cleanPrompt = truncateText(prompt, 400);

    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured, using placeholder image');
      const placeholderUrl = `https://picsum.photos/${size.replace('x', '/')}?random=${Date.now()}`;
      return placeholderUrl;
    }

    logger.info('Generating AI image', { style, size, promptLength: cleanPrompt.length });

    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      prompt: `${capitalizeFirst(style)} style: ${cleanPrompt}`,
      n: 1,
      size: size,
      quality: 'standard'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    const imageUrl = response.data.data[0].url;

    logger.info('AI image generation successful', { size, style });

    return imageUrl;
  } catch (error) {
    logger.error('Image generation error', {
      error: error.message,
      style,
      size,
      promptLength: prompt?.length
    });

    // Return placeholder image URL for demo
    return `https://picsum.photos/${size.replace('x', '/')}?random=${Date.now()}`;
  }
};

module.exports = {
  generateText,
  generateImage
};