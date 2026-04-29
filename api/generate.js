export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支援 POST 請求" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return res.status(500).json({
      error: "尚未設定 GEMINI_API_KEY。請到 Vercel Environment Variables 新增金鑰後重新部署。",
    });
  }

  try {
    const body = req.body || {};
    const formData = body.formData || body;

    const c = [formData.c1, formData.c2, formData.c3].filter(Boolean).join("、");
    const b = [formData.b1, formData.b2, formData.b3].filter(Boolean).join("、");
    const d = [formData.d1, formData.d2, formData.d3].filter(Boolean).join("、");

    const systemPrompt =
      "你是一位溫暖、富有洞見且擅長敘事的「愛情建築師」。你的任務是協助使用者將關於愛情的零碎想法，整合成一篇完整、有條理且充滿力量的「我的愛情藍圖宣言」。請勿在回覆中提到你是 AI 或任何技術術語，請以人類建築師的身份說話。";

    const userPrompt = `
# 建築資料
1. 【靈魂金句】：${formData.goldenSentence || ""}
   選擇原因：${formData.goldenReason || ""}

2. 【幸福顯影】：
${formData.vision || ""}

3. 【愛情結構】
- 地基（自我覺察）：${c}
- 支柱（核心信念）：${b}
- 鋼筋（經營能力）：${d}

# 任務要求
請為我撰寫一篇約 500 字的「愛情藍圖宣言」。

文章結構請依序包含：
1. 引言：以靈魂金句開頭，並結合原因，闡述我對愛情的初衷。
2. 願景描繪：生動地描述幸福顯影中的畫面，請用視覺、聽覺、觸覺等感官描寫讓未來更加立體。
3. 建築結構解析：
   - 詮釋地基：說明為什麼這些狀態是建立健康關係的源頭。
   - 詮釋支柱：說明這些信念如何支撐我不迷失方向。
   - 詮釋鋼筋：說明這些能力如何讓關係在困難中依然強韌。
4. 結語：給予一句溫暖的鼓勵，總結這份藍圖對人生的意義。

# 語氣
溫柔堅定、充滿希望、具有啟發性。
請寫成流暢散文，不要列點，不要使用 Markdown 標題。
`.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
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
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message || "Gemini API 請求失敗，請檢查 GEMINI_API_KEY 或 GEMINI_MODEL。";
      return res.status(response.status).json({ error: message });
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
      error: error.message || "伺服器發生錯誤，請稍後再試。",
    });
  }
}