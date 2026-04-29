export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "只支援 POST 請求" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
      return res.status(500).json({
        error: "尚未設定 GEMINI_API_KEY。請到 Vercel Environment Variables 新增金鑰後重新部署。",
      });
    }

    const formData = req.body?.formData || req.body || {};

    const c = [formData.c1, formData.c2, formData.c3].filter(Boolean).join("、");
    const b = [formData.b1, formData.b2, formData.b3].filter(Boolean).join("、");
    const d = [formData.d1, formData.d2, formData.d3].filter(Boolean).join("、");

    const systemPrompt =
      "你是一位溫暖、富有洞見且擅長敘事的愛情建築師。請協助使用者將關於愛情的零碎想法，整合成一篇完整、有條理且充滿力量的我的愛情藍圖宣言。不要提到 AI 或技術術語。";

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
請包含：
1. 愛情初衷
2. 幸福願景畫面
3. 地基、支柱、鋼筋的意義
4. 溫暖結語

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
        error: `Gemini 回傳格式不是 JSON：${rawText.slice(0, 300)}`,
      });
    }

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error:
          data?.error?.message ||
          "Gemini API 請求失敗，請檢查 GEMINI_API_KEY 或 GEMINI_MODEL。",
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      return res.status(500).json({
        error: "Gemini 回傳內容為空，請稍後再試。",
      });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "伺服器發生錯誤，請稍後再試。",
    });
  }
}