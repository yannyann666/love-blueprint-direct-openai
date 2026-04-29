export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只接受 POST 請求。' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: '尚未設定 OPENAI_API_KEY。請到 Vercel Environment Variables 新增金鑰後重新部署。' });
    }

    const { formData } = req.body || {};
    if (!formData) {
      return res.status(400).json({ error: '缺少表單資料。' });
    }

    const requiredFields = [
      'goldenSentence', 'goldenReason', 'vision',
      'c1', 'c2', 'c3', 'b1', 'b2', 'b3', 'd1', 'd2', 'd3'
    ];

    const missing = requiredFields.filter((key) => !String(formData[key] || '').trim());
    if (missing.length > 0) {
      return res.status(400).json({ error: '請完整填寫所有欄位。' });
    }

    const c = [formData.c1, formData.c2, formData.c3].filter(Boolean).join('、');
    const b = [formData.b1, formData.b2, formData.b3].filter(Boolean).join('、');
    const d = [formData.d1, formData.d2, formData.d3].filter(Boolean).join('、');

    const systemPrompt = '你是一位溫暖、富有洞見且擅長敘事的「愛情建築師」。你的任務是協助使用者將關於愛情的零碎想法，整合成一篇完整、有條理且充滿力量的「我的愛情藍圖宣言」。請勿在回覆中提到你是 AI 或任何技術術語，請以人類建築師的身份說話。';

    const userQuery = `
# 建築資料
1. 【靈魂金句】：${formData.goldenSentence}
   選擇原因：${formData.goldenReason}

2. 【幸福顯影】十五年後的畫面：
${formData.vision}

3. 【愛情結構】
- 地基：${c}
- 支柱：${b}
- 鋼筋：${d}

# 任務要求
請為我撰寫一篇約 500 字的「愛情藍圖宣言」。

文章結構請自然包含：
1. 引言：以靈魂金句開頭，闡述初衷。
2. 願景描繪：生動感官描述幸福畫面，包含視覺、聽覺、觸覺。
3. 結構解析：詮釋地基、支柱、鋼筋對關係的意義。
4. 結語：給予溫暖鼓勵。

# 語氣
溫柔堅定、充滿希望、具有啟發性。寫成散文，不要列點，不要使用條列標號。
`.trim();

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.5',
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery }
        ],
        temperature: 0.8,
        store: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || 'OpenAI API 請求失敗。';
      return res.status(response.status).json({ error: message });
    }

    const text =
      data.output_text ||
      data.output?.flatMap((item) => item.content || [])
        ?.filter((content) => content.type === 'output_text')
        ?.map((content) => content.text)
        ?.join('\n')
        ?.trim();

    if (!text) {
      return res.status(500).json({ error: 'AI 回應內容為空，請再試一次。' });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: error.message || '伺服器發生錯誤。' });
  }
}
