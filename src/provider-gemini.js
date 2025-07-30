// summarizer-module/src/provider-gemini.js

// Load environment variables for this module
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Summarizes text using the Google Gemini API.
 * @param {string} textToSummarize - The input text to be summarized.
 * @returns {Promise<string>} A promise that resolves with the summarized text.
 * @throws {Error} If the API key is missing, API call fails, or response is unexpected.
 */
async function summarizeWithGemini(textToSummarize) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in summarizer-module/.env");
    }

    const prompt = `Summarize the following academic or technical content clearly and concisely. Highlight core ideas, objectives, and outcomes if present. Keep the tone informative, not promotional.\n\n${textToSummarize}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.4, // More deterministic for academic use
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 300 // Slightly longer summaries if needed
        }
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Unexpected response structure from Gemini API.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for summarization:", error);
        throw new Error(`Failed to summarize text: ${error.message}`);
    }
}

module.exports = summarizeWithGemini;
