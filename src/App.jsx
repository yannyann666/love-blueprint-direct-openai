import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Loader2, Sparkles, CheckCircle2, AlertCircle, X, Copy, Download, Heart, PenTool, Construction, Shield } from 'lucide-react';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const blueprintRef = useRef(null);

  const [formData, setFormData] = useState({
    goldenSentence: "",
    goldenReason: "",
    vision: "",
    c1: "", c2: "", c3: "",
    b1: "", b2: "", b3: "",
    d1: "", d2: "", d3: ""
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const generateBlueprint = async () => {
    setLoading(true);
    setError("");
    setResult("");
    setShowModal(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || '生成失敗，請稍後再試。');
      }

      setResult(data.text || '');
    } catch (err) {
      setError(err.message || "建築計畫暫時受阻，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateBlueprint();
  };

  const downloadImage = async () => {
    if (!blueprintRef.current) return;

    const canvas = await html2canvas(blueprintRef.current, {
      backgroundColor: '#fdfbf7',
      scale: 3,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `愛情藍圖宣言-${new Date().toLocaleDateString('zh-TW').replaceAll('/', '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = result;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2c3e50] p-4 md:p-12 font-sans selection:bg-rose-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap');
        body { font-family: 'Noto Sans TC', sans-serif; }
        .serif { font-family: 'Noto Serif TC', serif; }
        .section-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .section-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">靈魂金句：</label>
              <input type="text" id="goldenSentence" value={formData.goldenSentence} onChange={handleInputChange} className="w-full p-3 border border-stone-200 rounded-lg mt-1 outline-none focus:border-rose-400 transition-all" placeholder="輸入啟發你的那句話..." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">選擇的原因：</label>
              <textarea id="goldenReason" rows="2" value={formData.goldenReason} onChange={handleInputChange} className="w-full p-3 border border-stone-200 rounded-lg mt-1 outline-none focus:border-rose-400 transition-all" placeholder="這句話對你的意義是什麼？" required></textarea>
            </div>
          </div>

          <div className="section-card card-vision">
            <h2 className="text-xl font-bold mb-4 serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" /> 2.【幸福顯影：未來縮影】
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述你理想中 15 年後的幸福畫面：</label>
            <textarea id="vision" rows="4" value={formData.vision} onChange={handleInputChange} className="w-full p-3 border border-stone-200 rounded-lg mt-1 outline-none focus:border-rose-400 transition-all" placeholder="畫面中有誰？在做什麼？感受如何？" required></textarea>
          </div>

          <div className="section-card card-struct">
            <h2 className="text-xl font-bold mb-6 serif flex items-center gap-2">
              <Construction className="w-5 h-5 text-slate-500" /> 3.【結構設計：穩定工程】
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-stone-50 p-5 rounded-xl border border-stone-100">
                <h3 className="font-bold text-lg text-purple-700 mb-1">地基 (自我覺察)</h3>
                <p className="text-[10px] text-gray-400 mb-4 uppercase font-bold tracking-widest">Foundation</p>
                <div className="space-y-2">
                  <input type="text" id="c1" value={formData.c1} onChange={handleInputChange} className="w-full p-2.5 text-sm border rounded-lg bg-white outline-none focus:border-purple-400" placeholder="要素 1" required />
                  <input type="text" id="c2" value={formData.c2} onChange={handleInputChange} className="w-full p-2.5 text-sm border rounded-lg bg-white outline-none focus:border-purple-400" placeholder="要素 2" required />
                  <input type="text" id="c3" value={formData.c3} onChange={handleInputChange} className="w-full p-2.5 text-sm border rounded-lg bg-white outline-none focus:border-purple-400" placeholder="要素 3" required />
                </div>
              </div>
              <div className="bg-stone-50 p-5 rounded-xl border border-stone-100">
                <h3 className="font-bold text-lg text-blue-700 mb-1">支柱 (核心信念)</h3>
                <p className="text-[10px] text-gray-400 mb-4 uppercase font-bold tracking-widest">Pillars</p>
                <div className="space-y-2">
                  <input type="text" id="b1" value={formData.b1} onChange={handleInputChange} className="w-full p-2.5 text-sm border rounded-lg bg-white outline-none focus:border-blue-400" placeholder="信念 1" required />
                  <input type="text" id="b2" value={formData.b2} onChange={handleInputChange} className="w-full p-2.5 text-sm border rounded-lg bg-white outline-none focus:border-blue-400" placeholder="信念 2" required />
                  <input type="text" id="b3" value={formData.b3} onChange={handleInputChange} className="w-full p-2.5 text-sm border rounded-lg bg-white outline-none focus:border-blue-400" placeholder="信念 3" required />
                </div>
              </div>
              <div className="bg-stone-50 p-5 rounded-xl border border-stone-100">
                <h3 className="font-bold text-lg text-orange-700 mb-1">鋼筋 (經營能力)</h3>
                <p className="text-[10px] text-gray-400 mb-4 uppercase font-bold tracking-widest">Reinforcement</p>
                <div className="space-y-2">
                  <input type="text" id="d1" value={formData.d1} onChange={handleInputChange} className="w-full p-2.5 text-sm border rounded-lg bg-white outline-none focus:border-orange-400" placeholder="能力 1" required />
                  <input type="text" id="d2" value={formData.d2} onChange={handleInputChange} className="w-full p-2.5 text-sm border rounded-lg bg-white outline-none focus:border-orange-400" placeholder="能力 2" required />
                  <input type="text" id="d3" value={formData.d3} onChange={handleInputChange} className="w-full p-2.5 text-sm border rounded-lg bg-white outline-none focus:border-orange-400" placeholder="能力 3" required />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xl rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin w-7 h-7" /> : <><Shield className="w-6 h-6" /> 建築我的專屬宣言</>}
          </button>
        </form>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#fdfbf7] w-full max-w-2xl rounded-3xl shadow-2xl relative my-8">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-800 transition-colors z-20">
                <X className="w-7 h-7" />
              </button>

              <div ref={blueprintRef} className="p-10 md:p-16 bg-[#fdfbf7] relative overflow-hidden">
                <div className="absolute inset-4 border border-stone-200 pointer-events-none z-0"></div>
                <div className="absolute inset-6 border-[3px] border-stone-100 pointer-events-none z-0"></div>

                <div className="relative z-10">
                  <div className="text-center mb-12 pt-4">
                    <div className="inline-block p-3 bg-rose-50 rounded-full mb-3">
                      <Heart className="w-6 h-6 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-bold serif text-stone-800 tracking-widest">愛情藍圖宣言</h2>
                    <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-[0.4em]">Personal Blueprint Certificate</p>
                  </div>

                  {loading ? (
                    <div className="space-y-6 py-12 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-stone-300 mx-auto" />
                      <p className="text-stone-400 serif italic">建築師正在將您的想法一磚一瓦地砌成宣言...</p>
                    </div>
                  ) : error ? (
                    <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center border border-red-100 serif">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      {error}
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="grid grid-cols-3 gap-4 text-center border-y border-stone-100 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stone-400 uppercase mb-2">Foundation</span>
                          <span className="text-[12px] font-bold text-purple-700 break-words leading-tight px-1">
                            {[formData.c1, formData.c2, formData.c3].filter(Boolean).join(' / ')}
                          </span>
                        </div>
                        <div className="flex flex-col border-x border-stone-100">
                          <span className="text-[10px] text-stone-400 uppercase mb-2">Pillars</span>
                          <span className="text-[12px] font-bold text-blue-700 break-words leading-tight px-1">
                            {[formData.b1, formData.b2, formData.b3].filter(Boolean).join(' / ')}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stone-400 uppercase mb-2">Reinforcement</span>
                          <span className="text-[12px] font-bold text-orange-700 break-words leading-tight px-1">
                            {[formData.d1, formData.d2, formData.d3].filter(Boolean).join(' / ')}
                          </span>
                        </div>
                      </div>

                      <div className="prose prose-stone max-w-none px-4">
                        <div className="text-stone-600 leading-[2.4] whitespace-pre-wrap serif text-lg text-justify first-letter:text-4xl first-letter:font-bold first-letter:text-rose-500 first-letter:mr-2">
                          {result}
                        </div>
                      </div>

                      <div className="mt-16 pt-8 flex justify-between items-end border-t border-stone-100 px-4">
                        <div className="text-left">
                          <p className="text-[10px] text-stone-300 uppercase tracking-widest">Issue Date</p>
                          <p className="text-xs font-mono text-stone-500">{new Date().toLocaleDateString('zh-TW')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-stone-300 uppercase tracking-widest">Designed by</p>
                          <p className="text-sm serif text-stone-600 font-bold">愛情建築師 · 專屬計畫</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!loading && result && (
                <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-20">
                  <button onClick={downloadImage} className="py-4 bg-rose-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-lg shadow-rose-100">
                    <Download className="w-5 h-5" /> 下載我的藍圖圖片
                  </button>
                  <button onClick={copyToClipboard} className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${copySuccess ? 'bg-green-600 text-white' : 'bg-stone-800 text-white hover:bg-stone-900'}`}>
                    {copySuccess ? <><CheckCircle2 className="w-5 h-5" /> 複製成功</> : <><Copy className="w-5 h-5" /> 複製文字內容</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="mt-20 text-center text-gray-400 text-[10px] tracking-[0.3em] border-t border-gray-100 pt-8 uppercase">
          © 2026 FUYOU EDTECH · 愛的決定學 · 專屬你的幸福結構
        </footer>
      </div>
    </div>
  );
};

export default App;
