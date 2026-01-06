import { GoogleGenerativeAI } from "@google/generative-ai";
import { EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY } from "@env";

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

// Generation configuration for JSON responses
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

/**
 * Generate a travel plan using AI
 * @param {string} prompt - The formatted prompt for the AI
 * @returns {Promise<Object>} - The parsed JSON response from the AI
 */
export const generateTravelPlan = async (prompt) => {
  try {
    // Validate API key before proceeding
    if (!EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY) {
      throw new Error('Google Gemini API key is not configured. Please set EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY in your .env file.');
    }

    // Start a new chat session for each request
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the prompt and get the response
    const result = await chatSession.sendMessage(prompt);
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
  } catch (error) {
    console.error('Error generating travel plan:', error);
    throw new Error(`Failed to generate travel plan: ${error.message}`);
  }
};
