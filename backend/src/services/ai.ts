import fs from 'fs';

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface DetectedClip {
  title: string;
  start: number;
  end: number;
  viralityScore: number;
  retentionScore: number;
  confidenceScore: number;
  transcriptText: string;
}

export interface AIService {
  transcribeVideo(filePath: string): Promise<{ text: string; segments: TranscriptSegment[] }>;
  detectClips(transcriptText: string, segments: TranscriptSegment[]): Promise<DetectedClip[]>;
  generateMetadata(title: string, transcriptText: string): Promise<{ titles: string[]; description: string; hashtags: string[] }>;
}

class AIServiceImpl implements AIService {
  async transcribeVideo(filePath: string): Promise<{ text: string; segments: TranscriptSegment[] }> {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
    }

    console.log(`[AI] Transcribing audio track: ${filePath} via Gemini REST API...`);
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const base64Audio = fileBuffer.toString('base64');

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: "Generate a transcript of this audio file with sentence-level timestamps. Format the output as JSON matching the pattern: [{\"start\": number, \"end\": number, \"text\": string}]. Return ONLY valid JSON, do not include markdown blocks or any other explanation."
              },
              {
                inlineData: {
                  mimeType: "audio/mp3",
                  data: base64Audio
                }
              }
            ]
          }
        ]
      };

      const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
      }

      const result: any = await response.json();
      let responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`[AI] Transcription API raw response length: ${responseText.length}`);
      
      // Clean markdown block wrappers if present
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const segments: TranscriptSegment[] = JSON.parse(responseText);

      if (Array.isArray(segments)) {
        const fullText = segments.map(s => s.text).join(" ");
        return { text: fullText, segments };
      }
      throw new Error("Gemini API transcription response could not be parsed as an array of segments.");
    } catch (err) {
      console.error('[AI] Gemini Transcription API call failed:', err);
      throw err;
    }
  }

  async detectClips(transcriptText: string, segments: TranscriptSegment[]): Promise<DetectedClip[]> {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
    }

    console.log('[AI] Detecting clips with Gemini LLM...');
    try {
      const prompt = `You are an expert viral editor. Analyze the following transcript segments with timestamps:
${JSON.stringify(segments)}

Identify up to 3 highly engaging segments (each 10-30s long) that have the highest potential to go viral on TikTok, Reels, or Shorts. For each segment, formulate a catchy title, select precise start/end timestamps, assign viralityScore (0-100), retentionScore (0-100), confidenceScore (0-100), and state the exact transcriptText. 

Return your response as a valid JSON array of objects matching:
[
  {
    "title": string,
    "start": number,
    "end": number,
    "viralityScore": number,
    "retentionScore": number,
    "confidenceScore": number,
    "transcriptText": string
  }
]
Return ONLY valid JSON, do not wrap in markdown or include external annotations.`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
      }

      const result: any = await response.json();
      let responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const clips: DetectedClip[] = JSON.parse(responseText);

      if (Array.isArray(clips)) {
        return clips;
      }
      throw new Error("Gemini API clip detection response could not be parsed as an array of clips.");
    } catch (err) {
      console.error('[AI] Gemini Clip Detection API call failed:', err);
      throw err;
    }
  }

  async generateMetadata(title: string, transcriptText: string): Promise<{ titles: string[]; description: string; hashtags: string[] }> {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
    }

    try {
      const prompt = `You are a viral social media strategist. Analyze this clip transcript:
"${transcriptText}"
(Original Clip Concept: "${title}")

Generate high-converting metadata optimized for YouTube Shorts, TikTok, and Instagram Reels:
1. 5 highly engaging, hooky viral title variations (under 50 characters, using emojis/casing strategically).
2. 1 engaging, curiosity-inducing description (under 150 characters) that encourages viewers to watch till the end.
3. A list of 5-8 highly relevant hashtags (without the hash symbol, just the words).

Return your response as a valid JSON object matching:
{
  "titles": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
  "description": "Curiosity description...",
  "hashtags": ["tag1", "tag2", "tag3"]
}
Return ONLY valid JSON, do not wrap in markdown or include any other text.`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
      }

      const result: any = await response.json();
      let responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const metadata = JSON.parse(responseText);

      if (metadata && Array.isArray(metadata.titles) && typeof metadata.description === 'string' && Array.isArray(metadata.hashtags)) {
        return metadata;
      }
      throw new Error("Response structure did not match metadata specifications.");
    } catch (err) {
      console.error('[AI] Gemini generateMetadata failed:', err);
      throw err;
    }
  }
}

export const aiService = new AIServiceImpl();
