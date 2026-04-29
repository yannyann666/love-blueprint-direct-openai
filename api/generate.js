export default async function handler(req, res) {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST method only." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
      return res.status(500).json({
        error:
          "Missing GEMINI_API_KEY. Add it in Vercel Environment Variables and redeploy.",
      });
    }

    const formData =
      req.body && req.body.formData ? req.body.formData : req.body || {};

    const foundation = [formData.c1, formData.c2, formData.c3]
      .filter(Boolean)
      .join("、");

    const pillars = [formData.b1, formData.b2, formData.b3]
      .filter(Boolean)
      .join("、");

    const reinforcement = [formData.d1, formData.d2, formData.d3]
      .filter(Boolean)
      .join("、");

    const systemPrompt =
      "You are a warm, insightful, narrative-oriented relationship architect. Help the user turn their thoughts about love into a complete and meaningful personal love blueprint declaration. Do not mention AI, model, API, or technical terms. Always write in Traditional Chinese.";

    const userPrompt = `
請根據以下資料，撰寫一篇完整的「愛情藍圖宣言」。

【靈魂金句】
${formData.goldenSentence || ""}

【選擇原因】
${formData.goldenReason || ""}

【幸福顯影】
${formData.vision || ""}

【愛情結構】
地基（自我覺察）：${foundation}
支柱（核心信念）：${pillars}
鋼筋（經營能力）：${reinforcement}

【寫作要求】
請用繁體中文撰寫。
請寫成一篇完整、流暢、溫柔堅定、充滿希望、具有啟發性的散文。
字數約 600 到 800 個中文字。
請不要列點，不要使用 Markdown 標題，不要分段標號。

文章必須包含以下內容：
1. 以靈魂金句作為開頭或核心意象，說明我對愛情的初衷。
2. 描寫幸福顯影中的未來畫面，加入視覺、聽覺、觸覺或生活感。
3. 詮釋地基：說明這些自我覺察如何成為健康關係的源頭。
4. 詮釋支柱：說明這些核心信念如何支撐我在愛裡不迷失。
5. 詮釋鋼筋：說明這些經營能力如何讓關係在困難中更有韌性。
6. 最後必須有一個完整、溫暖、有收束感的結語。

請務必寫完整，不要中途停止。
最後一句話必須是完整句子，不能停在半句。
`.trim();

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) +
      ":generateContent?key=" +
      encodeURIComponent(apiKey);

    const geminiResponse = await fetch(url, {
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
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096,
        },
      }),
    });

    const rawText = await geminiResponse.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Gemini returned non-JSON response: " + rawText.slice(0, 300),
      });
    }

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error:
          (data.error && data.error.message) ||
          "Gemini API request failed. Check GEMINI_API_KEY and GEMINI_MODEL.",
      });
    }

    const parts =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
        ? data.candidates[0].content.parts
        : [];

    const text = parts
      .map((part) => part.text || "")
      .join("")
      .trim();

    const finishReason =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].finishReason
        ? data.candidates[0].finishReason
        : "";

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned empty content. Please try again.",
      });
    }

    if (finishReason === "MAX_TOKENS") {
      return res.status(500).json({
        error:
          "Gemini stopped because the output reached the token limit. Please try again or increase maxOutputTokens.",
      });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({
      error: error && error.message ? error.message : "Server error.",
    });
  }
}