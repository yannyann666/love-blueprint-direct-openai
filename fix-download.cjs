const fs = require("fs");

const path = "src/App.jsx";
let content = fs.readFileSync(path, "utf8");

// Add html2canvas import if missing
if (!content.includes('import html2canvas from "html2canvas";')) {
  content = content.replace(
    /import \{([\s\S]*?)\} from 'lucide-react';/,
    `import {$1} from 'lucide-react';\nimport html2canvas from "html2canvas";`
  );
}

// Remove old CDN html2canvas loader useEffect if present
content = content.replace(
  /\n\s*useEffect\(\(\) => \{\s*const script = document\.createElement\('script'\);[\s\S]*?return \(\) => document\.body\.removeChild\(script\);\s*\}, \[\]\);/,
  ""
);

const newDownloadImage = `
  const downloadImage = async () => {
    if (!blueprintRef.current) {
      alert("找不到藍圖內容，請稍後再試一次。");
      return;
    }

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const source = blueprintRef.current;

      // 複製一份完整藍圖到畫面外，避免被彈窗、手機視窗高度、overflow 裁切
      const clone = source.cloneNode(true);

      clone.style.position = "absolute";
      clone.style.left = "-99999px";
      clone.style.top = "0";
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

      // 避免任何父層樣式影響截圖
      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.left = "-99999px";
      wrapper.style.top = "0";
      wrapper.style.width = "1080px";
      wrapper.style.height = "auto";
      wrapper.style.overflow = "visible";
      wrapper.style.backgroundColor = "#fdfbf7";
      wrapper.style.zIndex = "-1";
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // 等瀏覽器完成重新排版
      await new Promise((resolve) => setTimeout(resolve, 500));

      const exportWidth = clone.scrollWidth || 1080;
      const exportHeight = clone.scrollHeight || clone.offsetHeight;

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

      const dateText = new Date()
        .toLocaleDateString("zh-TW")
        .replace(/\\\\/g, "-")
        .replace(/\\//g, "-");

      const fileName = "愛情藍圖宣言-" + dateText + ".png";

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) {
        alert("圖片產生失敗，請再試一次。");
        return;
      }

      const file = new File([blob], fileName, { type: "image/png" });

      // 手機優先使用分享面板
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "我的愛情藍圖宣言",
            text: "這是我的愛情藍圖宣言。",
          });
          return;
        } catch (shareError) {
          console.log("使用者取消分享，改用下載或開圖方式。");
        }
      }

      const url = URL.createObjectURL(blob);

      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      if (isIOS) {
        const imageWindow = window.open("", "_blank");

        if (imageWindow) {
          imageWindow.document.write(
            '<html><head><title>愛情藍圖宣言</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;background:#fdfbf7;text-align:center;"><p style="font-family:sans-serif;color:#555;padding:16px;">長按圖片，選擇「儲存到照片」</p><img src="' +
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
      alert("圖片下載失敗，請改用截圖保存，或稍後再試。");
    }
  };

  const copyToClipboard =`;

const pattern =
  /\n\s*const downloadImage\s*=\s*[\s\S]*?\n\s*const copyToClipboard\s*=/;

if (!pattern.test(content)) {
  console.error("找不到 downloadImage 區塊，沒有修改任何檔案。");
  process.exit(1);
}

fs.writeFileSync(path + ".bak", content, "utf8");

content = content.replace(pattern, "\n" + newDownloadImage);

fs.writeFileSync(path, content, "utf8");

console.log("完成：已改成完整藍圖離屏輸出，避免電腦與手機截圖不完整。");