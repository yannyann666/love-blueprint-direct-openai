export default async function handler(req, res) {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST method only." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY. Add it in Vercel Environment Variables and redeploy."
      });
    }

    const formData = req.body && req.body.formData ? req.body.formData : req.body || {};

    const foundation = [formData.c1, formData.c2, formData.c3].filter(Boolean).join(", ");
    const pillars = [formData.b1, formData.b2, formData.b3].filter(Boolean).join(", ");
    const reinforcement = [formData.d1, formData.d2, formData.d3].filter(Boolean).join(", ");

    const systemPrompt =
      "You are a warm and insightful relationship architect. Help the user turn their thoughts about love into a coherent, meaningful personal love blueprint declaration. Do not mention AI or technical terms.";

    const userPrompt = `
Please write the final response in Traditional Chinese.

Create a 500-character personal love blueprint declaration based on the following information.

Soul sentence:
${formData.goldenSentence || ""}

Reason for choosing it:
${formData.goldenReason || ""}

Future happiness vision:
${formData.vision || ""}

Love structure:
Foundation / self-awareness: ${foundation}
Pillars / core beliefs: ${pillars}
Reinforcement / relationship skills: ${reinforcement}

Writing requirements:
Write in warm, firm, hopeful, and inspiring prose.
Include the original intention of love, the future happiness vision, the meaning of foundation, pillars, and reinforcement, and a warm closing.
Do not use bullet points.
Do not use Markdown headings.
`.trim();

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) +
      ":generateContent?key=" +
      encodeURIComponent(apiKey);

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1600
        }
      })
    });

    const rawText = await geminiResponse.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Gemini returned non-JSON response: " + rawText.slice(0, 300)
      });
    }

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error:
          (data.error && data.error.message) ||
          "Gemini API request failed. Check GEMINI_API_KEY and GEMINI_MODEL."
      });
    }

    const text =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
        ? data.candidates[0].content.parts.map((part) => part.text || "").join("").trim()
        : "";

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned empty content. Please try again."
      });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({
      error: error && error.message ? error.message : "Server error."
    });
  }
}