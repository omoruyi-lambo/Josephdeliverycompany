const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GoogleGenAI {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
    this.models = {
      generateContent: (options) => this.generateContent(options),
    };
  }

  async generateContent({ model, contents, config }) {
    const response = await fetch(
      `${API_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: config.systemInstruction }] },
          contents,
          generationConfig: {
            maxOutputTokens: config.maxOutputTokens,
            temperature: config.temperature,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API returned ${response.status}: ${errorBody.slice(0, 200)}`);
    }

    const data = await response.json();
    return {
      text: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
    };
  }
}
