import { GoogleGenerativeAI } from "@google/generative-ai";
import { EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY } from "@env";
import { withTimeout, retryWithBackoff } from "../utils/apiOptimizer";

// Validate API key
if (!EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY) {
  console.warn('Warning: EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY is not set. AI features will not work.');
}

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY || '');

// Get the generative model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Optimized generation configuration for faster JSON responses
// Reduced tokens and adjusted parameters for better performance
const generationConfig = {
  temperature: 0.7,
  topP: 0.9, // Reduced from 0.95 for faster generation
  topK: 32, // Reduced from 40 for faster generation
  maxOutputTokens: 4096, // Reduced from 8192 for faster responses
  responseMimeType: "application/json",
};

/**
 * Generate a travel plan using AI with timeout and retry logic
 * @param {string} prompt - The formatted prompt for the AI
 * @param {Object} options - Options for generation
 * @param {number} options.timeout - Timeout in milliseconds (default: 25000)
 * @param {number} options.maxRetries - Maximum retries (default: 2)
 * @returns {Promise<Object>} - The parsed JSON response from the AI
 */
export const generateTravelPlan = async (prompt, options = {}) => {
  const { timeout = 25000, maxRetries = 2 } = options;

  const generatePlan = async () => {
    // Validate API key before proceeding
    if (!EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY) {
      throw new Error('Google Gemini API key is not configured. Please set EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY in your .env file.');
    }

    // Start a new chat session for each request
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the prompt and get the response with timeout
    const result = await withTimeout(
      chatSession.sendMessage(prompt),
      timeout
    );
    
    const responseText = result.response.text();

    // Parse the JSON response
    // Sometimes the AI wraps JSON in markdown code blocks, so we need to extract it
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    // Parse the JSON
    const tripPlan = JSON.parse(jsonText);
    
    return tripPlan;
  };

  try {
    // Retry with exponential backoff
    return await retryWithBackoff(generatePlan, maxRetries, 1000);
  } catch (error) {
    console.error('Error generating travel plan:', error);
    throw new Error(`Failed to generate travel plan: ${error.message}`);
  }
};
