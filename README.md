# Paperwise

A small AI PDF summarizer built with Next.js and Gemini. Upload a PDF up to 20 MB and get a concise summary with its main ideas and conclusions.

## Run locally

1. Install Node.js 18.17 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` using a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

The API route parses selectable PDF text on the server and sends it to Gemini. The API key is never exposed to the browser. The initial version does not OCR scanned/image-only documents, and it caps extracted text at 500,000 characters.

## Deploy to Render

This project includes a `render.yaml` Blueprint for a Node web service. Push the project to a GitHub repository, then in Render choose **New → Blueprint** and connect that repository. Render will prompt for `GEMINI_API_KEY`; enter it as a secret in the dashboard. Do not commit `.env.local` or put the key in `render.yaml`.
