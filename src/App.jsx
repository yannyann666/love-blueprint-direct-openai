import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  Copy,
  Download,
  Heart,
  PenTool,
  Sparkles,
  Construction,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const emptyForm = {
  goldenSentence: "",
  goldenReason: "",
  vision: "",
  c1: "",
  c2: "",
  c3: "",
  b1: "",
  b2: "",
  b3: "",
  d1: "",
  d2: "",
  d3: "",
};

const joinValues = (values) => values.filter(Boolean).join("、");

export default function App() {
  const [formData, setFormData] = useState(emptyForm);
  const [showResult, setShowResult] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const answerCardRef = useRef(null);

  const foundation = useMemo(() => joinValues([formData.c1, formData.c2, formData.c3]), [formData.c1, formData.c2, formData.c3]);
  const pillars = useMemo(() => joinValues([formData.b1, formData.b2, formData.b3]), [formData.b1, formData.b2, formData.b3]);
  const reinforcement = useMemo(() => joinValues([formData.d1, formData.d2, formData.d3]), [formData.d1, formData.d2, formData.d3]);

  const aiPrompt = useMemo(() => {
    return `# Role｜角色設定
你是一位溫暖、富有洞見且擅長敘事的「愛情建築師」。你的任務是協助我將關於愛情的零碎想法、關鍵字與未來畫面，整合成一篇完整、有條理且充滿力量的「我的愛情藍圖宣言」。請勿提到你是 AI，也不要使用技術語言。

# Context｜背景資訊
我正在進行一份「愛情藍圖」設計。我將愛情比喻為一棟建築，需要穩固的地基（自我覺察）、支撐的柱子（核心信念），以及強韌的鋼筋（經營能力）。請協助我把這些內容整理成一篇能代表我愛情觀、關係期待與未來幸福想像的宣言。

# My Data｜我的藍圖資料
請根據以下我填寫的內容進行創作：

1. 【靈魂金句】
我最受觸動的一句話是：
「${formData.goldenSentence || "未填寫"}」

選擇原因：
${formData.goldenReason || "未填寫"}

2. 【幸福顯影】
我腦海中 10–15 年後的幸福畫面是：
${formData.vision || "未填寫"}

3. 【我的愛情結構】
- 地基（自我覺察／關係狀態）：${foundation || "未填寫"}
- 支柱（核心信念／價值信念）：${pillars || "未填寫"}
- 鋼筋（經營能力／修練能力）：${reinforcement || "未填寫"}

# Task｜你的任務
請為我撰寫一篇約 600 到 800 個中文字的「愛情藍圖宣言」。

文章請自然包含以下內容：

1. 以我的【靈魂金句】作為開頭或核心意象，並結合我選擇它的原因，說明我對愛情的初衷。
2. 生動描寫【幸福顯影】中的未來畫面，加入視覺、聽覺、觸覺或生活細節，讓這個未來更有畫面感，並呈現它是我願意努力靠近的方向。
3. 詮釋【地基】：說明這些自我覺察／關係狀態如何成為健康關係的源頭。
4. 詮釋【支柱】：說明這些核心信念／價值信念如何支撐我在愛裡不迷失方向。
5. 詮釋【鋼筋】：說明這些經營能力／修練能力如何讓關係在困難中依然強韌。
6. 最後給我一個完整、溫暖、有收束感的結語，總結這份藍圖對我人生與關係的意義。

# Tone｜語氣要求
請使用繁體中文。
語氣要溫柔堅定、充滿希望、具有啟發性。
請寫成流暢散文，不要列點，不要使用 Markdown 標題。
請不要像制式報告，而是把我的關鍵字、畫面與感受，串連成一篇有畫面感、有情感深度、能代表我的個人宣言。`;
  }, [formData, foundation, pillars, reinforcement]);

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowResult(true);
    setCopySuccess(false);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = aiPrompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  };

  const downloadAnswersImage = async () => {
    if (!answerCardRef.current) {
      alert("找不到填寫答案卡片，請稍後再試一次。");
      return;
    }

    setDownloadBusy(true);

    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;

      const source = answerCardRef.current;
      const clone = source.cloneNode(true);
      clone.style.width = "1080px";
      clone.style.maxWidth = "1080px";
      clone.style.minWidth = "1080px";
      clone.style.height = "auto";
      clone.style.minHeight = "auto";
      clone.style.maxHeight = "none";
      clone.style.overflow = "visible";
      clone.style.transform = "none";
      clone.style.backgroundColor = "#fdfbf7";
      clone.style.boxSizing = "border-box";

      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-12000px";
      wrapper.style.top = "0";
      wrapper.style.width = "1080px";
      wrapper.style.height = "auto";
      wrapper.style.overflow = "visible";
      wrapper.style.background = "#fdfbf7";
      wrapper.style.zIndex = "-1";
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await new Promise((resolve) => setTimeout(resolve, 350));

      const exportWidth = 1080;
      const exportHeight = Math.max(clone.scrollHeight, clone.offsetHeight, 1200);

      const canvas = await html2canvas(clone, {
        backgroundColor: "#fdfbf7",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: exportWidth,
        height: exportHeight,
        windowWidth: exportWidth,
        windowHeight: exportHeight,
      });

      document.body.removeChild(wrapper);

      const dateText = new Date().toLocaleDateString("zh-TW").replace(/\//g, "-");
      const fileName = "愛情藍圖填寫答案-" + dateText + ".png";
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

      if (!blob) {
        alert("圖片產生失敗，請再試一次。");
        return;
      }

      const url = URL.createObjectURL(blob);

      if (isMobileDevice()) {
        const imageWindow = window.open("", "_blank");
        if (imageWindow) {
          imageWindow.document.write(
            '<html><head><title>愛情藍圖填寫答案</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;background:#fdfbf7;text-align:center;"><p style="font-family:sans-serif;color:#555;padding:16px;line-height:1.7;">長按圖片，選擇「儲存到照片」或「加入照片」。</p><img src="' +
              url +
              '" style="width:100%;height:auto;display:block;" /></body></html>'
          );
          imageWindow.document.close();
        } else {
          window.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 120000);
        return;
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    } catch (error) {
      console.error("圖片下載失敗：", error);
      alert("圖片下載失敗，請稍後再試，或先使用截圖保存。");
    } finally {
      setDownloadBusy(false);
    }
  };

  const fieldClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100";

  return (
    <div className="min-h-screen bg-[#fdfbf7] px-4 py-8 text-stone-800 md:px-10 md:py-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap');
        body { font-family: 'Noto Sans TC', sans-serif; }
        .serif { font-family: 'Noto Serif TC', serif; }
        .section-card { background: white; border: 1px solid #e7e5e4; border-radius: 18px; padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden; box-shadow: 0 16px 40px rgba(120, 113, 108, 0.08); }
        .section-card::before { content: ""; position: absolute; left: 0; top: 0; width: 5px; height: 100%; }
        .card-gold::before { background: #f59e0b; }
        .card-vision::before { background: #ec4899; }
        .card-structure::before { background: #64748b; }
      `}</style>

      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full bg-rose-50 p-4"><Heart className="h-10 w-10 text-rose-500" /></div>
          <h1 className="serif mb-2 text-4xl font-bold text-stone-800 md:text-5xl">愛情藍圖設計計畫</h1>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Design My Love, Build My Life</p>
        </header>

        <form onSubmit={handleSubmit}>
          <section className="section-card card-gold">
            <h2 className="serif mb-5 flex items-center gap-2 text-xl font-bold"><PenTool className="h-5 w-5 text-amber-500" />1.【初衷：靈魂對話】</h2>
            <div className="mb-5"><label className="mb-2 block font-medium text-stone-700">靈魂金句</label><input id="goldenSentence" value={formData.goldenSentence} onChange={handleInputChange} className={fieldClass} placeholder="輸入最觸動你的一句話" required /></div>
            <div><label className="mb-2 block font-medium text-stone-700">選擇原因</label><textarea id="goldenReason" rows="3" value={formData.goldenReason} onChange={handleInputChange} className={fieldClass} placeholder="這句話為什麼觸動你？它反映了你怎樣的愛情觀？" required /></div>
          </section>

          <section className="section-card card-vision">
            <h2 className="serif mb-5 flex items-center gap-2 text-xl font-bold"><Sparkles className="h-5 w-5 text-pink-500" />2.【幸福顯影：未來縮影】</h2>
            <label className="mb-2 block font-medium text-stone-700">描述你理想中 10–15 年後的幸福畫面</label>
            <textarea id="vision" rows="5" value={formData.vision} onChange={handleInputChange} className={fieldClass} placeholder="畫面中有誰？在哪裡？正在做什麼？空氣、聲音、光線、心情是什麼樣子？" required />
          </section>

          <section className="section-card card-structure">
            <h2 className="serif mb-6 flex items-center gap-2 text-xl font-bold"><Construction className="h-5 w-5 text-slate-500" />3.【結構設計：穩定工程】</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { title: "地基", subtitle: "自我覺察／關係狀態", color: "purple", ids: ["c1", "c2", "c3"], placeholder: "狀態" },
                { title: "支柱", subtitle: "核心信念／價值信念", color: "blue", ids: ["b1", "b2", "b3"], placeholder: "價值" },
                { title: "鋼筋", subtitle: "經營能力／修練能力", color: "orange", ids: ["d1", "d2", "d3"], placeholder: "能力" },
              ].map((group) => (
                <div key={group.title} className="rounded-2xl border border-stone-100 bg-stone-50 p-5">
                  <h3 className="mb-1 text-lg font-bold text-stone-800">{group.title}</h3>
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-400">{group.subtitle}</p>
                  <div className="space-y-3">
                    {group.ids.map((id, index) => (
                      <input key={id} id={id} value={formData[id]} onChange={handleInputChange} className={fieldClass} placeholder={`${group.placeholder} ${index + 1}`} required />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-2xl bg-stone-800 px-6 py-5 text-xl font-bold text-white shadow-xl transition hover:bg-stone-900 active:scale-[0.99]"><CheckCircle2 className="h-6 w-6" />完成並產生 AI 指令</button>
        </form>

        <footer className="mt-16 border-t border-stone-200 pt-8 text-center text-[10px] uppercase tracking-[0.26em] text-stone-400">© 2026 FUYOU EDTECH · 愛的決定學 · 專屬你的幸福結構</footer>
      </div>

      {showResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-md">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#fdfbf7] shadow-2xl">
            <div className="sticky top-0 z-20 flex items-center justify-between rounded-t-3xl border-b border-stone-200 bg-[#fdfbf7]/95 px-5 py-4 backdrop-blur">
              <div><h2 className="serif text-2xl font-bold text-stone-800">你的愛情藍圖已完成</h2><p className="text-sm text-stone-500">複製 AI 指令，貼到自己常用的 AI；也可以下載剛剛填寫的答案圖片。</p></div>
              <button onClick={() => setShowResult(false)} className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"><X className="h-7 w-7" /></button>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-[1fr_1fr] md:p-8">
              <div ref={answerCardRef} className="relative overflow-hidden rounded-3xl border border-stone-200 bg-[#fdfbf7] p-8 shadow-sm">
                <div className="pointer-events-none absolute inset-4 border border-stone-200" /><div className="pointer-events-none absolute inset-6 border-[3px] border-stone-100" />
                <div className="relative z-10">
                  <div className="mb-8 text-center"><div className="mb-3 inline-flex rounded-full bg-rose-50 p-3"><Heart className="h-7 w-7 text-rose-500" /></div><h3 className="serif text-3xl font-bold tracking-widest text-stone-800">愛情藍圖填寫答案</h3><p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-stone-400">Personal Love Blueprint</p></div>
                  <div className="space-y-6 text-stone-700">
                    <div className="rounded-2xl bg-white/80 p-5 shadow-sm"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-600">Soul Sentence</p><p className="serif text-xl font-bold leading-relaxed text-stone-800">「{formData.goldenSentence}」</p><p className="mt-3 text-sm leading-7 text-stone-600">{formData.goldenReason}</p></div>
                    <div className="rounded-2xl bg-white/80 p-5 shadow-sm"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-pink-600">Future Vision</p><p className="leading-8 text-stone-700">{formData.vision}</p></div>
                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-5"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-purple-700">地基｜自我覺察</p><p className="serif text-lg font-bold text-purple-900">{foundation}</p></div>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">支柱｜核心信念</p><p className="serif text-lg font-bold text-blue-900">{pillars}</p></div>
                      <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-700">鋼筋｜經營能力</p><p className="serif text-lg font-bold text-orange-900">{reinforcement}</p></div>
                    </div>
                    <div className="flex items-end justify-between border-t border-stone-200 pt-6 text-xs text-stone-400"><div><p className="uppercase tracking-widest">Issue Date</p><p className="font-mono">{new Date().toLocaleDateString("zh-TW")}</p></div><div className="text-right"><p className="uppercase tracking-widest">Designed by</p><p className="serif font-bold text-stone-600">愛情藍圖設計計畫</p></div></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="serif mb-3 text-xl font-bold text-stone-800">可複製給 AI 的完整指令</h3>
                <textarea readOnly value={aiPrompt} className="min-h-[520px] flex-1 resize-none rounded-2xl border border-stone-200 bg-white p-5 font-mono text-sm leading-7 text-stone-700 outline-none" />
                <div className="mt-5 grid gap-3">
                  <button onClick={copyPrompt} className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-bold text-white transition ${copySuccess ? "bg-green-600" : "bg-stone-800 hover:bg-stone-900"}`}>{copySuccess ? <><CheckCircle2 className="h-5 w-5" />已複製 AI 指令</> : <><Copy className="h-5 w-5" />複製 AI 指令</>}</button>
                  <button onClick={downloadAnswersImage} disabled={downloadBusy} className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"><Download className="h-5 w-5" />{downloadBusy ? "圖片產生中..." : "下載我的填寫答案圖片"}</button>
                  <div className="grid gap-3 md:grid-cols-2"><a href="https://chatgpt.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-bold text-green-700 transition hover:bg-green-100">前往 ChatGPT<ExternalLink className="h-4 w-4" /></a><a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 font-bold text-blue-700 transition hover:bg-blue-100">前往 Gemini<ExternalLink className="h-4 w-4" /></a></div>
                  <p className="text-center text-xs leading-6 text-stone-500">電腦會直接下載成 PNG 檔；手機會另開圖片頁面，請長按圖片自行儲存。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
