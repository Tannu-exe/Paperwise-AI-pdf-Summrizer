# Paperwise — Your PDFs, understood

> Long documents, made easier to understand. Upload a PDF and get a clear, AI-generated summary of its main ideas, evidence, conclusions, and practical takeaways.

**Live app:** [paperwise-i0cy.onrender.com](https://paperwise-i0cy.onrender.com)  
**Repository:** [Tannu-exe/Paperwise-AI-pdf-Summrizer](https://github.com/Tannu-exe/Paperwise-AI-pdf-Summrizer)

![Paperwise PDF summarizer](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?logo=googlegemini)

## Overview

Paperwise is a web app for turning text-based PDF documents into concise, readable summaries. It provides a simple upload experience, extracts PDF text on the server, and asks Google Gemini to produce a title and a short summary.

## Features

- **PDF upload:** choose a file with the file picker or drag and drop it into the upload area.
- **Useful summaries:** returns a descriptive title and 3–6 concise paragraphs covering the thesis, key points, evidence, conclusions, and practical implications.
- **Copy summary:** copy the generated summary to the clipboard.
- **Clear upload states:** see the selected filename and size, remove it, or try another PDF.
- **Input checks:** accepts PDF files up to 20 MB and rejects unsupported files.
- **Server-side processing:** the Gemini API key stays on the server and is not sent to the browser.
- **Responsive interface:** works on desktop and mobile layouts.
- **Render Blueprint:** includes a free Node web-service configuration in `render.yaml`.

## How it works

1. Select a PDF (up to 20 MB) in the browser.
2. The browser sends the file as `multipart/form-data` to `POST /api/summarize`.
3. The Next.js API route checks the file and uses `pdf-parse` to extract its selectable text.
4. The server sends the extracted text and a summarization prompt to the Gemini `gemini-2.0-flash` model using `GEMINI_API_KEY`.
5. The API returns the summary, title, page count, and filename as JSON.
6. Paperwise displays the result and lets you copy the summary.

```text
Browser → Next.js /api/summarize → pdf-parse → Google Gemini → summary in browser
```

The app does not currently use OCR. Image-only or scanned PDFs without selectable text cannot be summarized. The API also limits extracted text to 500,000 characters.

## Tech stack

| Area | Technology | Use |
| --- | --- | --- |
| Web framework | Next.js 14 (App Router) | Page rendering and server API route |
| UI | React 18 | Interactive PDF upload and summary interface |
| Language | TypeScript | Typed application code |
| AI | Google Generative AI SDK | Calls Gemini to generate the summary |
| PDF text extraction | `pdf-parse` | Reads selectable text and page count from PDFs |
| Hosting | Render Node web service | Hosts the production app |

## Project structure

```text
.
├── app/
│   ├── api/
│   │   └── summarize/
│   │       └── route.ts   # Validates PDF, extracts text, calls Gemini
│   ├── globals.css        # App styles and responsive layout
│   ├── layout.tsx         # Root layout and page metadata
│   └── page.tsx           # Upload UI and summary display
├── types/
│   └── pdf-parse.d.ts     # TypeScript declaration for pdf-parse
├── render.yaml            # Render Blueprint configuration
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Run locally

### Requirements

- Node.js 18.17 or newer
- npm
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Setup

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/Tannu-exe/Paperwise-AI-pdf-Summrizer.git
   cd Paperwise-AI-pdf-Summrizer
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Create `.env.local` in the project root and add your key:

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

   Keep the real key private. Do not commit `.env.local` or paste the key into source code.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

For a production build locally:

```bash
npm run build
npm start
```

## Deploy on Render

This repository contains a Blueprint configuration in `render.yaml`.

1. Push the repository to GitHub.
2. In Render, choose **New → Blueprint** and connect the repository, or open the existing `paperwise` web service.
3. Add a secret environment variable named exactly `GEMINI_API_KEY`. Set its value to your Gemini API key in the Render dashboard. A local `.env.local` file is not available to the deployed service.
4. Save the environment variable and deploy/redeploy the latest commit.
5. When Render reports **Live**, open the service URL and try a text-based PDF.

The Blueprint uses `npm ci --include=dev && npm run build && npm prune --omit=dev` to install TypeScript build dependencies, build the app, and then remove development-only packages. It starts with `npm start`.

## API reference

### `POST /api/summarize`

Send a PDF using `multipart/form-data` with a field named `file`.

**Successful response (`200`):**

```json
{
  "title": "A descriptive title",
  "summary": "The generated summary...",
  "pages": 12,
  "name": "document.pdf"
}
```

The route can return helpful errors for missing API configuration, missing/invalid files, files over 20 MB, unreadable or image-only PDFs, and documents whose extracted text is over 500,000 characters. Gemini or server errors are returned as an error message with an appropriate HTTP status.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| “Add your Gemini API key…” | Add `GEMINI_API_KEY` to the hosting service's Environment settings, then redeploy. `.env.local` only applies to local development. |
| PDF will not select | Choose a `.pdf` file and make sure it is no larger than 20 MB. |
| “Could not read this PDF” | The file may be damaged, password-protected, or image-only/scanned. OCR is not implemented yet. |
| Too little selectable text | Try a text-based PDF. Scanned pages need OCR before they can be summarized. |
| Summary request fails | Check the Render deploy logs and confirm the Gemini key is valid and available to the service. Gemini usage limits can also affect requests. |
| Build fails on Render | Confirm the service uses the Blueprint build command from `render.yaml` and deploy the latest commit. |

## Security and privacy notes

- Keep `GEMINI_API_KEY` in environment variables; never expose it in client-side code or commit it to GitHub.
- The PDF is uploaded to the app server, its text is sent to Gemini for summarization, and the current app does not save uploads to a database.
- Do not upload documents containing sensitive information unless you are comfortable sending their extracted text to the configured AI provider.

## Current limitations

- PDF files only; maximum upload size is 20 MB.
- Scanned/image-only PDFs are not OCR processed.
- Extracted text is limited to 500,000 characters per request.
- One summary is generated per request; accounts, history, and persistent storage are not implemented.
- Render's free service may take time to wake after a period of inactivity.

## Contributing

Issues and pull requests are welcome. For a change, create a branch, make the update, and open a pull request with a clear description of what changed.

## License

No license file is included yet. Add a LICENSE file before specifying reuse terms.


