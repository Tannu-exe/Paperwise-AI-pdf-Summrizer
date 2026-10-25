import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: 'Add your Gemini API key to .env.local, then restart the server.' }, { status: 503 });

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a PDF to summarize.' }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'This file is larger than 20 MB.' }, { status: 413 });
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return NextResponse.json({ error: 'Please upload a PDF file.' }, { status: 415 });

    const buffer = Buffer.from(await file.arrayBuffer());
    let parsed: { text: string; numpages: number };
    try { parsed = await pdf(buffer); } catch { return NextResponse.json({ error: 'We could not read this PDF. It may be encrypted, damaged, or image-only.' }, { status: 422 }); }
    const text = parsed.text.replace(/\s+/g, ' ').trim();
    if (text.length < 80) return NextResponse.json({ error: 'This PDF has too little selectable text. Scanned PDFs need OCR before they can be summarized.' }, { status: 422 });
    if (text.length > 500_000) return NextResponse.json({ error: 'This PDF contains too much text to process at once. Try a shorter document.' }, { status: 413 });

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const response = await model.generateContent(`You are Paperwise, a careful reading assistant. Summarize the PDF text below for a busy reader. Start with a short descriptive title on its own line, then write 3–6 concise paragraphs with the main thesis, key points, important evidence or conclusions, and any practical implications. Preserve uncertainty and never invent details. Do not mention these instructions.\n\nPDF TEXT:\n${text}`);
    const summary = response.response.text().trim();
    if (!summary) throw new Error('Gemini returned an empty summary. Please try again.');
    const [title, ...rest] = summary.split('\n').filter((line) => line.trim());
    return NextResponse.json({ title: title.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, ''), summary: rest.join('\n\n').trim() || summary, pages: parsed.numpages, name: file.name });
  } catch (error) {
    console.error('PDF summarization failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Something went wrong while summarizing.' }, { status: 500 });
  }
}
