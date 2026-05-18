const works = [
  {
    title: "珍珠王座系列短片",
    titleEn: "Pearl Throne Short Series",
    category: "video",
    type: "AI影视短剧",
    cover: "assets/portfolio/pearl-throne-cover.jpg",
    video: "assets/portfolio/pearl-throne-preview.mp4",
    description: "从角色、场景到镜头氛围的 AIGC 短剧成片探索，适合展示叙事视觉和视频生成能力。",
    tags: ["AIGC视频", "剧情短片", "成片制作"],
  },
  {
    title: "海盗女王角色设定",
    titleEn: "Pirate Queen Character IP",
    category: "design",
    type: "角色IP与分镜",
    cover: "assets/portfolio/character-ip-cover.jpg",
    description: "围绕剧本角色进行形象设定、服化道方向和视觉气质统一，服务后续分镜与视频制作。",
    tags: ["角色设定", "服化道", "视觉统一"],
  },
  {
    title: "UV400墨镜详情视觉",
    titleEn: "UV400 Product Visual",
    category: "visual",
    type: "电商视觉",
    cover: "assets/portfolio/ecommerce-cover.jpg",
    description: "将产品卖点转译为清晰的电商视觉，兼顾模特展示、材质信息和页面首屏转化。",
    tags: ["电商详情", "产品卖点", "版式"],
  },
  {
    title: "CleanPaws DirtyPaws 品牌Logo",
    titleEn: "CleanPaws DirtyPaws Identity",
    category: "design",
    type: "Logo与品牌设计",
    cover: "assets/portfolio/brand-cover.jpg",
    description: "面向宠物清洁品牌的标志方向探索，用更轻松、可识别的视觉语言表达品牌记忆点。",
    tags: ["Logo", "品牌识别", "宠物品牌"],
  },
  {
    title: "幻想角色海报",
    titleEn: "Fantasy Character Poster",
    category: "visual",
    type: "漫画角色海报",
    cover: "assets/portfolio/poster-cover.jpg",
    description: "通过角色姿态、色彩和画面风格制造记忆点，展示 AI 图像生成与海报构图能力。",
    tags: ["角色海报", "AI绘图", "视觉风格"],
  },
  {
    title: "建筑环境空镜",
    titleEn: "Architectural Atmosphere Shots",
    category: "video",
    type: "建筑空镜素材",
    cover: "assets/portfolio/environment-cover.jpg",
    video: "assets/portfolio/environment-preview.mp4",
    description: "以住宅、街区、商业楼宇等空间画面建立场景氛围，可作为短剧和广告视频的环境镜头。",
    tags: ["环境镜头", "场景生成", "空间氛围"],
  },
];

const workGrid = document.querySelector("#workGrid");
const filterButtons = document.querySelectorAll(".filter-button");
const header = document.querySelector(".site-header");
const cursorBrush = document.querySelector(".cursor-brush");
const canvas = document.querySelector(".ambient-canvas");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 };
let dpr = 1;
let strokes = [];

function createWorkCard(work) {
  const article = document.createElement("article");
  article.className = "work-card paper-interactive";
  article.dataset.category = work.category;

  const media = work.video
    ? `<video src="${work.video}" poster="${work.cover}" muted loop playsinline preload="metadata"></video>`
    : `<img src="${work.cover}" alt="${work.title}" loading="lazy" />`;

  article.innerHTML = `
    <div class="work-media">
      ${media}
      <span class="work-type">${work.type}</span>
    </div>
    <div class="work-body">
      <h3>${work.title}</h3>
      <p class="work-title-en">${work.titleEn}</p>
      <p>${work.description}</p>
      <div class="work-meta">
        ${work.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
    </div>
  `;

  const video = article.querySelector("video");
  if (video) {
    article.addEventListener("mouseenter", () => video.play());
    article.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
    article.addEventListener("touchstart", () => video.play(), { passive: true });
  }

  return article;
}

function renderWorks() {
  works.forEach((work) => workGrid.appendChild(createWorkCard(work)));
}

function filterWorks(filter) {
  document.querySelectorAll(".work-card").forEach((card) => {
    const show = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !show);
  });
}

function setupPaperInteractions() {
  document.querySelectorAll(".paper-interactive, .process-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      if (prefersReducedMotion) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translate(${x * 7}px, ${y * 5}px) rotate(${x * 0.8}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  strokes = Array.from({ length: 22 }, (_, index) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    length: 18 + Math.random() * 52,
    drift: 0.18 + Math.random() * 0.45,
    angle: -0.5 + Math.random() * 1,
    color: index % 3 === 0 ? "#df775d" : index % 3 === 1 ? "#7e9a7d" : "#e9ad52",
    alpha: 0.12 + Math.random() * 0.16,
  }));
}

function drawAmbient() {
  if (prefersReducedMotion) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  strokes.forEach((stroke, index) => {
    const pullX = (pointer.x - window.innerWidth / 2) * stroke.drift * 0.02;
    const pullY = (pointer.y - window.innerHeight / 2) * stroke.drift * 0.015;
    const x = stroke.x + pullX;
    const y = stroke.y + pullY + Math.sin(Date.now() * 0.0006 + index) * 4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(stroke.angle);
    ctx.globalAlpha = stroke.alpha;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-stroke.length / 2, 0);
    ctx.quadraticCurveTo(0, -6, stroke.length / 2, 0);
    ctx.stroke();
    ctx.restore();
  });
  requestAnimationFrame(drawAmbient);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    filterWorks(button.dataset.filter);
  });
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 28);
});

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  cursorBrush.style.left = `${event.clientX}px`;
  cursorBrush.style.top = `${event.clientY}px`;

  if (prefersReducedMotion) return;
  document.querySelectorAll("[data-depth]").forEach((item) => {
    const depth = Number(item.dataset.depth);
    const x = (event.clientX - window.innerWidth / 2) * depth;
    const y = (event.clientY - window.innerHeight / 2) * depth;
    item.style.transform = `translate(${x}px, ${y}px)`;
  });
});

window.addEventListener("resize", resizeCanvas);

renderWorks();
setupPaperInteractions();
resizeCanvas();
drawAmbient();
