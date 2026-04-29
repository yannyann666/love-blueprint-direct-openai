# 愛情藍圖設計計畫｜直接串接 OpenAI 上線版

## 本機測試

```bash
npm install
npm run dev
```

## Vercel 上線

1. 上傳整個專案到 GitHub
2. Vercel → Add New Project → 選擇 GitHub repo
3. Settings → Environment Variables 新增：
   - `OPENAI_API_KEY`：你的 OpenAI API Key
   - `OPENAI_MODEL`：可不填，預設 `gpt-5.5`
4. Deployments → Redeploy

## 重要

API Key 不要寫在 `src/App.jsx`。這個版本已經改成由 `/api/generate.js` 後端代理呼叫 OpenAI。
