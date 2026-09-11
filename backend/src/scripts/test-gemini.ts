import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testGemini() {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    console.error('\n❌ ERROR: GEMINI_API_KEY environment variable is not defined in backend/.env');
    console.log('Please add your key to backend/.env:');
    console.log('GEMINI_API_KEY=your_actual_api_key_here\n');
    process.exit(1);
  }

  const maskedKey = geminiKey.length > 8 
    ? `${geminiKey.substring(0, 5)}...${geminiKey.substring(geminiKey.length - 4)}`
    : '***';

  console.log(`\n🔍 Found GEMINI_API_KEY: ${maskedKey}`);
  console.log('🚀 Connecting to Gemini API (gemini-2.0-flash)...');

  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: "Hello! If you are receiving this message, please respond with a short sentence confirming that the ClipFlow AI integration is working."
            }
          ]
        }
      ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
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
    const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('\n==================================================');
    console.log('✅ SUCCESS: Gemini API Integration is working!');
    console.log(`Response: "${responseText.trim()}"`);
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('\n❌ ERROR: Gemini API call failed.');
    console.error(err.message || err);
    console.log('Please verify that your API key is valid and has access to gemini-1.5-flash.\n');
  }
}

testGemini();
