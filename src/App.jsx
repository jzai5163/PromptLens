import React, { useState, useRef, useEffect } from "react";

const TOOLS = {
  midjourney: {
    label: "미드저니",
    guide: "a single-line Midjourney v6 prompt. Order: main subject → key visual details → style/medium → lighting → mood. End with parameters: --ar (the aspect ratio you inferred), --style raw if photographic. Use concrete photographic vocabulary. No '/imagine', no quotes.",
  },
  gpt: {
    label: "GPT",
    guide: "a single flowing natural-language paragraph describing the scene the way ChatGPT/DALL·E 3 prefers. Specific and visual, full sentences not tags. Include subject, setting, lighting, color palette, mood, camera feel. No parameters, no comma-tag lists.",
  },
  sd: {
    label: "SD",
    guide: "a Stable Diffusion prompt as comma-separated tags ordered by importance (subject first). Emphasize the 1-2 defining elements using (keyword:1.2) syntax. Include quality/medium tags. Short tags, no sentences.",
  },
  nano: {
    label: "제미나이",
    full: "제미나이 (나노바나나)",
    guide: "a prompt for Google's Gemini / Nano Banana image model. It can both generate from scratch and edit existing images via natural language. Write a clear natural-language description of the desired image (or, if this is clearly an edit of a real photo, a precise editing instruction). Be specific about subject, style, and any text that should appear.",
  },
};

const VIDEO_TOOLS = {
  sora: { label: "Sora", guide: "a Sora (OpenAI) video prompt: a vivid natural-language description of the scene AND its motion — camera movement, subject action, pacing. One rich paragraph." },
  runway: { label: "Runway", guide: "a Runway Gen-3 video prompt: describe the shot and camera motion concisely. Format like 'cinematic [scene], [camera move], [lighting/mood]'." },
  kling: { label: "Kling", guide: "a Kling video prompt: describe subject, action/motion, and camera in clear natural language. Note any slow-motion or speed feel." },
  veo: { label: "Veo", guide: "a Veo (Google) video prompt: cinematic natural-language description including scene, motion, camera work, and atmosphere." },
};

// 요즘 핫한 AI 프롬프트 프리셋 (12종) — 이미지에 적힌 프롬프트 + 분석 종합. [첨부사진] 자리표시자로 재사용 가능
const PRESETS = [
  {
    id: "cityview", emoji: "🌃", title: "시티뷰 스냅", cat: "인물 변환", tool: "nano", hot: true,
    desc: "밤거리 차창 밖으로 기댄 빈티지 무드 셀카",
    prompt: "Create a photo of [첨부사진] of me leaning my back out the car window, like a dark dreamy blurry vintage windy night, wearing an off-shoulder white knitted top, with long wavy hair. Keep the facial details correct. Please do NOT alter facial features and leave head positioning as is.",
  },
  {
    id: "digicam", emoji: "📷", title: "디지털 카메라 액자", cat: "인물 변환", tool: "nano", hot: true,
    desc: "옛날 디카 액정에 비친 듯한 플래시 셀카",
    prompt: "Use the facial features of [첨부사진]. A close-up shot of the person displayed on the screen of a compact Canon digital camera. The camera body surrounds the image with its buttons, dials, and textured surface visible (FUNC/SET wheel, DISP button, 'IMAGE STABILIZER' label). The photo on screen shows the person indoors at night, illuminated by a bright built-in flash creating sharp highlights on face and hair. Keep facial identity unchanged.",
  },
  {
    id: "paris", emoji: "☕", title: "파리 카페 테라스", cat: "인물 변환", tool: "nano",
    desc: "에디토리얼 3×3 그리드, 파리 감성 화보",
    prompt: "Editorial 3×3 grid in a soft pastel-blue studio. Character (face characteristics 100% same as [첨부사진]) wearing a light blue sleeveless dress. Shots: cheek/lip macro with blurred hand, reflective eye crop, B&W chin-rest portrait, fabric-framed over-shoulder, frontal light-band close-up, angled hair-fall portrait, hand-to-collarbone crop, seated half-body, profile droplet highlight. RAW, airy tones, smooth editorial finish.",
  },
  {
    id: "glitch", emoji: "🌀", title: "슬라이스 왜곡 인물", cat: "효과", tool: "gpt",
    desc: "세로로 잘린 글리치 하이패션 포트레이트",
    prompt: "High-fashion portrait of [첨부사진] with vertical slice distortion, glitch splitting, and analog-style grain. Keep the face recognizable. Editorial lighting, neutral background, cinematic mood.",
  },
  {
    id: "eyebrow", emoji: "🔍", title: "미니어처 합성 (눈썹 깎기)", cat: "효과", tool: "gpt",
    desc: "얼굴 위에 작은 사람이 잔디 깎듯 합성",
    prompt: "A hyper-realistic macro photo of [첨부사진]'s face. A tiny miniature man pushing a red lawnmower is compositied onto the eyebrow, trimming it like grass, casting a realistic shadow. Sharp macro detail, natural skin texture, surreal scale contrast.",
  },
  {
    id: "y2k", emoji: "💿", title: "빈티지 디카샷 (Y2K)", cat: "인물 변환", tool: "nano", hot: true,
    desc: "2000년대 싸이월드 감성 거울 셀카",
    prompt: "Mirror selfie of [첨부사진], flash photography, holding a vintage silver digital compact camera, simple light grey tank top, long dark layered hair framing the face, bathroom mirror background, Y2K aesthetic, early 2000s internet vibe, Cyworld sensibility, natural skin texture, candid shot, film grain, soft focus, nostalgic atmosphere --ar 3:4 --style raw",
  },
  {
    id: "ballet", emoji: "🩰", title: "발레코어 샷", cat: "인물 변환", tool: "gpt",
    desc: "발레코어·코케트 감성 거울 셀카",
    prompt: "Subject: [첨부사진], k-pop idol aesthetic, cute face. Pose: sitting on floor, mirror selfie, holding smartphone, one knee up. Outfit: grey off-shoulder top, ribbon tie details, cutout sleeves, pale pink sheer wrap skirt, beige leg warmers, ballet flats. Hair: dark messy bun, bangs. Background: white minimalist interior, large mirror. Style: soft natural lighting, dreamy coquette aesthetic, pinterest vibe, 4k, realistic photo.",
  },
  {
    id: "minecraft", emoji: "🟫", title: "음식 픽셀화 (마인크래프트)", cat: "변환", tool: "nano",
    desc: "사진 속 음식·사물을 마크 블록으로",
    prompt: "Transform every food and item in [첨부사진] into Minecraft-style voxel blocks using authentic Minecraft pixel textures. Each object must look like a real Minecraft item with blocky geometry, flat pixel textures, and game-consistent colors. Add Minecraft inventory-style text labels above each item (white pixel font on dark semi-transparent background), naming the food as a game item. Keep the person photorealistic and unchanged.",
  },
  {
    id: "carnation", emoji: "🌸", title: "카네이션 감사카드", cat: "테마", tool: "nano",
    desc: "어버이날 감성 카네이션 정원 합성",
    prompt: "Transform [첨부사진] into a warm carnation-garden scene: keep the child's face and identity 100% photorealistic and unchanged, place them among abundant pink and red carnations, white picket fence, vintage lace card reading a thank-you message, soft golden lighting, cozy heartfelt mother's-day atmosphere, realistic photo.",
  },
  {
    id: "crayon", emoji: "🖍️", title: "크레용 그림체", cat: "변환", tool: "nano", hot: true,
    desc: "아이가 크레파스로 그린 듯한 그림체",
    prompt: "Transform [첨부사진] into a child's crayon drawing on textured cream paper: hand-drawn crayon strokes, naive proportions, visible waxy texture, simple background (window, sun, toys), warm childlike doodle style, while keeping the subject recognizable.",
  },
  {
    id: "keyring", emoji: "🔑", title: "아크릴 키링 굿즈", cat: "굿즈", tool: "nano", hot: true,
    desc: "내 사진으로 만든 아크릴 키링 목업",
    prompt: "Create a product mockup of a custom acrylic keyring made from [첨부사진]: die-cut clear acrylic charm of the subject, gold clasp and star pendant, pastel blue 'CUSTOM ACRYLIC KEYRING' backing card with clouds and stars, soft studio lighting, cute kawaii product photography, keep the subject's face unchanged.",
  },
  {
    id: "gacha", emoji: "🥚", title: "가챠 피규어", cat: "변환", tool: "nano",
    desc: "가챠 캡슐 안에 든 피규어처럼",
    prompt: "Place [첨부사진] inside a transparent gacha capsule like a collectible figure: pastel gachapon machine background, the subject sitting inside a clear capsule with teal base, surrounded by pastel capsule balls, cute Korean title banner '오늘의 가챠 피규어', soft toy-shop lighting, keep the subject's face and identity unchanged.",
  },
  {
    id: "lego", emoji: "🧱", title: "실사 레고 변환", cat: "변환", tool: "nano", hot: true,
    desc: "인물은 실사 그대로, 배경만 진짜 레고 디오라마로",
    prompt: "Transform only the environment of [첨부사진] into a hyper-realistic LEGO diorama world while keeping the human subject completely unchanged and photorealistic.\n\nKeep the human fully realistic: real face, real skin texture, real hair, real eyes, real hands, real clothing, real body proportions, real facial details, real expression, real pose.\nDo NOT modify, stylize, beautify, or LEGO-ify the person. Do NOT change the identity. Do NOT make the human look like a toy.\n\nOnly the surrounding environment becomes LEGO: ground, trees, grass, rocks, mountains, water, buildings, roads, camping gear, furniture, background objects, and textures. Everything must look physically built from real LEGO bricks with visible studs, brick seams, layered construction, realistic reflections, macro texture detail. If water exists, use transparent LEGO pieces with reflections. If fog/smoke exists, use translucent LEGO elements.\n\nKeep the original composition, camera angle, perspective, framing, lighting direction, and atmosphere. Blend the realistic human naturally into the LEGO environment.\n\nHyper-realistic lighting, shallow depth of field, cinematic atmosphere. NO cartoon style, NO childish toy aesthetic, NO simplified LEGO art, NO animated look, NO fake CGI. Ultra detailed, photorealistic. Preserve realism at all costs. Vertical 4:5 ratio.",
  },
  {
    id: "candid", emoji: "🤳", title: "실수로 찍힌 셀카 감성", cat: "인물 변환", tool: "nano", hot: true,
    desc: "일부러 흔들린 듯한 자연스러운 캔디드 셀카",
    prompt: "Transform [첨부사진] into a candid, accidentally-taken selfie aesthetic while keeping the person's face and identity 100% unchanged and photorealistic. Natural unposed feel, slight motion blur, imperfect framing, soft daylight or window light, authentic film-like grain, muted natural color, no heavy beautifying. The vibe should feel like a real spontaneous moment captured by accident, not a posed photo. Keep facial features and skin texture natural and real.",
  },
];
const PRESET_CATS = ["전체", "인물 변환", "변환", "효과", "굿즈", "테마"];

