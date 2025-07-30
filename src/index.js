// summarizer-module/src/index.js

require('dotenv').config(); // Load environment variables for API keys

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises; // Use promise-based fs for async operations
const path = require('path');
const pdf = require('pdf-parse');
const textract = require('textract'); // NEW: Import textract

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Summarizes text using the specified AI provider.
 *
 * @param {string | Buffer} content - The text content to summarize, or a Buffer for file content.
 * @param {'gemini' | 'openai' | 'claude'} provider - The AI provider to use.
 * @param {string} [fileType] - Required if content is a Buffer (e.g., 'pdf', 'docx', 'txt').
 * @returns {Promise<string>} The summarized text.
 * @throws {Error} If the provider is invalid, API key is missing, or summarization fails.
 */
async function summarizeText(content, provider, fileType = 'txt') {
    if (!content) {
        throw new Error('Content to summarize cannot be empty.');
    }

    if (provider === 'gemini') {
        if (!genAI) {
            throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let textToSummarize = '';

        if (Buffer.isBuffer(content)) {
            // If content is a buffer, process it based on fileType
            if (fileType === 'pdf') {
                const data = await pdf(content);
                textToSummarize = data.text;
            } else if (fileType === 'docx' || fileType === 'doc') {
                // Use textract for .docx and .doc files with options for better extraction
                try {
                    textToSummarize = await new Promise((resolve, reject) => {
                        textract.fromBufferWithMime(
                            fileType === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/msword',
                            content,
                            { preserveLineBreaks: true }, // Option to preserve line breaks
                            (error, text) => {
                                if (error) {
                                    return reject(new Error(`Text extraction failed for ${fileType}: ${error.message}`));
                                }
                                resolve(text);
                            }
                        );
                    });
                } catch (extractionError) {
                    console.error(`Error during textract extraction for ${fileType}:`, extractionError);
                    throw new Error(`Document text extraction failed: ${extractionError.message}`);
                }
            } else if (fileType === 'txt') {
                textToSummarize = content.toString('utf8');
            } else {
                throw new Error(`Unsupported file type for summarization: ${fileType}.`);
            }
        } else if (typeof content === 'string') {
            textToSummarize = content;
        } else {
            throw new Error('Invalid content type. Must be string or Buffer.');
        }

        // --- DEBUG LOG: Log the extracted text before sending to Gemini ---
        console.log('DEBUG: Extracted text for summarization (first 500 chars):', textToSummarize.substring(0, 500));
        if (textToSummarize.length > 500) {
            console.log('DEBUG: ... (truncated)');
        }
        // --- END DEBUG LOG ---


        if (!textToSummarize.trim()) {
            throw new Error('No extractable text found in the document or description is empty. Please ensure the document contains readable text.');
        }

        // Limit text length to avoid exceeding Gemini's context window
        const MAX_TEXT_LENGTH = 10000; // Adjust based on Gemini's actual limits and desired performance
        if (textToSummarize.length > MAX_TEXT_LENGTH) {
            console.warn(`Text truncated for summarization. Original length: ${textToSummarize.length}`);
            textToSummarize = textToSummarize.substring(0, MAX_TEXT_LENGTH);
        }

        const prompt = `Please provide a concise summary of the following text:\n\n${textToSummarize}`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const summary = response.text();
            return summary;
        } catch (apiError) {
            console.error('Error calling Gemini API:', apiError.message);
            throw new Error(`Gemini API summarization failed: ${apiError.message}`);
        }

    } else if (provider === 'openai') {
        throw new Error('OpenAI integration not yet implemented.');
    } else if (provider === 'claude') {
        throw new Error('Claude integration not yet implemented.');
    } else {
        throw new Error(`Invalid AI provider: ${provider}. Supported providers are 'gemini', 'openai', 'claude'.`);
    }
}

module.exports = summarizeText;
