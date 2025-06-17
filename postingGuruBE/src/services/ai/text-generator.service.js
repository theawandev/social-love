// backend/src/services/ai/text-generator.service.js
const axios = require('axios');

const generateText = async (prompt, platform = null, postType = null) => {
  try {
    // Add platform-specific context to prompt
    let enhancedPrompt = prompt;

    if (platform) {
      const platformContext = {
        facebook: "Create engaging Facebook post content that encourages interaction",
        instagram: "Write Instagram-style content with emojis and hashtags",
        linkedin: "Generate professional LinkedIn content for business networking",
        tiktok: "Create catchy, trendy TikTok content that appeals to younger audience",
        youtube: "Write compelling YouTube content that drives engagement"
      };

      enhancedPrompt = `${ platformContext[platform] }. ${ prompt }`;
    }

    if (!process.env.OPENAI_API_KEY) {
      // Fallback response for demo purposes
      return getFallbackText(platform, prompt);
    }

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
        'Authorization': `Bearer ${ process.env.OPENAI_API_KEY }`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim();
  }
  catch (error) {
    console.error('Text generation error:', error);
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

  return fallbackResponses[platform] || `Here's some great content about: ${ prompt }. Let us know what you think in the comments! #Content #Social #Engagement`;
};

const generateHashtags = async (content, platform, count = 5) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return getDefaultHashtags(platform);
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate ${ count } relevant hashtags for ${ platform } based on the content. Return only hashtags separated by spaces.`
        },
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 100,
      temperature: 0.5
    }, {
      headers: {
        'Authorization': `Bearer ${ process.env.OPENAI_API_KEY }`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim().split(' ');
  }
  catch (error) {
    console.error('Hashtag generation error:', error);
    return getDefaultHashtags(platform);
  }
};

const getDefaultHashtags = (platform) => {
  const defaultHashtags = {
    facebook: ['#Facebook', '#Social', '#Community', '#Engagement', '#Content'],
    instagram: ['#Instagram', '#Photo', '#InstaGood', '#Daily', '#Life'],
    linkedin: ['#LinkedIn', '#Professional', '#Business', '#Career', '#Networking'],
    tiktok: ['#TikTok', '#Viral', '#Trending', '#ForYou', '#Fun'],
    youtube: ['#YouTube', '#Video', '#Subscribe', '#Content', '#Creator']
  };

  return defaultHashtags[platform] || ['#Social', '#Content', '#Engagement'];
};

module.exports = {
  generateText,
  generateHashtags
};