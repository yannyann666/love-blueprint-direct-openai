import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  Copy,
  Download,
  Heart,
  PenTool,
  Sparkles,
  Construction,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

const emptyForm = {
  goldenSentence: '',
  goldenReason: '',
  vision: '',
  c1: '',
  c2: '',
  c3: '',
  b1: '',
  b2: '',
  b3: '',
  d1: '',
  d2: '',
  d3: '',
};

export default function App() {
  const [formData, setFormData] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [imageStatus, setImageStatus] = useState('');
  const answerCardRef = useRef(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const joinValues = (...values) => values.filter(Boolean).join('、');

  const createPrompt = () => {
    const foundation = joinValues(formData.c1, formData.c2, formData.c3);
    const pillars = joinValues(formData.b1, formData.b2, formData.b3);
    const reinforcement = joinValues(formData.d1, formData.d2, formData.d3);

    return `# Role
你是一位溫暖、富有洞見且擅長敘事的「愛情建築師」。你的任務是協助我將關於愛情的零碎想法，整合成一篇完整、有條理且充滿力量的「我的愛情藍圖宣言」。請勿提到你是 AI，也不要使用技術語言。

# My Data
請根據以下我填寫的內容進行創作：

1. 【靈魂金句】
${formData.goldenSentence}

選擇原因：
${formData.goldenReason}

2. 【幸福顯影】
${formData.vision}

3. 【我的愛情結構】
- 地基（自我覺察）：${foundation}
- 支柱（核心信念）：${pillars}
- 鋼筋（經營能力）：${reinforcement}

# Task
請為我撰寫一篇約 600 到 800 個中文字的「愛情藍圖宣言」。

文章請包含：
1. 以我的靈魂金句作為開頭或核心意象，說明我對愛情的初衷。
2. 生動描寫幸福顯影中的未來畫面，加入視覺、聽覺、觸覺或生活感。
3. 詮釋地基：說明這些自我覺察如何成為健康關係的源頭。
4. 詮釋支柱：說明這些核心信念如何支撐我在愛裡不迷失。
5. 詮釋鋼筋：說明這些經營能力如何讓關係在困難中更有韌性。
6. 最後給我一個完整、溫暖、有收束感的結語。

# Tone
溫柔堅定、充滿希望、具有啟發性。請寫成流暢散文，不要列點，不要使用 Markdown 標題。`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFinalPrompt(createPrompt());
    setShowModal(true);
    setCopySuccess(false);
    setImageStatus('');
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(finalPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = finalPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const downloadAnswerImage = async () => {
    if (!answerCardRef.current) {
      alert('找不到填寫內容，請稍後再試。');
      return;
    }

    setImageStatus('圖片產生中，請稍候……');

    let wrapper = null;
    let url = null;

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const source = answerCardRef.current;
      const clone = source.cloneNode(true);

      wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-10000px';
      wrapper.style.top = '0';
      wrapper.style.width = '1080px';
      wrapper.style.background = '#fdfbf7';
      wrapper.style.overflow = 'visible';
      wrapper.style.zIndex = '-1';

      clone.style.width = '1080px';
      clone.style.maxWidth = '1080px';
      clone.style.minWidth = '1080px';
      clone.style.height = 'auto';
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.transform = 'none';
      clone.style.boxSizing = 'border-box';
      clone.style.background = '#fdfbf7';

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const exportWidth = 1080;
      const exportHeight = Math.max(clone.scrollHeight, clone.offsetHeight, 1200);

      const canvas = await html2canvas(clone, {
        backgroundColor: '#fdfbf7',
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

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('圖片產生失敗');

      const dateText = new Date().toLocaleDateString('zh-TW').replace(/\//g, '-');
      const fileName = `愛情藍圖填寫答案-${dateText}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: '我的愛情藍圖填寫答案',
            text: '這是我的愛情藍圖填寫答案。',
          });
          setImageStatus('圖片已開啟分享面板。');
          return;
        } catch {
          // 使用者取消分享時，改走下載或開圖備用方案
        }
      }

      url = URL.createObjectURL(blob);
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (isIOS) {
        const imageWindow = window.open('', '_blank');
        if (imageWindow) {
          imageWindow.document.write(
            '<html><head><title>愛情藍圖填寫答案</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;background:#fdfbf7;text-align:center;"><p style="font-family:sans-serif;color:#555;padding:16px;">長按圖片，選擇「儲存到照片」</p><img src="' +
              url +
              '" style="width:100%;height:auto;display:block;" /></body></html>'
          );
          imageWindow.document.close();
          setImageStatus('已開啟圖片頁面，請長按圖片儲存。');
        } else {
          window.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 120000);
        return;
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setImageStatus('圖片已開始下載。');
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    } catch (error) {
      console.error(error);
      alert('圖片輸出失敗，請再試一次，或先截圖保存。');
      setImageStatus('圖片輸出失敗，請再試一次。');
    } finally {
      if (wrapper?.parentNode) wrapper.parentNode.removeChild(wrapper);
    }
  };

  const Field = ({ id, label, placeholder, multiline = false, rows = 2 }) => (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={formData[id]}
          onChange={handleInputChange}
          className="w-full p-3 border border-stone-200 rounded-xl bg-white outline-none focus:border-rose-400 transition-all resize-none"
          placeholder={placeholder}
          required
        />
      ) : (
        <input
          id={id}
          value={formData[id]}
          onChange={handleInputChange}
          className="w-full p-3 border border-stone-200 rounded-xl bg-white outline-none focus:border-rose-400 transition-all"
          placeholder={placeholder}
          required
        />
      )}
    </div>
  );

  const AnswerLine = ({ title, children }) => (
    <div className="border-b border-stone-100 pb-4">
      <p className="text-sm tracking-widest text-stone-400 uppercase mb-2">{title}</p>
      <p className="text-stone-700 leading-relaxed whitespace-pre-wrap break-words">{children || '尚未填寫'}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2c3e50] p-4 md:p-12 font-sans selection:bg-rose-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=Noto+Sans+TC:wght@300;400;500&display=swap');
        .serif { font-family: 'Noto Serif TC', serif; }
        .section-card {
          background: white;
          border: 1px solid #e7e2da;
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(82, 63, 40, 0.06);
        }
        .section-card::before { content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%; }
        .card-a::before { background-color: #fbbf24; }
        .card-vision::before { background-color: #ec4899; }
        .card-struct::before { background-color: #64748b; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-block p-4 bg-rose-50 rounded-full mb-4">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2 serif text-stone-800">愛情藍圖設計計畫</h1>
          <p className="text-gray-400 tracking-[0.3em] uppercase text-xs">—— Design My Love, Build My Life ——</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="section-card card-a">
            <h2 className="text-xl font-bold mb-4 serif flex items-center gap-2">
              <PenTool className="w-5 h-5 text-amber-500" /> 1.【初衷：靈魂對話】
            </h2>
            <div className="space-y-4">
              <Field id="goldenSentence" label="靈魂金句" placeholder="輸入啟發你的那句話……" />
              <Field id="goldenReason" label="選擇的原因" placeholder="這句話對你的意義是什麼？" multiline rows={3} />
            </div>
          </div>

          <div className="section-card card-vision">
            <h2 className="text-xl font-bold mb-4 serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" /> 2.【幸福顯影：未來縮影】
            </h2>
            <Field
              id="vision"
              label="描述你理想中 10–15 年後的幸福畫面"
              placeholder="畫面中有誰？在做什麼？氣氛如何？你聽見什麼、感受到什麼？"
              multiline
              rows={5}
            />
          </div>

          <div className="section-card card-struct">
            <h2 className="text-xl font-bold mb-6 serif flex items-center gap-2">
              <Construction className="w-5 h-5 text-slate-500" /> 3.【結構設計：穩定工程】
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                <h3 className="font-bold text-lg text-purple-700 mb-1">地基</h3>
                <p className="text-xs text-gray-400 mb-4">自我覺察／關係狀態</p>
                <div className="space-y-3">
                  <Field id="c1" label="要素 1" placeholder="例如：安全感" />
                  <Field id="c2" label="要素 2" placeholder="例如：自我理解" />
                  <Field id="c3" label="要素 3" placeholder="例如：情緒穩定" />
                </div>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                <h3 className="font-bold text-lg text-blue-700 mb-1">支柱</h3>
                <p className="text-xs text-gray-400 mb-4">價值信念／核心篩選</p>
                <div className="space-y-3">
                  <Field id="b1" label="信念 1" placeholder="例如：尊重" />
                  <Field id="b2" label="信念 2" placeholder="例如：真誠" />
                  <Field id="b3" label="信念 3" placeholder="例如：共同成長" />
                </div>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                <h3 className="font-bold text-lg text-orange-700 mb-1">鋼筋</h3>
                <p className="text-xs text-gray-400 mb-4">經營技術／修練能力</p>
                <div className="space-y-3">
                  <Field id="d1" label="能力 1" placeholder="例如：好好溝通" />
                  <Field id="d2" label="能力 2" placeholder="例如：修復衝突" />
                  <Field id="d3" label="能力 3" placeholder="例如：表達欣賞" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xl rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" /> 完成並產生 AI 指令
          </button>
        </form>

        <footer className="mt-20 text-center text-gray-400 text-[10px] tracking-[0.3em] border-t border-gray-100 pt-8 uppercase">
          © 2026 FUYOU EDTECH · 愛的決定學 · 專屬你的幸福結構
        </footer>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fdfbf7] w-full max-w-3xl rounded-3xl shadow-2xl relative my-8 overflow-hidden">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-800 transition-colors z-20"
            >
              <X className="w-7 h-7" />
            </button>

            <div className="p-6 md:p-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold serif text-stone-800">你的愛情藍圖資料已完成</h2>
                <p className="text-stone-500 mt-2">可下載填寫答案，也可複製指令到自己常用的 AI。</p>
              </div>

              <div ref={answerCardRef} className="bg-[#fdfbf7] p-8 md:p-12 border border-stone-200 rounded-2xl">
                <div className="text-center mb-8">
                  <div className="inline-block p-3 bg-rose-50 rounded-full mb-3">
                    <Heart className="w-7 h-7 text-rose-500" />
                  </div>
                  <h3 className="text-3xl font-bold serif text-stone-800 tracking-widest">我的愛情藍圖填寫答案</h3>
                  <p className="text-[11px] text-stone-400 mt-2 uppercase tracking-[0.35em]">Personal Love Blueprint Notes</p>
                </div>

                <div className="space-y-6 serif text-lg">
                  <AnswerLine title="Soul Sentence｜靈魂金句">{formData.goldenSentence}</AnswerLine>
                  <AnswerLine title="Reason｜選擇原因">{formData.goldenReason}</AnswerLine>
                  <AnswerLine title="Vision｜幸福顯影">{formData.vision}</AnswerLine>
                  <AnswerLine title="Foundation｜地基">
                    {joinValues(formData.c1, formData.c2, formData.c3)}
                  </AnswerLine>
                  <AnswerLine title="Pillars｜支柱">
                    {joinValues(formData.b1, formData.b2, formData.b3)}
                  </AnswerLine>
                  <AnswerLine title="Reinforcement｜鋼筋">
                    {joinValues(formData.d1, formData.d2, formData.d3)}
                  </AnswerLine>
                </div>

                <div className="mt-10 pt-6 border-t border-stone-200 flex justify-between text-xs text-stone-400">
                  <span>愛的決定學 · 愛情藍圖設計計畫</span>
                  <span>{new Date().toLocaleDateString('zh-TW')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={downloadAnswerImage}
                  className="py-4 bg-rose-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                >
                  <Download className="w-5 h-5" /> 下載填寫答案圖片
                </button>
                <button
                  onClick={copyPrompt}
                  className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    copySuccess ? 'bg-green-600 text-white' : 'bg-stone-800 text-white hover:bg-stone-900'
                  }`}
                >
                  {copySuccess ? '已複製 AI 指令' : <><Copy className="w-5 h-5" /> 複製 AI 指令</>}
                </button>
              </div>

              {imageStatus && <p className="text-center text-sm text-stone-500 mt-3">{imageStatus}</p>}

              <textarea
                value={finalPrompt}
                readOnly
                className="mt-6 w-full h-52 p-4 text-sm bg-white border border-stone-200 rounded-2xl text-stone-600 leading-relaxed"
              />

              <div className="flex flex-col md:flex-row gap-3 justify-center mt-4">
                <a
                  href="https://chatgpt.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-green-50 text-green-700 border border-green-100 font-bold flex items-center justify-center gap-2"
                >
                  前往 ChatGPT <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://gemini.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-bold flex items-center justify-center gap-2"
                >
                  前往 Gemini <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