// 클립보드 복사 (샌드박스 환경 폴백 포함)
function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      return;
    }
  } catch (e) { /* fall through */ }
  fallbackCopy(text);
}
function fallbackCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch (e) { /* 최후에도 실패하면 사용자가 직접 선택 */ }
}

// 디자인 토큰: 딥 플럼 배경 + 스펙트럼 액센트
const T = {
  bg: "#160B29",
  bg2: "#1F1138",
  card: "#251544",
  cardLine: "#3A2363",
  text: "#F3ECFF",
  textDim: "#A99AC8",
  textFaint: "#6E5E92",
  magenta: "#FF2E97",
  purple: "#7B2FF7",
  cyan: "#00E5D4",
  amber: "#FFC24B",
  mono: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
  spectrum: "linear-gradient(90deg,#FF2E97 0%,#7B2FF7 50%,#00E5D4 100%)",
};

function downscale(file, maxDim = 1280) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve({ preview: dataUrl, data: dataUrl.split(",")[1], mime: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 영상에서 균등 간격으로 프레임 추출 (기본 5장, 긴 변 1024px)
function extractFrames(file, count = 5, maxDim = 1024) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    video.src = url;
    const frames = [];
    let times = [], idx = 0, firstPreview = null;

    video.onloadedmetadata = () => {
      const dur = video.duration;
      if (!dur || !isFinite(dur)) { reject(new Error("VIDEO: 영상 길이를 읽지 못했어요.")); return; }
      // 처음과 끝은 살짝 안쪽으로
      for (let i = 0; i < count; i++) times.push((dur * (i + 0.5)) / count);
      seek();
    };
    function seek() { if (idx >= times.length) { URL.revokeObjectURL(url); resolve({ frames, preview: firstPreview }); return; } video.currentTime = times[idx]; }
    video.onseeked = () => {
      let { videoWidth: w, videoHeight: h } = video;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      w = Math.round(w * scale); h = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      if (!firstPreview) firstPreview = dataUrl;
      frames.push(dataUrl.split(",")[1]);
      idx++; seek();
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("VIDEO: 이 영상 형식을 읽지 못했어요. MP4를 권장해요.")); };
  });
}

function Logo({ size = 26 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: T.spectrum, opacity: 0.9 }} />
        <span style={{ position: "absolute", inset: size * 0.18, borderRadius: "50%", background: T.bg }} />
        <span style={{ position: "absolute", inset: size * 0.34, borderRadius: "50%", background: T.spectrum }} />
      </span>
      <span style={{ fontSize: size * 0.85, fontWeight: 800, letterSpacing: "-0.03em", color: T.text }}>
        Prompt<span style={{ background: T.spectrum, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Lens</span>
      </span>
    </span>
  );
}

function Drop({ label, image, onFile, compact, big }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  return (
    <div>
      {label && (
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".1em", color: T.textDim, marginBottom: 6, textAlign: "center", textTransform: "uppercase" }}>{label}</div>
      )}
      <div
        onClick={() => ref.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
        style={{
          border: image ? `1px solid ${T.cardLine}` : `2px dashed ${drag ? T.magenta : T.cardLine}`,
          borderRadius: 16, background: drag ? "rgba(255,46,151,0.08)" : T.bg2,
          padding: image ? 8 : big ? "44px 20px" : compact ? "26px 12px" : "36px 20px",
          textAlign: "center", cursor: "pointer", transition: "all .15s",
        }}
      >
        {image ? (
          <img src={image} alt="" style={{ maxWidth: "100%", maxHeight: compact ? 160 : 300, borderRadius: 10, display: "block", margin: "0 auto" }} />
        ) : (
          <>
            <div style={{ fontSize: compact ? 26 : 34, lineHeight: 1, background: T.spectrum, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 700 }}>＋</div>
            <div style={{ fontSize: compact ? 12 : 14, color: T.text, marginTop: 12, fontWeight: 600 }}>{compact ? "탭하기" : "사진 올리기"}</div>
            <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4 }}>JPG · PNG · WEBP</div>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
    </div>
  );
}

