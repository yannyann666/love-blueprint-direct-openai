export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST method only." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY. Please add it in Vercel Environment Variables and redeploy.",
      });
    }

    const formData = req.body?.formData || req.body || {};

    const c = [formData.c1, formData.c2, formData.c3].filter(Boolean).join("、");
    const b = [formData.b1, formData.b2, formData.b3].filter(Boolean).join("、");
    const d = [formData.d1, formData.d2, formData.d3].filter(Boolean).join("、");

    const systemPrompt =
      "You are a warm, insightful, narrative-oriented relationship architect. Your task is to help the user integrate scattered thoughts about love into a coherent and meaningful personal love blueprint declaration. Do not mention AI or technical terms.";

    const userPrompt = `
請根據以下資料，撰寫一篇約 500 字的「愛情藍圖宣言」。

【靈魂金句】
${formData.goldenSentence || ""}

【選擇原因】
${formData.goldenReason || ""}

【幸福顯影】
${formData.vision || ""}

【愛情結構】
地基（自我覺察）：${c}
支柱（核心信念）：${b}
鋼筋（經營能力）：${d}

請寫成溫柔堅定、充滿希望、具有啟發性的散文。
請包含：愛情初衷、幸福願景畫面、地基支柱鋼筋的意義，以及溫暖結語。
不要列點，不要使用 Markdown 標題。
`.trim();

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1600,
        },
      }),
    });

    const rawText = await geminiResponse.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        error: `Gemini returned non-JSON response: ${rawText.slice(0, 300)}`,
      });
    }

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed. Please check GEMINI_API_KEY or GEMINI_MODEL.",
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned empty content. Please try again.",
      });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Server error. Please try again.",
    });
  }
}