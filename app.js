// Список возможных призов (все, что на колесе)
const prizes = [
  "Скидка 10%",
  "Скидка 20%",
  "Скидка 500₽",
  "Скидка 1000₽",
  "Плёнка",
  "Заживляющий бокс",
  "Обезбол",
  "Индивидуальный эскиз",
  "Мини-тату",
];

// Эти призы нарисованы, но НИКОГДА не выпадают
const blockedPrizes = ["Скидка 1000₽", "Мини-тату"];

// DOM элементы
const pagePlay = document.getElementById("page-play");
const pageMe = document.getElementById("page-me");

const tabPlay = document.getElementById("tab-play");
const tabMe = document.getElementById("tab-me");

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const spinInfo = document.getElementById("spinInfo");
const prizesList = document.getElementById("prizesList");

// === Навигация между Play и Me ===
tabPlay.addEventListener("click", () => {
  pagePlay.classList.add("active");
  pageMe.classList.remove("active");
  tabPlay.classList.add("active");
  tabMe.classList.remove("active");
});

tabMe.addEventListener("click", () => {
  pageMe.classList.add("active");
  pagePlay.classList.remove("active");
  tabMe.classList.add("active");
  tabPlay.classList.remove("active");
  renderPrizes();
});

// === Подписи по кругу с помощью математики ===
function createWheelLabels() {
  const count = prizes.length;
  const angleStep = 360 / count;

  const centerX = wheel.clientWidth / 2;  // 130
  const centerY = wheel.clientHeight / 2; // 130
  const radius = centerX - 35;            // чуть внутри внешнего контура

  prizes.forEach((prize, i) => {
    const label = document.createElement("div");
    label.className = "sector-label";
    label.innerText = prize;

    // угол центра сектора: 0° — сверху, по часовой
    const angleDeg = -90 + angleStep * i + angleStep / 2;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x = centerX + Math.cos(angleRad) * radius;
    const y = centerY + Math.sin(angleRad) * radius;

    label.style.left = `${x}px`;
    label.style.top = `${y}px`;

    // разворачиваем текст вдоль радиуса (как на твоём примере)
    label.style.transform = `translate(-50%, -50%) rotate(${angleDeg + 90}deg)`;

    wheel.appendChild(label);
  });
}

// === Работа с localStorage ===
function getUserData() {
  const raw = localStorage.getItem("tattooWheelUser");
  if (!raw) {
    return {
      prizes: {}, // { "Скидка 10%": 1, ... }
      lastSpinAt: null,
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      prizes: {},
      lastSpinAt: null,
    };
  }
}

function saveUserData(data) {
  localStorage.setItem("tattooWheelUser", JSON.stringify(data));
}

// === Проверка: можно ли крутить? (1 раз в 24 часа) ===
function canSpin() {
  const data = getUserData();
  if (!data.lastSpinAt) return true;

  const last = new Date(data.lastSpinAt).getTime();
  const now = Date.now();
  const diffHours = (now - last) / 1000 / 60 / 60;

  return diffHours >= 24;
}

function formatRemainingTime() {
  const data = getUserData();
  if (!data.lastSpinAt) return "";

  const last = new Date(data.lastSpinAt).getTime();
  const now = Date.now();
  const diffMs = 24 * 60 * 60 * 1000 - (now - last);
  if (diffMs <= 0) return "";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours <= 0 && minutes <= 0) return "Скоро можно будет крутить снова";

  if (hours <= 0) {
    return `Следующий спин через ~${minutes} мин`;
  }

  return `Следующий спин через ~${hours} ч ${minutes} мин`;
}

function updateSpinButtonState() {
  spinInfo.classList.remove("highlight");

  if (canSpin()) {
    spinBtn.disabled = false;
    spinInfo.innerText = "Можно крутить колесо!";
  } else {
    spinBtn.disabled = true;
    spinInfo.innerText =
      formatRemainingTime() || "Ты уже крутил за последние 24 часа.";
  }
}

// === Рендер призов в профиле ===
function getPrizeIcon(prizeName) {
  if (prizeName.includes("Скидка")) return "%";
  if (prizeName.includes("500")) return "%";
  if (prizeName.includes("1000")) return "%";
  if (prizeName.includes("Плён")) return "🎞";
  if (prizeName.includes("бокс")) return "📦";
  if (prizeName.includes("Обезбол")) return "💊";
  if (prizeName.includes("эскиз")) return "✏️";
  if (prizeName.includes("Мини")) return "★";
  return "★";
}

function getPrizeTag(prizeName) {
  if (prizeName.includes("Скидка")) return "скидка";
  if (prizeName.includes("Плён")) return "уход";
  if (prizeName.includes("бокс")) return "заживление";
  if (prizeName.includes("Обезбол")) return "комфорт";
  if (prizeName.includes("эскиз")) return "арт";
  if (prizeName.includes("Мини")) return "мини";
  return "бонус";
}

function renderPrizes() {
  const data = getUserData();
  prizesList.innerHTML = "";

  const entries = Object.entries(data.prizes);
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      Пока нет призов 😔
      <span>Залетай в play и крути колесо</span>
    `;
    prizesList.appendChild(empty);
    return;
  }

  entries.forEach(([name, count]) => {
    const card = document.createElement("div");
    card.className = "prize-card";

    const icon = document.createElement("div");
    icon.className = "prize-icon";
    icon.innerText = getPrizeIcon(name);

    const content = document.createElement("div");
    content.className = "prize-content";

    const title = document.createElement("div");
    title.className = "prize-name";
    title.innerText = name;

    const countEl = document.createElement("div");
    countEl.className = "prize-count";
    countEl.innerText = `Количество: ${count} шт.`;

    content.appendChild(title);
    content.appendChild(countEl);

    const tag = document.createElement("div");
    tag.className = "prize-tag";
    tag.innerText = getPrizeTag(name);

    card.appendChild(icon);
    card.appendChild(content);
    card.appendChild(tag);

    prizesList.appendChild(card);
  });
}

// === Крутилка ===
let currentRotation = 0;
let spinning = false;

spinBtn.addEventListener("click", () => {
  if (spinning) return;
  if (!canSpin()) return;

  spinning = true;
  spinInfo.classList.remove("highlight");
  spinInfo.innerText = "Крутим...";

  const count = prizes.length;
  const angleStep = 360 / count;

  // индексы, которые МОГУТ реально выпасть (исключаем заблокированные)
  const allowedIndices = prizes
    .map((p, i) => (blockedPrizes.includes(p) ? null : i))
    .filter((i) => i !== null);

  const randomIndex =
    allowedIndices[Math.floor(Math.random() * allowedIndices.length)];

  // длинное вращение с замедлением
  const extraTurns = 6; // сколько лишних кругов
  const targetAngle =
    360 * extraTurns + (360 - randomIndex * angleStep - angleStep / 2);

  currentRotation += targetAngle;
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    const prize = prizes[randomIndex];

    const data = getUserData();
    if (!data.prizes[prize]) {
      data.prizes[prize] = 0;
    }
    data.prizes[prize] += 1;
    data.lastSpinAt = new Date().toISOString();
    saveUserData(data);

    spinInfo.classList.add("highlight");
    spinInfo.innerText = `Твой приз: ${prize}`;
    spinning = false;
    updateSpinButtonState();
  }, 9000); // столько же, сколько анимация (9s)
});

// === Стартовая инициализация ===
createWheelLabels();
updateSpinButtonState();
