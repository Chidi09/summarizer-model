Summarizer Module
An extensible Node.js module for generating text summaries using various AI providers. Currently supports Google Gemini API.

Table of Contents
Installation

Setup

Usage

Adding New Providers

Running Tests

License

Installation
Create the module directory:
Navigate to your main project directory (e.g., your-project/) and create a new folder:

mkdir summarizer-module
cd summarizer-module

Create the src directory:

mkdir src

Create the files:
Copy the package.json, .env.example, .gitignore into the summarizer-module/ directory.
Copy provider-gemini.js and index.js into the summarizer-module/src/ directory.

Install dependencies:
From inside the summarizer-module/ directory, run:

npm install

Setup
Environment Variables:
Rename .env.example to .env:

mv .env.example .env

Get your Gemini API Key:
Go to Google AI Studio to generate your GEMINI_API_KEY.

Configure .env:
Open the newly created .env file and add your Gemini API Key:

GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

Important: Do not commit your .env file to version control! It's already in .gitignore.

Usage
To use this module in another Node.js application (like your discord-assignment-app), you'll need to install it as a local dependency.

Install as a local dependency:
From your discord-assignment-app/ directory, run:

npm install ../summarizer-module

This creates a symbolic link, so changes in summarizer-module will be reflected immediately in discord-assignment-app.

Import and use in your application:
In your Node.js backend file (e.g., discord-assignment-app/index.js):

const summarizeText = require('summarizer-module');

// ... inside an async function or route handler
try {
    const longDescription = "Your very long assignment description here...";
    const summary = await summarizeText(longDescription);
    console.log("Generated Summary:", summary);
} catch (error) {
    console.error("Error generating summary:", error);
}

Adding New Providers
This module is designed for easy expansion. To add a new summarization provider (e.g., a local extractive summarizer or another LLM API):

Create a new provider file:
In the src/ directory, create a new file like provider-new.js.

Implement the summarization logic:
Inside provider-new.js, export an async function that takes textToSummarize as an argument and returns a Promise<string> (the summary).

// src/provider-new.js
async function summarizeWithNewProvider(textToSummarize) {
    // Your logic to call the new API or perform local summarization
    return "This is a summary from the new provider.";
}
module.exports = summarizeWithNewProvider;

Update src/index.js:
Import your new provider and add a case for it in the switch statement of the summarize function.

// src/index.js
const summarizeWithGemini = require('./provider-gemini');
// const summarizeWithNewProvider = require('./provider-new'); // Uncomment/add this line

const defaultProvider = 'gemini'; // Or your new default

async function summarize(textToSummarize, provider = defaultProvider) {
    switch (provider) {
        case 'gemini':
            return await summarizeWithGemini(textToSummarize);
        case 'new-provider': // Add your new provider case
            // return await summarizeWithNewProvider(textToSummarize);
        default:
            throw new Error(`Unsupported summarization provider: ${provider}`);
    }
}
module.exports = summarize;

Running Tests
Currently, a basic test script is included in package.json. You can expand this using a testing framework like Jest.

To run the placeholder test:

npm test

License
This project is licensed under the MIT License.