function VideoDrop({ video, loading, onFile }) {
  const ref = useRef();
  return (
    <div>
      <div
        onClick={() => !loading && ref.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
        style={{
          border: video ? `1px solid ${T.cardLine}` : `2px dashed ${T.cardLine}`,
          borderRadius: 16, background: T.bg2, padding: video ? 8 : "44px 20px",
          textAlign: "center", cursor: loading ? "wait" : "pointer", transition: "all .15s",
        }}
      >
        {loading ? (
          <div style={{ color: T.textDim, fontSize: 13, fontFamily: T.mono, padding: "20px 0" }}>영상에서 프레임 뽑는 중…</div>
        ) : video ? (
          <div>
            <img src={video.preview} alt="" style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 10, display: "block", margin: "0 auto" }} />
            <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 8, fontFamily: T.mono }}>프레임 {video.frames.length}장 추출됨 · 다시 올리려면 탭</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 34, lineHeight: 1, background: T.spectrum, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 700 }}>▶</div>
            <div style={{ fontSize: 14, color: T.text, marginTop: 12, fontWeight: 600 }}>영상 올리기</div>
            <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4 }}>MP4 · MOV · 짧을수록 좋아요</div>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="video/*" hidden onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
    </div>
  );
}

function Conf({ c }) {
  const high = c === "high";
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 9, padding: "2px 7px", borderRadius: 20, marginLeft: 8, verticalAlign: 1, fontWeight: 600,
      background: high ? "rgba(0,229,212,0.15)" : "rgba(255,194,75,0.15)",
      color: high ? T.cyan : T.amber,
      border: `1px solid ${high ? "rgba(0,229,212,0.3)" : "rgba(255,194,75,0.3)"}`,
    }}>{high ? "확실" : "추정"}</span>
  );
}

