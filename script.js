const videoSeries = [
  {
    title: "狗狗短剧",
    titleEn: "Dog Story Series",
    category: "AIGC竖版短剧",
    description: "围绕狗狗角色关系与情绪场景展开，展示角色延续、镜头生成、剪辑节奏与成片组织能力。",
    meta: ["竖版成片", "角色IP", "剧情短剧", "含贺岁篇"],
    episodes: [
      { title: "第01集 开篇样片", src: "assets/full-videos/dog-story-ep01.mp4", poster: "assets/video-posters/dog-story-ep01.jpg", duration: "01:59" },
      { title: "第02集 键盘打字开场", src: "assets/full-videos/dog-story-ep02.mp4", poster: "assets/video-posters/dog-story-ep02.jpg", duration: "02:50" },
      { title: "第03集 夜晚木屋大狗登场", src: "assets/full-videos/dog-story-ep03.mp4", poster: "assets/video-posters/dog-story-ep03.jpg", duration: "02:25" },
      { title: "第04集 路灯下小狗对话", src: "assets/full-videos/dog-story-ep04.mp4", poster: "assets/video-posters/dog-story-ep04.jpg", duration: "02:33" },
      { title: "新年贺岁篇 雪夜方桌年味场景", src: "assets/full-videos/dog-story-new-year.mp4", poster: "assets/video-posters/dog-story-new-year.jpg", duration: "02:00" },
    ],
  },
  {
    title: "珍珠王座系列短片",
    titleEn: "Pearl Throne Short Series",
    category: "AIGC横版剧情短片",
    description: "横版叙事短片系列，重点呈现人物、场景氛围、镜头连续性与AI视频成片整合能力。",
    meta: ["横版成片", "人物叙事", "场景生成", "系列短片"],
    episodes: [
      { title: "第01集", src: "assets/full-videos/pearl-throne-ep01.mp4", poster: "assets/video-posters/pearl-throne-ep01.jpg", duration: "03:48" },
      { title: "第02集", src: "assets/full-videos/pearl-throne-ep02.mp4", poster: "assets/video-posters/pearl-throne-ep02.jpg", duration: "03:08" },
      { title: "第03集", src: "assets/full-videos/pearl-throne-ep03.mp4", poster: "assets/video-posters/pearl-throne-ep03.jpg", duration: "02:41" },
      { title: "第04集", src: "assets/full-videos/pearl-throne-ep04.mp4", poster: "assets/video-posters/pearl-throne-ep04.jpg", duration: "03:09" },
    ],
  },
];

const galleryTypeMap = [
  { test: /海盗女王|狗狗短剧.*设定板/, type: "character", label: "角色IP" },
  { test: /分镜|目录归档|珍珠王座_分镜/, type: "storyboard", label: "分镜" },
  { test: /墨镜|护肤|保温|T恤|LONIVE|志高/, type: "commerce", label: "电商视觉" },
  { test: /Logo|标题字|CleanPaws|挖掘机|校霸|CanineGazeTruth/, type: "brand", label: "品牌Logo" },
  { test: /电锯人|Kalista|幻想角色/, type: "poster", label: "漫画海报" },
];

const seriesGrid = document.querySelector("#seriesGrid");
const galleryGrid = document.querySelector("#galleryGrid");
const filterButtons = document.querySelectorAll(".filter-button");
const header = document.querySelector(".site-header");
const cursorBrush = document.querySelector(".cursor-brush");
const canvas = document.querySelector(".ambient-canvas");
const ctx = canvas.getContext("2d");
const modal = document.querySelector("#mediaModal");
const modalContent = document.querySelector("#modalContent");
const modalCaption = document.querySelector("#modalCaption");
const closeModalButton = document.querySelector(".modal-close");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 };
let dpr = 1;
let strokes = [];

function galleryMeta(item) {
  const match = galleryTypeMap.find((entry) => entry.test.test(item.title));
  return match || { type: "poster", label: "视觉作品" };
}

function renderVideoSeries() {
  videoSeries.forEach((series) => {
    const article = document.createElement("article");
    article.className = "series-card paper-interactive";
    article.innerHTML = `
      <div class="series-copy">
        <span class="work-type">${series.category}</span>
        <h3>${series.title}</h3>
        <p class="work-title-en">${series.titleEn}</p>
        <p>${series.description}</p>
        <div class="work-meta">
          ${series.meta.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
      </div>
      <div class="episode-grid">
        ${series.episodes
          .map(
            (episode, index) => `
              <button class="episode-card" type="button" data-src="${episode.src}" data-poster="${episode.poster}" data-title="${series.title} · ${episode.title}">
                <span class="episode-number">${String(index + 1).padStart(2, "0")}</span>
                <img src="${episode.poster}" alt="${episode.title}" loading="lazy" />
                <span class="episode-title">${episode.title}</span>
                <span class="episode-duration">${episode.duration}</span>
              </button>
            `
          )
          .join("")}
      </div>
    `;
    seriesGrid.appendChild(article);
  });

  document.querySelectorAll(".episode-card").forEach((button) => {
    button.addEventListener("click", () => {
      openVideo(button.dataset.src, button.dataset.poster, button.dataset.title);
    });
  });
}

function renderGallery(items) {
  galleryGrid.innerHTML = "";
  items.forEach((item) => {
    const meta = galleryMeta(item);
    const card = document.createElement("button");
    card.className = "gallery-card paper-interactive";
    card.type = "button";
    card.dataset.category = meta.type;
    card.innerHTML = `
      <img src="${item.file}" alt="${item.title}" loading="lazy" />
      <span class="gallery-label">${meta.label}</span>
      <strong>${item.title}</strong>
    `;
    card.addEventListener("click", () => openImage(item.file, item.title, meta.label));
    galleryGrid.appendChild(card);
  });
}

function openVideo(src, poster, title) {
  modalContent.innerHTML = `<video src="${src}" poster="${poster}" controls autoplay playsinline preload="metadata"></video>`;
  modalCaption.textContent = `${title} / 完整视频，保持原始画面比例播放`;
  modal.showModal();
}

function openImage(src, title, label) {
  modalContent.innerHTML = `<img src="${src}" alt="${title}" />`;
  modalCaption.textContent = `${label} / ${title}`;
  modal.showModal();
}

function closeModal() {
  const video = modalContent.querySelector("video");
  if (video) video.pause();
  modal.close();
  modalContent.innerHTML = "";
}

function filterGallery(filter) {
  document.querySelectorAll(".gallery-card").forEach((card) => {
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
      card.style.transform = `translate(${x * 7}px, ${y * 5}px) rotate(${x * 0.65}deg)`;
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
    filterGallery(button.dataset.filter);
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

closeModalButton.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.open) closeModal();
});
window.addEventListener("resize", resizeCanvas);

renderVideoSeries();
fetch("assets/gallery-manifest.json")
  .then((response) => response.json())
  .then((items) => {
    renderGallery(items);
    setupPaperInteractions();
  });
resizeCanvas();
drawAmbient();
