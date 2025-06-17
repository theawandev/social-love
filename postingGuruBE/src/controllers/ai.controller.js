// backend/src/controllers/ai.controller.js
const { User } = require('../models');
const ApiResponse = require('../utils/response');
const { generateText, generateImage } = require('../services/ai/ai-provider.service');

// Generate text content
const generateTextContent = async (req, res) => {
  try {
    const { prompt, platform, postType } = req.body;
    const userId = req.user.id;

    // Generate content
    const generatedText = await generateText(prompt, platform, postType);

    // Update user's AI generation count
    await User.increment('ai_generations_used', { where: { id: userId } });

    res.json(ApiResponse.success({
      content: generatedText,
      prompt: prompt,
      platform: platform,
      postType: postType
    }, 'Text generated successfully'));
  }
  catch (error) {
    console.error('Generate text error:', error);
    res.status(500).json(ApiResponse.error('Failed to generate text'));
  }
};

// Generate image content
const generateImageContent = async (req, res) => {
  try {
    const { prompt, style = 'realistic', size = '1024x1024' } = req.body;
    const userId = req.user.id;

    // Generate image
    const imageUrl = await generateImage(prompt, style, size);

    // Update user's AI generation count
    await User.increment('ai_generations_used', { where: { id: userId } });

    res.json(ApiResponse.success({
      imageUrl: imageUrl,
      prompt: prompt,
      style: style,
      size: size
    }, 'Image generated successfully'));
  }
  catch (error) {
    console.error('Generate image error:', error);
    res.status(500).json(ApiResponse.error('Failed to generate image'));
  }
};

// Get AI usage stats
const getUsageStats = async (req, res) => {
  try {
    const user = req.user;

    res.json(ApiResponse.success({
      used: user.ai_generations_used,
      limit: user.ai_generations_limit,
      remaining: user.ai_generations_limit - user.ai_generations_used,
      resetDate: user.ai_reset_date
    }));
  }
  catch (error) {
    console.error('Get AI usage stats error:', error);
    res.status(500).json(ApiResponse.error('Failed to get usage stats'));
  }
};

module.exports = {
  generateTextContent,
  generateImageContent,
  getUsageStats
};