function ResultRow({ k, v, c }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 0", borderBottom: `1px solid ${T.cardLine}`, fontSize: 13.5 }}>
      <span style={{ color: T.textDim, fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", flexShrink: 0, paddingTop: 2 }}>{k}</span>
      <span style={{ textAlign: "right", fontWeight: 500, color: T.text }}>{v}{c && <Conf c={c} />}</span>
    </div>
  );
}

function PromptCard({ label, text, negative, accent, sub }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent || T.magenta }} />
        <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, fontWeight: 600 }}>{label}</span>
      </div>
      {sub && <div style={{ fontSize: 11.5, color: T.textFaint, marginBottom: 8, marginTop: -2, lineHeight: 1.5 }}>{sub}</div>}
      <div style={{ position: "relative", background: "#0E0720", borderRadius: 14, padding: "18px 16px 16px", border: `1px solid ${T.cardLine}` }}>
        <button
          onClick={() => { copyText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
          style={{ position: "absolute", top: 12, right: 12, fontFamily: T.mono, fontSize: 10, fontWeight: 700, background: copied ? T.cyan : "rgba(255,255,255,0.08)", color: copied ? T.bg : T.text, border: "none", padding: "7px 12px", borderRadius: 8, cursor: "pointer", transition: "all .15s" }}
        >{copied ? "복사됨 ✓" : "복사"}</button>
        <pre style={{ fontFamily: T.mono, fontSize: 13, lineHeight: 1.7, color: "#E9DEFF", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, paddingRight: 60 }}>{text}</pre>
        {negative && (
          <div style={{ color: "#FF7BB0", fontSize: 11.5, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.cardLine}`, fontFamily: T.mono, lineHeight: 1.5 }}>
            <b style={{ color: T.magenta }}>제외</b> {negative}
          </div>
        )}
      </div>
    </div>
  );
}

function TrendCard({ p }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const toolLabel = (TOOLS[p.tool] && (TOOLS[p.tool].full || TOOLS[p.tool].label)) || p.tool;
  return (
    <div style={{ background: T.card, border: `1px solid ${T.cardLine}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{p.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{p.title}</span>
            {p.hot && <span style={{ fontSize: 9, fontWeight: 700, fontFamily: T.mono, background: "rgba(255,46,151,0.15)", color: T.magenta, padding: "2px 6px", borderRadius: 20, border: `1px solid rgba(255,46,151,0.3)` }}>HOT</span>}
          </div>
          <div style={{ fontSize: 12.5, color: T.textDim, marginTop: 3, lineHeight: 1.5 }}>{p.desc}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, background: T.bg2, padding: "4px 9px", borderRadius: 20, border: `1px solid ${T.cardLine}` }}>{p.cat}</span>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.cyan, background: "rgba(0,229,212,0.08)", padding: "4px 9px", borderRadius: 20, border: `1px solid rgba(0,229,212,0.2)` }}>추천: {toolLabel}</span>
      </div>
      {open && (
        <div style={{ background: "#0E0720", borderRadius: 12, padding: "12px 13px", border: `1px solid ${T.cardLine}` }}>
          <pre onClick={(e) => { const r = document.createRange(); r.selectNodeContents(e.currentTarget); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }} style={{ fontFamily: T.mono, fontSize: 11.5, lineHeight: 1.6, color: "#E9DEFF", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, cursor: "text" }}>{p.prompt}</pre>
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setOpen(!open)} style={{ flex: 1, fontSize: 12.5, fontWeight: 600, padding: "9px 0", borderRadius: 9, border: `1px solid ${T.cardLine}`, background: "transparent", color: T.textDim, cursor: "pointer" }}>
          {open ? "접기" : "프롬프트 보기"}
        </button>
        <button onClick={() => { copyText(p.prompt); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
          style={{ flex: 1, fontSize: 12.5, fontWeight: 700, padding: "9px 0", borderRadius: 9, border: "none", background: copied ? T.cyan : T.spectrum, color: copied ? T.bg : "#fff", cursor: "pointer" }}>
          {copied ? "복사됨 ✓" : "복사하기"}
        </button>
      </div>
    </div>
  );
}

function TrendList({ cat, setCat }) {
  const list = cat === "전체" ? PRESETS : PRESETS.filter((p) => p.cat === cat);
  return (
    <div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
        {PRESET_CATS.map((c) => (
          <span key={c} onClick={() => setCat(c)} style={{
            fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: 20, cursor: "pointer",
            border: `1px solid ${cat === c ? "transparent" : T.cardLine}`,
            background: cat === c ? T.spectrum : "transparent", color: cat === c ? "#fff" : T.textDim,
          }}>{c}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
        {list.map((p) => <TrendCard key={p.id} p={p} />)}
      </div>
      <p style={{ fontSize: 11.5, color: T.textFaint, marginTop: 20, textAlign: "center", lineHeight: 1.7 }}>
        프롬프트의 <b style={{ color: T.textDim }}>[첨부사진]</b>을 본인 사진으로 바꾸거나, 추천 툴에 사진과 함께 넣으세요.<br />
        매주 새로운 트렌드가 업데이트됩니다 🔥
      </p>
    </div>
  );
}

export default function PromptLens() {
  const [onboard, setOnboard] = useState(true);
  const [mode, setMode] = useState("trend");
  const [presetCat, setPresetCat] = useState("전체");
  const [tool, setTool] = useState("midjourney");
  const [videoTool, setVideoTool] = useState("sora");
  const [single, setSingle] = useState(null);
  const [before, setBefore] = useState(null);
  const [after, setAfter] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  // 만들기 탭 상태
  const [makeTool, setMakeTool] = useState("nano");
  const [makeDesc, setMakeDesc] = useState("");
  const [makePhoto, setMakePhoto] = useState(null);
  const [makeLoading, setMakeLoading] = useState(false);
  const [makeResult, setMakeResult] = useState(null);
  const [makeError, setMakeError] = useState(null);
  const makeFileRef = useRef();

  const ready = mode === "single" ? !!single : mode === "ba" ? !!before && !!after : !!video;

  async function handleFile(file, setter) {
    try { setter(await downscale(file)); setError(null); }
    catch { setError("이미지를 읽지 못했어요. 다른 파일로 시도해주세요."); }
  }

  async function handleVideo(file) {
    setError(null); setNotice(null); setResult(null); setVideo(null); setVideoLoading(true);
    try {
      const { frames, preview } = await extractFrames(file, 5);
      if (!frames.length) throw new Error("VIDEO: 프레임을 추출하지 못했어요.");
      setVideo({ frames, preview, name: file.name });
    } catch (err) {
      setError(err.message.replace(/^VIDEO:\s*/, ""));
    }
    setVideoLoading(false);
  }

  async function analyze(isRetool, forceTool) {
    const useTool = forceTool || tool;
    setLoading(true); setError(null); setNotice(null); if (!isRetool) setResult(null);
    let content, sys;
    if (mode === "single") {
      sys = `You are an expert AI-image prompt reverse-engineer. Given an uploaded image, decide what kind of analysis it needs and respond accordingly.

STEP 1 — Detect a BEFORE/AFTER edit showcase FIRST (before judging suitability). Look carefully for these signals, which mean this is an AI EDIT showcase even if the main image looks like a totally natural real photo:
- a small inset photo highlighted by a bright/neon (yellow-green) border placed over a larger image (the small inset = original, the larger = AI-edited result)
- explicit text labels: "Before"/"After"/"원본"/"[Before]"/"[After]"
- a top/bottom or left/right split showing the same subject in two states
- a caption mentioning a "프롬프트"/"AI"/"보정"/"변환" edit
IMPORTANT: if ANY of these signals exist, this IS a valid AI edit showcase — do NOT reject it as "just a real selfie", even if the transformation is subtle/natural-looking (e.g. "natural candid selfie" filters). Skip STEP 2 and respond in EMBEDDED-BA format:
{"mode":"ba","detected":"한 장 안에서 비포/애프터를 찾았어요","scope":"<무엇이 유지되고 무엇이 바뀌었는지. 자연스러운 보정이면 'AI 보정·셀카 감성 변환'처럼>","recommendedTool":"nano","recReason":"인물 사진의 자연스러운 보정·변환은 제미나이가 강해요","recConf":"high","changes":[{"what":"","detail":"","c":""}],"unchanged":"<face identity, pose>","recipe":"<REUSABLE for the user's OWN photo using placeholder [첨부사진]. If a person stays real while only the style/environment transforms, follow this structure: (1) core transformation (2) PRESERVE list: 얼굴·피부 질감·머리·눈·손·옷·신체비율·표정·포즈 (3) FORBID: 인물 정체성변경/과한 미화 금지 (4) what to transform (5) preserve composition·camera·lighting (6) quality guard: photorealistic, NO cartoon/toy/CGI look (7) aspect ratio. For natural-selfie-style edits, describe the grain/color/lighting/candid feel. Describe ONLY the transformation, NOT this example's subject. For ${TOOLS.nano.label}>","prompt":"<reproduce this exact result, same scope>","negative":"인물 얼굴·정체성 변경, 과도한 미화, 이목구비 왜곡"}
(Ignore app UI chrome: status bar, like/comment counts. The inset = original, the main = result.)

STEP 1.5 — Detect a GRID generation. If the image is a 2×2 / 3×3 / multi-panel grid showing the SAME person (or same concept) in different poses, outfits, or angles (e.g. a "#러블리프로필" profile-photo set, an editorial multi-shot grid), this is ONE generated result, NOT a collage of unrelated photos. Do NOT reject it. Treat it as a SINGLE-format analysis but make the prompt produce the same kind of grid. In that case, in the SINGLE format below: set subject to describe the person + "여러 컷 그리드", and write the final prompt to generate a multi-shot grid from the user's photo — e.g. "Create a [N]-shot lovely profile grid of [첨부사진]: same person and face across all shots, varied poses/outfits/angles per panel (describe each), soft beige studio background, K-beauty aesthetic, keep facial identity 100% consistent". Mark this by setting "grid":"<e.g. 2×2 러블리 프로필 4컷>".

STEP 2 — If NO before/after AND NO grid, judge suitability. NOT suitable ONLY if it is: a pure app/website/UI screenshot with no clear main image, a chart/document/text page, or an obvious unedited real-life photo with no AI involvement, OR a collage of clearly UNRELATED different photos/people. If NOT suitable, respond with ONLY: {"mode":"single","unsuitable":true,"reason":"<short Korean reason, e.g. 'AI 이미지가 안 보여요. AI로 만든 사진 한 장을 올려주세요.'>"}
A phone screenshot that contains a clear AI image inside IS suitable — ignore the app UI. A grid of the SAME person is suitable (see STEP 1.5).

For SINGLE format: Guess which AI tool made it:
- "midjourney": painterly aesthetic perfection, dramatic cinematic lighting, hyperreal finish
- "gpt": literal prompt-following, clean readable text/typography, flatter realism (DALL·E 3)
- "sd": specific checkpoint texture, anime/illustration styles, anatomy artifacts (most Korean anime-style generators are SD-based)
- "nano": Google Gemini / Nano Banana — accurate text rendering, photo-realistic edits, sparkle/diamond watermark
Give guessedTool, a short Korean reason, confidence. Then decompose: base every field on what's visible, confidence "high"/"mid", be specific not generic, estimate real aspect ratio.
Final prompt for the user-selected tool (${TOOLS[useTool].label}): ${TOOLS[useTool].guide}
Plus a negative prompt.
Respond with ONLY valid JSON, no markdown:
{"mode":"single","grid":"","guessedTool":"","guessReason":"","guessConf":"","subject":{"v":"","c":""},"style":{"v":"","c":""},"lighting":{"v":"","c":""},"composition":{"v":"","c":""},"color":{"v":"","c":""},"camera":{"v":"","c":""},"mood":{"v":"","c":""},"aspect":{"v":"","c":""},"prompt":"","negative":""}`;
      content = [{ type: "image", source: { type: "base64", media_type: single.mime, data: single.data } }, { type: "text", text: sys }];
    } else if (mode === "ba") {
      sys = `You are an expert AI-image editing reverse-engineer. BEFORE (original) and AFTER (edited) of the same subject.
Identify EXACTLY what changed to turn BEFORE into AFTER, and CRUCIALLY what was kept identical.

MOST IMPORTANT — selective transformation: Many viral edits change ONLY part of the image while keeping the rest photorealistic. Look carefully and determine the SCOPE of the change:
- Did the PERSON/subject stay photorealistic (real face, real skin) while only the BACKGROUND/environment was transformed (e.g. into LEGO bricks)? This is the most common and most desired case.
- Or was the WHOLE image transformed uniformly?
State this scope explicitly in "scope" and reflect it in BOTH prompts. If the person is kept real, the prompts MUST strongly instruct: keep the person/face/skin/hair/clothing 100% photorealistic and unchanged, transform ONLY the background/environment.

List changes (what + specific detail + confidence). Set "unchanged" to what must be preserved (face, skin, identity, pose, composition).

RECOMMEND the best tool (recommendedTool: midjourney/gpt/sd/nano), short Korean reason, confidence:
- "nano": Gemini/Nano Banana — best when you must KEEP the real person and edit only the background. Best for "transform my photo, keep me real".
- "midjourney": full uniform artistic transformations (whole image becomes a style)
- "gpt": edits needing text/precise instruction
- "sd": anime/illustration edits
For "keep person real + transform background" → strongly prefer nano.

Produce TWO prompts (both must respect the scope above).

For SELECTIVE transformations (person kept real + environment transformed), the "recipe" MUST follow this proven structure (adapt the style to whatever the AFTER shows — LEGO, claymation, anime background, etc.):
- Core: "transform ONLY the environment into [감지된 스타일], keep the human subject completely unchanged and photorealistic"
- PRESERVE list (be specific, list body parts): real face, skin texture, hair, eyes, hands, clothing, body proportions, expression, pose
- FORBID list (repeat the "don't touch the person" idea multiple ways): do not modify/stylize/beautify the person, do not turn the human into [스타일], do not change identity
- TRANSFORM list (list environment elements): ground, trees, grass, rocks, water, buildings, background objects, textures
- Conditional: if water exists → [스타일] 버전으로, if fog/smoke exists → translucent version
- Preserve composition, camera angle, perspective, framing, lighting direction, atmosphere
- Blend the real person naturally into the transformed environment
- Quality guard: photorealistic, cinematic, shallow depth of field; NO cartoon / childish / simplified / animated / fake-CGI look
- End with aspect ratio
Use placeholder [첨부사진] for the user's photo. Do NOT mention this example's specific subject. Write it for ${TOOLS[useTool].label}.

1. "recipe" — REUSABLE for the user's OWN photo, following the structure above.
2. "prompt" — reproduce THIS exact result (you may name the specific subject), same scope and structure.

Negative prompt: artifacts to avoid (changing the person's face/identity, plastic skin on the person, distorted features, cartoon/toy look).
Respond with ONLY valid JSON, no markdown:
{"mode":"ba","scope":"","recommendedTool":"","recReason":"","recConf":"","changes":[{"what":"","detail":"","c":""}],"unchanged":"","recipe":"","prompt":"","negative":""}`;
      content = [
        { type: "text", text: "BEFORE (original):" }, { type: "image", source: { type: "base64", media_type: before.mime, data: before.data } },
        { type: "text", text: "AFTER (target):" }, { type: "image", source: { type: "base64", media_type: after.mime, data: after.data } },
        { type: "text", text: sys },
      ];
    } else {
      // 영상: 균등 간격 프레임들을 순서대로 보여주고 "룩" 분석
      sys = `You are an expert AI-video prompt reverse-engineer. The images below are ${video.frames.length} frames sampled in order (start → end) from a short video.

Analyze the overall LOOK of the video (this is a look/style analysis, motion is inferred only loosely from frame differences). Decompose, each field with confidence ("high" if clearly visible across frames, "mid" if inferred):
- subject: main subject/scene
- style: visual style (cinematic, anime, 3D, realistic...)
- lighting, color: grading and palette
- motion: what movement you can infer between frames (camera move, subject action) — be honest, mark "mid" if uncertain
- camera: shot type / angle
- mood, aspect

Then write a video prompt for ${VIDEO_TOOLS[videoTool].label}: ${VIDEO_TOOLS[videoTool].guide}

Respond with ONLY valid JSON, no markdown:
{"mode":"video","subject":{"v":"","c":""},"style":{"v":"","c":""},"lighting":{"v":"","c":""},"color":{"v":"","c":""},"motion":{"v":"","c":""},"camera":{"v":"","c":""},"mood":{"v":"","c":""},"aspect":{"v":"","c":""},"prompt":""}`;
      content = [{ type: "text", text: `${video.frames.length} frames in order:` }];
      video.frames.forEach((f) => content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: f } }));
      content.push({ type: "text", text: sys });
    }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content }] }),
      });
      if (!res.ok) {
        const code = res.status;
        if (code === 401 || code === 403) throw new Error("AUTH: 인증 문제예요. 이 앱은 Claude.ai의 Artifacts 패널 안에서만 분석이 작동해요.");
        if (code === 429) throw new Error("RATE: 요청이 잠깐 몰렸어요. 잠시 후 다시 눌러주세요.");
        if (code === 413) throw new Error("SIZE: 이미지가 너무 커요. 더 작은 사진으로 시도해주세요.");
        throw new Error("HTTP " + code + ": 서버 응답에 문제가 있어요. 다시 시도해주세요.");
      }
      const data = await res.json();
      if (data.error) throw new Error("API: " + (data.error.message || "응답 오류") + " — 다시 시도해주세요.");
      let txt = (data.content || []).map((i) => i.text || "").join("\n").replace(/```json|```/g, "").trim();
      if (!txt) throw new Error("EMPTY: 빈 응답이 왔어요. 한 번 더 눌러주세요.");
      const s = txt.indexOf("{");
      if (s !== -1) txt = txt.slice(s);
      const e = txt.lastIndexOf("}");
      if (e !== -1) txt = txt.slice(0, e + 1);

      let parsed;
      try {
        parsed = JSON.parse(txt);
      } catch {
        // 잘린 JSON 복구 시도: 열린 문자열/괄호를 닫아본다
        let fixed = txt.replace(/,\s*$/, "");
        // 끝이 따옴표 안에서 잘렸으면 닫기
        const quotes = (fixed.match(/"/g) || []).length;
        if (quotes % 2 === 1) fixed += '"';
        // 괄호 균형 맞추기
        const opens = (fixed.match(/\{/g) || []).length, closes = (fixed.match(/\}/g) || []).length;
        const arrOpens = (fixed.match(/\[/g) || []).length, arrCloses = (fixed.match(/\]/g) || []).length;
        for (let i = 0; i < arrOpens - arrCloses; i++) fixed += "]";
        for (let i = 0; i < opens - closes; i++) fixed += "}";
        try {
          parsed = JSON.parse(fixed);
        } catch {
          const truncated = data.stop_reason === "max_tokens";
          throw new Error(truncated
            ? "LONG: 분석 내용이 길어 응답이 잘렸어요. 한 번 더 시도하거나, 더 단순한 이미지로 해보세요."
            : "PARSE: 분석 결과 형식이 깨졌어요. 한 번 더 시도하면 보통 해결돼요.");
        }
      }

      // 부적합 이미지 → 에러가 아니라 친절한 안내
      if (parsed.unsuitable) {
        setNotice(parsed.reason || "이 이미지는 분석하기 어려워요. 분석할 AI 이미지 한 장만 올려주세요.");
        setLoading(false);
        return;
      }

      // 재분석(툴 전환)이면 이전 추정/추천 정보를 유지
      if (isRetool && result) {
        parsed.guessedTool = result.guessedTool;
        parsed.guessReason = result.guessReason;
        parsed.guessConf = result.guessConf;
        parsed.recommendedTool = result.recommendedTool;
        parsed.recReason = result.recReason;
        parsed.recConf = result.recConf;
      }
      setResult(parsed);
      if (!isRetool && parsed.mode === "single" && parsed.guessedTool && TOOLS[parsed.guessedTool]) {
        setTool(parsed.guessedTool);
      }
      if (!isRetool && parsed.mode === "ba" && parsed.recommendedTool && TOOLS[parsed.recommendedTool]) {
        setTool(parsed.recommendedTool);
      }
    } catch (err) {
      // 네트워크 자체가 끊긴 경우(fetch 실패)는 메시지가 "Failed to fetch"
      if (/failed to fetch|networkerror/i.test(err.message)) {
        setError("연결에 실패했어요. 이 앱은 Claude.ai의 Artifacts 패널 안에서만 분석이 작동해요. (네트워크 또는 인증 문제)");
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
  }

  const wrap = { fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Apple SD Gothic Neo','Malgun Gothic',sans-serif", background: T.bg, minHeight: "100%", color: T.text };

  // ── 온보딩 화면 ──
  if (onboard) {
    return (
      <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, minHeight: 560 }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}><Logo size={34} /></div>
          <div style={{
            width: 130, height: 130, margin: "0 auto 28px", borderRadius: 28, background: T.spectrum,
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(123,47,247,0.4)",
          }}>
            <div style={{ position: "absolute", inset: 4, borderRadius: 24, background: T.bg2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 52 }}>🔍</span>
            </div>
          </div>
          <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.25, margin: "0 0 14px" }}>
            그 사진, 어떻게 만들었지?<br />
            <span style={{ background: T.spectrum, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>프롬프트로 되돌려드려요</span>
          </h1>
          <p style={{ fontSize: 14.5, color: T.textDim, lineHeight: 1.7, margin: "0 0 32px" }}>
            인스타에서 본 AI 사진을 올리면<br />똑같이 만들 수 있는 프롬프트를 분석해줘요.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, textAlign: "left" }}>
            {[
              ["🔥", "요즘 핫한 프롬프트 모아보기 (트렌드)"],
              ["🎯", "사진 한 장 → 미드저니·GPT·SD·제미나이 프롬프트"],
              ["✨", "비포/애프터 → 보정·편집 프롬프트까지"],
            ].map(([emoji, txt], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: T.card, border: `1px solid ${T.cardLine}`, borderRadius: 14, padding: "14px 16px" }}>
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{txt}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setOnboard(false)} style={{
            width: "100%", padding: 16, background: T.spectrum, color: "#fff", border: "none", borderRadius: 14,
            fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 30px rgba(255,46,151,0.35)",
          }}>시작하기</button>
        </div>
      </div>
    );
  }

  async function analyzeMake() {
    if (!makeDesc.trim()) return;
    setMakeLoading(true); setMakeError(null); setMakeResult(null);
    const toolGuides = {
      nano: "Google Gemini / Nano Banana — natural-language editing or generation instruction, specific about subject, style, composition, and what to preserve if a photo is attached.",
      gpt: "DALL·E 3 / ChatGPT — rich natural-language paragraph, vivid and specific, full sentences.",
      midjourney: "Midjourney v6 — subject → style → lighting → mood, end with --ar and --style raw.",
      sd: "Stable Diffusion — comma-separated weighted tags ordered by importance, (key:1.2) emphasis.",
    };
    const content = [];
    if (makePhoto) {
      content.push({ type: "image", source: { type: "base64", media_type: makePhoto.mime, data: makePhoto.data } });
    }
    const sys = `You are an expert AI image prompt engineer. The user wants to create or transform an image. Your job: write the best possible prompt for their chosen tool.

User's request (Korean): "${makeDesc}"
Target tool: ${makeTool} — ${toolGuides[makeTool]}
${makePhoto ? "A reference photo is attached. If the user wants to transform their own photo, incorporate it into the prompt." : "No photo attached — generate from scratch."}

Analyze what the user wants, identify the style/mood/subject, and write an optimized prompt.
Also suggest: which other tools might work well, and any tips.

Respond with ONLY valid JSON, no markdown:
{"prompt":"<optimized prompt>","tips":"<short Korean tip 1-2 sentences>","altTools":[{"tool":"","reason":""}]}`;
    content.push({ type: "text", text: sys });
    try {
      const res = await fetch("https://promptlens-api.jaed-prompt.workers.dev", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1500, messages: [{ role: "user", content }] }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      let txt = (data.content || []).map((i) => i.text || "").join("\n").replace(/```json|```/g, "").trim();
      const s = txt.indexOf("{"), e = txt.lastIndexOf("}");
      if (s !== -1 && e !== -1) txt = txt.slice(s, e + 1);
      setMakeResult(JSON.parse(txt));
    } catch (err) {
      setMakeError("생성에 실패했어요. 다시 시도해주세요.");
    }
    setMakeLoading(false);
  }

  // ── 메인 화면 ──
  const tabBtn = (active) => ({
    flex: 1, fontSize: 13.5, fontWeight: 700, padding: "11px 0", cursor: "pointer", border: "none", borderRadius: 10,
    background: active ? "rgba(255,255,255,0.07)" : "transparent", color: active ? T.text : T.textFaint, transition: "all .15s",
  });
  const toolBtn = (active) => ({
    fontFamily: T.mono, fontSize: 12.5, fontWeight: 600, padding: "9px 15px", borderRadius: 10, cursor: "pointer",
    border: `1px solid ${active ? "transparent" : T.cardLine}`, background: active ? T.spectrum : "transparent",
    color: active ? "#fff" : T.textDim, transition: "all .15s",
  });

  return (
    <div style={wrap}>
      <style>{`@keyframes scan{0%{top:0;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:100%;opacity:0}}@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 18px 60px" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${T.cardLine}` }}>
          <Logo size={24} />
          <button onClick={() => { setOnboard(true); }} style={{ background: "none", border: `1px solid ${T.cardLine}`, color: T.textDim, fontSize: 12, padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontWeight: 600 }}>
            소개
          </button>
        </div>

        {/* 모드 탭 */}
        <div style={{ display: "flex", gap: 4, background: T.bg2, borderRadius: 13, padding: 4, marginBottom: 8, border: `1px solid ${T.cardLine}` }}>
          {[["trend", "🔥 트렌드"], ["single", "단일"], ["ba", "비포/애프터"], ["video", "영상"], ["make", "✨ 만들기"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setError(null); setNotice(null); }} style={tabBtn(mode === m)}>{label}</button>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: T.textFaint, margin: "0 0 18px", paddingLeft: 4 }}>
          {mode === "trend" ? "요즘 핫한 변환 프롬프트를 골라 내 사진에 바로 적용하세요"
            : mode === "single" ? "결과 한 장 → 처음부터 만드는 프롬프트"
            : mode === "ba" ? "원본 + 결과 → 무엇을 어떻게 바꿨는지"
            : mode === "make" ? "원하는 걸 말하면 → 최적화된 프롬프트를 만들어드려요"
            : "영상 → 비주얼 룩을 분석해 영상 프롬프트로 (베타)"}
        </p>

        {mode === "trend" && <TrendList cat={presetCat} setCat={setPresetCat} />}

        {mode === "make" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* 왼쪽: 입력 */}
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, marginBottom: 8, fontWeight: 600 }}>어떤 이미지를 만들고 싶어요?</div>
              <textarea
                value={makeDesc}
                onChange={(e) => setMakeDesc(e.target.value)}
                placeholder={"예시:\n• 요즘 인스타에서 핫한 느낌으로 만들고 싶어\n• 내 사진을 프로필용으로 예쁘게 바꿔줘\n• 아기 사진을 동화 그림책 스타일로\n• 친구랑 찍은 사진을 영화 포스터처럼\n• 음식 사진을 감성있게 바꾸고 싶어"}
                style={{ width: "100%", minHeight: 140, background: T.bg2, border: `1px solid ${T.cardLine}`, borderRadius: 12, padding: "14px", color: T.text, fontSize: 14, lineHeight: 1.7, resize: "vertical", fontFamily: "inherit", outline: "none" }}
              />

              <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, margin: "16px 0 8px", fontWeight: 600 }}>사진 첨부 (선택)</div>
              <div
                onClick={() => makeFileRef.current.click()}
                style={{ border: makePhoto ? `1px solid ${T.cardLine}` : `2px dashed ${T.cardLine}`, borderRadius: 12, background: T.bg2, padding: makePhoto ? 8 : "20px", textAlign: "center", cursor: "pointer" }}
              >
                {makePhoto
                  ? <img src={makePhoto.preview} alt="" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 8, display: "block", margin: "0 auto" }} />
                  : <div style={{ color: T.textFaint, fontSize: 13 }}>📎 내 사진 첨부 (변환할 때 참고해요)</div>
                }
              </div>
              <input ref={makeFileRef} type="file" accept="image/*" hidden onChange={async (e) => { if (e.target.files[0]) { const out = await downscale(e.target.files[0]); setMakePhoto({ ...out, preview: "data:image/jpeg;base64," + out.data }); }}} />

              <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, margin: "16px 0 8px", fontWeight: 600 }}>어떤 툴 기준으로?</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {Object.entries(TOOLS).map(([k, v]) => (
                  <span key={k} onClick={() => setMakeTool(k)} style={{ ...toolBtn(makeTool === k) }}>{v.label}</span>
                ))}
              </div>

              <button onClick={analyzeMake} disabled={!makeDesc.trim() || makeLoading}
                style={{ width: "100%", marginTop: 18, padding: 15, border: "none", borderRadius: 14, fontSize: 15.5, fontWeight: 700, cursor: makeDesc.trim() && !makeLoading ? "pointer" : "not-allowed", background: makeDesc.trim() && !makeLoading ? T.spectrum : T.card, color: makeDesc.trim() && !makeLoading ? "#fff" : T.textFaint, boxShadow: makeDesc.trim() && !makeLoading ? "0 8px 26px rgba(255,46,151,0.3)" : "none" }}>
                {makeLoading ? "프롬프트 만드는 중…" : "프롬프트 만들기 ✨"}
              </button>
            </div>

            {/* 오른쪽: 결과 */}
            <div style={{ background: T.card, border: `1px solid ${T.cardLine}`, borderRadius: 18, padding: 18, minHeight: 320 }}>
              {makeError && <div style={{ background: "rgba(255,46,151,0.1)", border: `1px solid ${T.magenta}`, color: "#FF9CC4", padding: "13px 15px", borderRadius: 12, fontSize: 13 }}>{makeError}</div>}
              {!makeResult && !makeError && !makeLoading && (
                <div style={{ color: T.textFaint, fontSize: 13, textAlign: "center", padding: "70px 16px", lineHeight: 1.8 }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>✨</div>
                  원하는 걸 왼쪽에 입력하면<br />최적화된 프롬프트를 만들어드려요
                </div>
              )}
              {makeLoading && (
                <div style={{ color: T.textDim, fontSize: 13, textAlign: "center", padding: "70px 16px", fontFamily: T.mono }}>
                  원하는 스타일을 분석하는 중…
                </div>
              )}
              {makeResult && (
                <>
                  <PromptCard label={`✨ ${TOOLS[makeTool].label} 프롬프트`} text={makeResult.prompt} accent={T.cyan} />
                  {makeResult.tips && (
                    <div style={{ marginTop: 16, padding: "12px 14px", background: T.bg2, borderRadius: 12, border: `1px solid ${T.cardLine}` }}>
                      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.amber, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 5 }}>💡 팁</div>
                      <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>{makeResult.tips}</div>
                    </div>
                  )}
                  {makeResult.altTools && makeResult.altTools.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>다른 툴도 잘 어울려요</div>
                      {makeResult.altTools.map((a, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px dashed ${T.cardLine}`, fontSize: 13 }}>
                          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.cyan, flexShrink: 0 }}>{TOOLS[a.tool]?.label || a.tool}</span>
                          <span style={{ color: T.textDim }}>{a.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {mode !== "trend" && mode !== "make" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* 왼쪽: 입력 */}
          <div>
            {mode === "single" && (
              <Drop big image={single?.preview} onFile={(f) => handleFile(f, setSingle)} />
            )}
            {mode === "ba" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Drop label="Before · 원본" compact image={before?.preview} onFile={(f) => handleFile(f, setBefore)} />
                  <Drop label="After · 목표" compact image={after?.preview} onFile={(f) => handleFile(f, setAfter)} />
                </div>
                <p style={{ fontSize: 11.5, color: T.textFaint, marginTop: 10, lineHeight: 1.5 }}>
                  좌우 붙은 한 장이면 <b style={{ color: T.textDim }}>단일 이미지</b>에 올려도 자동 인식해요.
                </p>
              </>
            )}
            {mode === "video" && (
              <VideoDrop video={video} loading={videoLoading} onFile={handleVideo} />
            )}

            {mode === "video" && (
              <>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, margin: "20px 0 10px", fontWeight: 600 }}>
                  어떤 영상 툴로 만들까요
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {Object.entries(VIDEO_TOOLS).map(([k, v]) => (
                    <span key={k} onClick={() => setVideoTool(k)} style={toolBtn(videoTool === k)}>{v.label}</span>
                  ))}
                </div>
              </>
            )}
            {mode === "single" && (
              <p style={{ fontSize: 12, color: T.textFaint, margin: "18px 0 0", lineHeight: 1.6 }}>
                어떤 툴로 만들어졌는지 <b style={{ color: T.textDim }}>분석이 알아서 추정</b>하고, 그 툴 프롬프트를 먼저 보여줘요. 다른 툴은 결과에서 바꿔볼 수 있어요.
              </p>
            )}
            {mode === "ba" && (
              <p style={{ fontSize: 12, color: T.textFaint, margin: "18px 0 0", lineHeight: 1.6 }}>
                이 편집에 <b style={{ color: T.textDim }}>어떤 툴이 적합한지 분석이 추천</b>하고, 그 툴 편집 프롬프트를 먼저 보여줘요. 다른 툴은 결과에서 바꿔볼 수 있어요.
              </p>
            )}

            <button onClick={analyze} disabled={!ready || loading} style={{
              width: "100%", marginTop: 18, padding: 15, border: "none", borderRadius: 14, fontSize: 15.5, fontWeight: 700,
              cursor: ready && !loading ? "pointer" : "not-allowed",
              background: ready && !loading ? T.spectrum : T.card, color: ready && !loading ? "#fff" : T.textFaint,
              boxShadow: ready && !loading ? "0 8px 26px rgba(255,46,151,0.3)" : "none", transition: "all .15s",
            }}>
              {loading ? "분석 중…" : ready ? "프롬프트 분석하기 ✨" : mode === "video" ? "영상을 먼저 올려주세요" : "사진을 먼저 올려주세요"}
            </button>
          </div>

          {/* 오른쪽: 결과 */}
          <div style={{ background: T.card, border: `1px solid ${T.cardLine}`, borderRadius: 18, padding: 18, minHeight: 320 }}>
            {error && <div style={{ background: "rgba(255,46,151,0.1)", border: `1px solid ${T.magenta}`, color: "#FF9CC4", padding: "13px 15px", borderRadius: 12, fontSize: 13, lineHeight: 1.6 }}>{error}</div>}

            {notice && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 38, marginBottom: 14 }}>🖼️</div>
                <div style={{ fontSize: 14.5, color: T.text, fontWeight: 600, marginBottom: 8 }}>이 이미지는 분석하기 어려워요</div>
                <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>{notice}</div>
              </div>
            )}

            {!result && !error && !notice && !loading && (
              <div style={{ color: T.textFaint, fontSize: 13, textAlign: "center", padding: "70px 16px", lineHeight: 1.8 }}>
                <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.5 }}>🔍</div>
                사진을 올리고 분석하면<br />여기에 프롬프트가 나타나요
              </div>
            )}

            {loading && (
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 12, padding: "70px 16px", textAlign: "center" }}>
                <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: T.spectrum, animation: "scan 1.4s ease-in-out infinite", boxShadow: `0 0 12px ${T.magenta}` }} />
                <div style={{ color: T.textDim, fontSize: 13, fontFamily: T.mono, animation: "pulse 1.4s ease-in-out infinite" }}>
                  {mode === "single" ? "이미지를 분해하는 중…" : "두 사진을 비교하는 중…"}
                </div>
              </div>
            )}

            {result && result.mode === "single" && (
              <>
                {result.guessedTool && TOOLS[result.guessedTool] && (
                  <div style={{ marginBottom: 18, padding: "16px 16px", borderRadius: 14, background: "linear-gradient(135deg,rgba(255,46,151,0.12),rgba(0,229,212,0.1))", border: `1px solid ${T.cardLine}` }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, marginBottom: 7 }}>이 사진, 아마도</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 22, fontWeight: 800, background: T.spectrum, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {TOOLS[result.guessedTool].full || TOOLS[result.guessedTool].label}
                      </span>
                      <span style={{ fontSize: 13, color: T.textDim }}>로 만든 것 같아요</span>
                      {result.guessConf && <Conf c={result.guessConf} />}
                    </div>
                    {result.guessReason && <div style={{ fontSize: 12.5, color: T.textDim, marginTop: 8, lineHeight: 1.6 }}>{result.guessReason}</div>}
                  </div>
                )}
                {result.grid && (
                  <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "rgba(123,47,247,0.12)", border: `1px solid rgba(123,47,247,0.35)`, fontSize: 12.5, color: "#C9A6FF", lineHeight: 1.5 }}>
                    🔲 {result.grid} — 내 사진 한 장으로 이런 여러 컷을 만드는 프롬프트예요
                  </div>
                )}
                <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, marginBottom: 4, fontWeight: 600 }}>구조 분해</div>
                {[["피사체", result.subject], ["스타일", result.style], ["조명", result.lighting], ["구도", result.composition], ["색감", result.color], ["카메라", result.camera], ["분위기", result.mood], ["비율", result.aspect]]
                  .filter((x) => x[1] && x[1].v).map((x, i) => <ResultRow key={i} k={x[0]} v={x[1].v} c={x[1].c} />)}
                <PromptCard label="복원된 프롬프트" text={result.prompt} negative={result.negative} />

                <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.cardLine}` }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, marginBottom: 9 }}>다른 툴로 보기</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {Object.entries(TOOLS).map(([k, v]) => {
                      const isGuess = result.guessedTool === k;
                      return (
                        <span key={k} onClick={() => { if (!loading && k !== tool) { setTool(k); analyze(true, k); } }}
                          style={{ ...toolBtn(tool === k), position: "relative", opacity: loading ? 0.5 : 1 }}>
                          {v.label}
                          {isGuess && <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: T.cyan, border: `2px solid ${T.bg}` }} />}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: T.textFaint, marginTop: 8 }}><span style={{ color: T.cyan }}>●</span> 추천 (추정된 툴)</div>
                </div>
              </>
            )}

            {result && result.mode === "ba" && (
              <>
                {result.detected && (
                  <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "rgba(123,47,247,0.12)", border: `1px solid rgba(123,47,247,0.35)`, fontSize: 12.5, color: "#C9A6FF", lineHeight: 1.5 }}>
                    ✨ {result.detected} — 자동으로 편집 분석으로 전환했어요
                  </div>
                )}
                {result.recommendedTool && TOOLS[result.recommendedTool] && (
                  <div style={{ marginBottom: 18, padding: "16px 16px", borderRadius: 14, background: "linear-gradient(135deg,rgba(255,46,151,0.12),rgba(0,229,212,0.1))", border: `1px solid ${T.cardLine}` }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, marginBottom: 7 }}>이 편집엔</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 22, fontWeight: 800, background: T.spectrum, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {TOOLS[result.recommendedTool].full || TOOLS[result.recommendedTool].label}
                      </span>
                      <span style={{ fontSize: 13, color: T.textDim }}>가 잘 어울려요</span>
                      {result.recConf && <Conf c={result.recConf} />}
                    </div>
                    {result.recReason && <div style={{ fontSize: 12.5, color: T.textDim, marginTop: 8, lineHeight: 1.6 }}>{result.recReason}</div>}
                  </div>
                )}
                {result.scope && (
                  <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: T.bg2, border: `1px solid ${T.cardLine}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14 }}>🎯</span>
                    <div>
                      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.cyan, letterSpacing: ".06em", textTransform: "uppercase" }}>변환 범위 </span>
                      <span style={{ fontSize: 12.5, color: T.text }}>{result.scope}</span>
                    </div>
                  </div>
                )}
                <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, marginBottom: 4, fontWeight: 600 }}>감지된 변화</div>
                {(result.changes || []).map((ch, i) => <ResultRow key={i} k={ch.what} v={ch.detail} c={ch.c} />)}
                {result.unchanged && (
                  <div style={{ marginTop: 14, padding: "12px 14px", background: T.bg2, borderRadius: 12, border: `1px solid ${T.cardLine}` }}>
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.cyan, letterSpacing: ".08em", textTransform: "uppercase" }}>유지됨 </span>
                    <span style={{ fontSize: 12.5, color: T.textDim }}>{result.unchanged}</span>
                  </div>
                )}
                <PromptCard label="🔁 변환 레시피 (내 사진에 적용)" sub="이 변환을 내 사진에 그대로 쓸 수 있어요. [첨부사진] 자리에 본인 사진을 넣으세요." text={result.recipe} negative={result.negative} accent={T.cyan} />
                <PromptCard label="📋 이 결과 그대로 만들기" sub="예시 사진 자체를 똑같이 재현하는 프롬프트예요." text={result.prompt} />

                <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.cardLine}` }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, marginBottom: 9 }}>다른 툴로 보기</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {Object.entries(TOOLS).map(([k, v]) => {
                      const isRec = result.recommendedTool === k;
                      return (
                        <span key={k} onClick={() => { if (!loading && k !== tool) { setTool(k); analyze(true, k); } }}
                          style={{ ...toolBtn(tool === k), position: "relative", opacity: loading ? 0.5 : 1 }}>
                          {v.label}
                          {isRec && <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: T.cyan, border: `2px solid ${T.bg}` }} />}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: T.textFaint, marginTop: 8 }}><span style={{ color: T.cyan }}>●</span> 추천 (이 편집에 적합한 툴)</div>
                </div>
              </>
            )}

            {result && result.mode === "video" && (
              <>
                <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "rgba(0,229,212,0.08)", border: `1px solid rgba(0,229,212,0.25)`, fontSize: 12, color: T.cyan, lineHeight: 1.5 }}>
                  베타 · 프레임 몇 장으로 분석해 움직임은 대략 추정해요
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.textDim, marginBottom: 4, fontWeight: 600 }}>영상 룩 분석</div>
                {[["피사체", result.subject], ["스타일", result.style], ["조명", result.lighting], ["색감", result.color], ["움직임", result.motion], ["카메라", result.camera], ["분위기", result.mood], ["비율", result.aspect]]
                  .filter((x) => x[1] && x[1].v).map((x, i) => <ResultRow key={i} k={x[0]} v={x[1].v} c={x[1].c} />)}
                <PromptCard label="영상 프롬프트" text={result.prompt} />
              </>
            )}
          </div>
        </div>
        )}

        {mode !== "trend" && (
        <p style={{ fontSize: 11.5, color: T.textFaint, marginTop: 26, textAlign: "center", lineHeight: 1.7 }}>
          원본 프롬프트를 100% 복원할 순 없어요. 비슷하게 만드는 프롬프트를 추정하고,<br />
          <span style={{ color: T.cyan }}>확실</span>은 그대로 · <span style={{ color: T.amber }}>추정</span>은 손보면 더 가까워져요.
        </p>
        )}
      </div>
    </div>
  );
}
