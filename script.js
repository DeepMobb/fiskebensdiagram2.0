// =====================================================
// Fiskeben ROPEX - Script.js (v2)
// Fokus: stabil app + PDF hvor hele 5xWhy er på én side
// =====================================================

// ---------- Konstanter ----------
const DIAGRAM_W = 1122;
const DIAGRAM_H = 793;

const rygX0 = 370;
const rygX1 = 900;
const rygY = 396;

const boneLen = 230 + 76;
const step = (rygX1 - rygX0) / 2;
const boneAngle = 60 * Math.PI / 180;

function getMNames() {
  return [t("m1"), t("m2"), t("m3"), t("m4"), t("m5"), t("m6")];
}

const I18N = {
  da: {
    pageTitle: "Fiskeben ROPEX",
    appTitle: "Fiskeben ROPEX",

    helpBtnTitle: "Få hjælp til at komme igang!",
    closeHelpTitle: "Luk hjælp",
    helpTitle: "Hjælp til Fiskeben ROPEX",
    helpItem1: "Klik hvor som helst på fiskebenet for at tilføje en årsag.",
    helpItem2: "Træk og slip for at flytte årsager.",
    helpItem3: "Dobbeltklik på en boks for at redigere.",
    helpItem4: "Klik på 5xWHY-ikonet for at lave en 5xWhy-træanalyse på en årsag.",
    helpItem5: "Du kan gemme og åbne projekter som .json-filer.",
    helpItem6: "“Gem alt som PDF” laver en PDF med diagram, 5xWhy-træer og M-liste.",
    helpFooter: "Tak fordi du bruger Fiskeben ROPEX!",

    whyHelpTitle: "Hjælp til 5xWhy",
    whyHelpItem1: "Start med den mest oplagte forklaring (Hvorfor 1).",
    whyHelpItem2: "Brug “+ Under-hvorfor” til at gå dybere (Hvorfor 1.1, 1.1.1 osv.).",
    whyHelpItem3: "Skriv kort og konkret i hver boks.",
    whyHelpItem4: "Stop når I har en årsag, I kan handle på (ikke nødvendigvis præcis 5).",
    whyHelpItem5: "Dot kan bruges til at markere den vigtigste gren.",

    problemPlaceholder: "Problemet skrives her",
    problemTitle: "Skriv problemet her",

    causePlaceholder: "Skriv årsag her",
    addCause: "Tilføj",
    cancel: "Annuller",

    savePdf: "Gem alt som PDF",
    saveProject: "Gem projekt",
    openProject: "Åbn projekt",

    whyPopupTitle: "5xWhy-træ for valgt årsag",
    whyHelpBtnTitle: "Hjælp",
    whyCloseTitle: "Luk",
    addRootWhy: "+ Tilføj hvorfor (øverste niveau)",
    whySave: "Gem & luk",
    whyCancel: "Luk uden at gemme",

    why: "Hvorfor",
    whyPlaceholder: "Hvorfor?",
    addSubWhy: "+ Under-hvorfor",

    causeTitle: "Årsag:",
    m1: "Metode",
    m2: "Maskine",
    m3: "Miljø",
    m4: "Menneske",
    m5: "Måling",
    m6: "Materiale"
  },

  no: {
    pageTitle: "Fiskebein ROPEX",
    appTitle: "Fiskebein ROPEX",

    helpBtnTitle: "Få hjelp til å komme i gang!",
    closeHelpTitle: "Lukk hjelp",
    helpTitle: "Hjelp til Fiskebein ROPEX",
    helpItem1: "Klikk hvor som helst på fiskebeinet for å legge til en årsak.",
    helpItem2: "Dra og slipp for å flytte årsaker.",
    helpItem3: "Dobbeltklikk på en boks for å redigere.",
    helpItem4: "Klikk på 5xWHY-ikonet for å lage en 5xWhy-treanalyse for en årsak.",
    helpItem5: "Du kan lagre og åpne prosjekter som .json-filer.",
    helpItem6: "«Lagre alt som PDF» lager en PDF med diagram, 5xWhy-trær og M-liste.",
    helpFooter: "Takk for at du bruker Fiskebein ROPEX!",

    whyHelpTitle: "Hjelp til 5xWhy",
    whyHelpItem1: "Start med den mest opplagte forklaringen (Hvorfor 1).",
    whyHelpItem2: "Bruk “+ Under-hvorfor” for å gå dypere (Hvorfor 1.1, 1.1.1 osv.).",
    whyHelpItem3: "Skriv kort og konkret i hver boks.",
    whyHelpItem4: "Stopp når dere har en årsak dere kan handle på (ikke nødvendigvis nøyaktig 5).",
    whyHelpItem5: "Prikken kan brukes til å markere den viktigste grenen.",

    problemPlaceholder: "Problemet skrives her",
    problemTitle: "Skriv problemet her",

    causePlaceholder: "Skriv årsak her",
    addCause: "Legg til",
    cancel: "Avbryt",

    savePdf: "Lagre alt som PDF",
    saveProject: "Lagre prosjekt",
    openProject: "Åpne prosjekt",

    whyPopupTitle: "5xWhy-tre for valgt årsak",
    whyHelpBtnTitle: "Hjelp",
    whyCloseTitle: "Lukk",
    addRootWhy: "+ Legg til hvorfor (øverste nivå)",
    whySave: "Lagre og lukk",
    whyCancel: "Lukk uten å lagre",

    why: "Hvorfor",
    whyPlaceholder: "Hvorfor?",
    addSubWhy: "+ Legg til under-hvorfor",

    causeTitle: "Årsak:",
    m1: "Metode",
    m2: "Maskin",
    m3: "Miljø",
    m4: "Menneske",
    m5: "Måling",
    m6: "Materiale"
  }
};

let currentLanguage = "da";

function t(key) {
  return I18N[currentLanguage]?.[key] || key;
}

function applyLanguage() {
  const savePdfBtn = document.getElementById("savePdfBtn");
  const saveProjectBtn = document.getElementById("saveProjectBtn");
  const openProjectBtn = document.getElementById("openProjectBtn");
  const addCauseBtn = document.getElementById("addCauseBtn");
  const cancelCauseBtn = document.getElementById("cancelCauseBtn");
  const popupText = document.getElementById("popupText");
  const languageToggle = document.getElementById("languageToggle");

  const helpBtn = document.getElementById("helpBtn");
  const closeHelpBtn = document.getElementById("closeHelpBtn");
  const helpTitle = document.getElementById("helpTitle");
  const helpItem1 = document.getElementById("helpItem1");
  const helpItem2 = document.getElementById("helpItem2");
  const helpItem3 = document.getElementById("helpItem3");
  const helpItem4 = document.getElementById("helpItem4");
  const helpItem5 = document.getElementById("helpItem5");
  const helpItem6 = document.getElementById("helpItem6");
  const helpFooter = document.getElementById("helpFooter");

  const appTitle = document.getElementById("appTitle");
  const problemBox = document.getElementById("problemBox");

  const whyHelpTitle = document.getElementById("whyHelpTitle");
  const whyHelpItem1 = document.getElementById("whyHelpItem1");
  const whyHelpItem2 = document.getElementById("whyHelpItem2");
  const whyHelpItem3 = document.getElementById("whyHelpItem3");
  const whyHelpItem4 = document.getElementById("whyHelpItem4");
  const whyHelpItem5 = document.getElementById("whyHelpItem5");

  const whyTreeTitle = document.getElementById("whyTreeTitle");
  const whyHelpBtn = document.getElementById("whyHelpBtn");
  const whyTreeCloseBtn = document.querySelector("#whyTreePopup .why-tree-close");
  const addRootWhyBtn = document.getElementById("addRootWhyBtn");
  const whyTreeSaveBtn = document.getElementById("whyTreeSaveBtn");
  const whyTreeCancelBtn = document.getElementById("whyTreeCancelBtn");

  if (savePdfBtn) savePdfBtn.textContent = t("savePdf");
  if (saveProjectBtn) saveProjectBtn.textContent = t("saveProject");
  if (openProjectBtn) openProjectBtn.textContent = t("openProject");

  if (addCauseBtn) addCauseBtn.textContent = t("addCause");
  if (cancelCauseBtn) cancelCauseBtn.textContent = t("cancel");
  if (popupText) popupText.placeholder = t("causePlaceholder");

  if (helpBtn) helpBtn.title = t("helpBtnTitle");
  if (closeHelpBtn) closeHelpBtn.title = t("closeHelpTitle");
  if (helpTitle) helpTitle.textContent = t("helpTitle");
  if (helpItem1) helpItem1.textContent = t("helpItem1");
  if (helpItem2) helpItem2.textContent = t("helpItem2");
  if (helpItem3) helpItem3.textContent = t("helpItem3");
  if (helpItem4) helpItem4.textContent = t("helpItem4");
  if (helpItem5) helpItem5.textContent = t("helpItem5");
  if (helpItem6) helpItem6.textContent = t("helpItem6");
  if (helpFooter) helpFooter.textContent = t("helpFooter");

  if (appTitle) appTitle.textContent = t("appTitle");

  if (problemBox) {
    problemBox.setAttribute("data-placeholder", t("problemPlaceholder"));
    problemBox.setAttribute("title", t("problemTitle"));

    if (problemBox.classList.contains("placeholder")) {
      problemBox.textContent = t("problemPlaceholder");
    }
  }

  if (whyHelpTitle) whyHelpTitle.textContent = t("whyHelpTitle");
  if (whyHelpItem1) whyHelpItem1.textContent = t("whyHelpItem1");
  if (whyHelpItem2) whyHelpItem2.textContent = t("whyHelpItem2");
  if (whyHelpItem3) whyHelpItem3.textContent = t("whyHelpItem3");
  if (whyHelpItem4) whyHelpItem4.textContent = t("whyHelpItem4");
  if (whyHelpItem5) whyHelpItem5.textContent = t("whyHelpItem5");

  if (whyTreeTitle) whyTreeTitle.textContent = t("whyPopupTitle");
  if (whyHelpBtn) whyHelpBtn.title = t("whyHelpBtnTitle");
  if (whyTreeCloseBtn) whyTreeCloseBtn.title = t("whyCloseTitle");
  if (addRootWhyBtn) addRootWhyBtn.textContent = t("addRootWhy");
  if (whyTreeSaveBtn) whyTreeSaveBtn.textContent = t("whySave");
  if (whyTreeCancelBtn) whyTreeCancelBtn.textContent = t("whyCancel");

  if (languageToggle) {
    languageToggle.textContent = currentLanguage === "da" ? "DK" : "NO";
    languageToggle.title = currentLanguage === "da" ? "Skift til norsk" : "Skift til dansk";
  }

  document.title = t("pageTitle");

  drawFishbone();

  document.querySelectorAll("#causes .causeBox").forEach((div) => {
    div.setAttribute("data-placeholder", t("causePlaceholder"));

    if (div.classList.contains("placeholder")) {
      div.textContent = t("causePlaceholder");
    }
  });

  const whyPopup = document.getElementById("whyTreePopup");
  if (whyPopup && !whyPopup.classList.contains("hidden")) {
    if (typeof renderAndAutoSizeTree === "function") {
      renderAndAutoSizeTree();
    }
  }
}

// ---------- DOM ----------
const diagramArea = document.getElementById("diagramArea");
const causesDiv = document.getElementById("causes");
const problemBox = document.getElementById("problemBox");

// ---------- Global state ----------
let clickCoords = { x: 0, y: 0 };
let addPopupMayClose = false;

let currentWhyBox = null;
window.whyTree = [];

const dragState = {
  active: false,
  target: null,
  startMouseX: 0,
  startMouseY: 0,
  startLeft: 0,
  startTop: 0,
  moved: false
};

// =====================================================
// Utils
// =====================================================
function escapeHTML(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function px(n) {
  return `${Math.round(n)}px`;
}

function getDiagramRect() {
  return diagramArea.getBoundingClientRect();
}

function getPopup() {
  return document.getElementById("popup");
}

function getPopupText() {
  return document.getElementById("popupText");
}

function isAddPopupOpen() {
  const popup = getPopup();
  return popup && popup.style.display === "block";
}

function sanitizeTextContent(str) {
  return String(str || "").replace(/\r\n/g, "\n").trim();
}

// =====================================================
// Help overlays
// =====================================================
function initHelpOverlays() {
  // Fiskeben help
  const helpBtn = document.getElementById("helpBtn");
  const helpOverlay = document.getElementById("helpOverlay");
  const closeHelpBtn = document.querySelector("#helpOverlay .closeHelp");

  if (helpBtn && helpOverlay && closeHelpBtn) {
    helpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      helpOverlay.classList.toggle("hidden");
    });

    closeHelpBtn.addEventListener("click", () => helpOverlay.classList.add("hidden"));

    helpOverlay.addEventListener("click", (e) => {
      if (e.target === helpOverlay) helpOverlay.classList.add("hidden");
    });
  }

  // 5xWhy help
  const whyHelpBtn = document.getElementById("whyHelpBtn");
  const whyHelpOverlay = document.getElementById("whyHelpOverlay");
  const whyCloseHelpBtn = document.querySelector("#whyHelpOverlay .closeHelp");

  if (whyHelpBtn && whyHelpOverlay && whyCloseHelpBtn) {
    const content = whyHelpOverlay.querySelector(".help-content");
    if (content) {
      content.addEventListener("click", (e) => e.stopPropagation());
    }

    whyHelpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      whyHelpOverlay.classList.toggle("hidden");
    });

    whyCloseHelpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      whyHelpOverlay.classList.add("hidden");
    });

    whyHelpOverlay.addEventListener("click", (e) => {
      if (e.target === whyHelpOverlay) whyHelpOverlay.classList.add("hidden");
    });
  }
}

// =====================================================
// Tegn fiskeben
// =====================================================
function getMNames() {
  return [t("m1"), t("m2"), t("m3"), t("m4"), t("m5"), t("m6")];
}

function drawFishbone() {
  const ishikawa = document.getElementById("ishikawa");
  if (!ishikawa) return;

  const mNames = getMNames();

  let svgBones = "";
  svgBones += `<line x1="${rygX0 - 283}" y1="${rygY}" x2="${rygX1 + 13}" y2="${rygY}" stroke="black" stroke-width="10" />`;
  svgBones += `<polygon points="${rygX1 + 14},${rygY - 14} ${rygX1 + 74},${rygY} ${rygX1 + 14},${rygY + 14}" fill="crimson"/>`;

  for (let i = 0; i < 3; i++) {
    const xBase = rygX0 + i * step;

    const x2top = xBase - boneLen * Math.cos(boneAngle);
    const y2top = rygY - boneLen * Math.sin(boneAngle);
    svgBones += `<line x1="${xBase}" y1="${rygY}" x2="${x2top}" y2="${y2top}" stroke="black" stroke-width="6"/>`;
    svgBones += `<text x="${x2top - 50}" y="${y2top - 20}" font-size="28" font-weight="bold" fill="#283c6c">${mNames[i]}</text>`;

    const x2bot = xBase - boneLen * Math.cos(boneAngle);
    const y2bot = rygY + boneLen * Math.sin(boneAngle);
    svgBones += `<line x1="${xBase}" y1="${rygY}" x2="${x2bot}" y2="${y2bot}" stroke="black" stroke-width="6"/>`;
    svgBones += `<text x="${x2bot - 50}" y="${y2bot + 38}" font-size="28" font-weight="bold" fill="#283c6c">${mNames[i + 3]}</text>`;
  }

  ishikawa.innerHTML = svgBones;
}

// =====================================================
// Problem-boks
// =====================================================
function sanitizeProblemBox() {
  const txt = problemBox.innerText;
  problemBox.textContent = txt;
}

function adjustProblemBoxHeight() {
  if (!problemBox) return;
  problemBox.style.height = "auto";
  problemBox.style.height = `${problemBox.scrollHeight}px`;
}

function initProblemBox() {
  if (!problemBox) return;

  problemBox.addEventListener("focus", () => {
    if (problemBox.classList.contains("placeholder")) {
      problemBox.textContent = "";
      problemBox.classList.remove("placeholder");
    }
  });

  problemBox.addEventListener("blur", () => {
    sanitizeProblemBox();
    if (problemBox.textContent.trim() === "") {
      problemBox.classList.add("placeholder");
      problemBox.textContent = problemBox.getAttribute("data-placeholder");
      problemBox.style.height = "80px";
    } else {
      adjustProblemBoxHeight();
    }
  });

  problemBox.addEventListener("input", adjustProblemBoxHeight);

  if (problemBox.textContent.trim() === "") {
    problemBox.classList.add("placeholder");
    problemBox.textContent = problemBox.getAttribute("data-placeholder");
    problemBox.style.height = "80px";
  } else {
    adjustProblemBoxHeight();
  }
}

// =====================================================
// M-kategorisering
// =====================================================
function getMPositions() {
  const topPositions = [];
  const bottomPositions = [];
  const texts = Array.from(document.querySelectorAll("#ishikawa text"));
  const diagramRect = getDiagramRect();
  const rygYpx = diagramRect.top + (diagramRect.height / 2);

  texts.forEach((txt) => {
    const rect = txt.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);
    if (centerY < rygYpx) topPositions.push(centerX);
    else bottomPositions.push(centerX);
  });

  topPositions.sort((a, b) => a - b);
  bottomPositions.sort((a, b) => a - b);
  return { topPositions, bottomPositions };
}

function getMCatFromPos(div) {
  if (!div) return null;

  const rect = div.getBoundingClientRect();
  const boxCenterX = rect.left + (rect.width / 2);
  const boxLeft = rect.left;
  const boxRight = rect.right;

  const { topPositions, bottomPositions } = getMPositions();
  const diagramRect = getDiagramRect();
  const topHalf = rect.top < (diagramRect.top + (diagramRect.height / 2));

  const positions = topHalf ? topPositions : bottomPositions;
  const offsetIndex = topHalf ? 0 : 3;

  if (!positions.length) return null;

  let nearestIndex = 0;
  let nearestDist = Math.abs(boxCenterX - positions[0]);

  for (let i = 1; i < positions.length; i++) {
    const dist = Math.abs(boxCenterX - positions[i]);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestIndex = i;
    }
  }

  if (nearestIndex > 0) {
    const leftNeighborX = positions[nearestIndex - 1];
    const midpoint = (positions[nearestIndex] + leftNeighborX) / 2;
    if (boxLeft < midpoint && boxRight > midpoint) {
      const overlapLeft = midpoint - boxLeft;
      const overlapRight = boxRight - midpoint;
      if (overlapRight <= overlapLeft) nearestIndex -= 1;
    }
  }

  const mNames = getMNames();
  return mNames[nearestIndex + offsetIndex] || null;
}

// =====================================================
// Årsagsbokse
// =====================================================
function getCauseText(div) {
  const span = div.querySelector(".causeText");
  if (span) return span.textContent;
  const clone = div.cloneNode(true);
  const btn = clone.querySelector(".why-icon");
  if (btn) btn.remove();
  return clone.textContent.trim();
}

function setCauseText(div, txt) {
  let span = div.querySelector(".causeText");
  if (!span) {
    span = document.createElement("span");
    span.className = "causeText";
    div.insertBefore(span, div.firstChild || null);
  }
  span.textContent = txt;
}

function reserveSpaceForWhy(div) {
  const btn = div.querySelector(".why-icon");
  if (!btn) return;
  requestAnimationFrame(() => {
    const pt = Math.max(24, btn.offsetHeight + 8);
    div.style.paddingTop = `${pt}px`;
  });
}

function updateWhyIcon(div) {
  const btn = div.querySelector(".why-icon");
  if (!btn) return;
  const hasTree = Array.isArray(div._whyTree) && div._whyTree.length > 0;
  if (hasTree) {
    btn.setAttribute("data-filled", "yes");
    btn.title = "5xWhy-træ udfyldt";
  } else {
    btn.removeAttribute("data-filled");
    btn.title = "Åbn 5xWhy-træ";
  }
}

function addWhyIcon(div) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "why-icon";
  btn.setAttribute("aria-label", "5xWhy");
  btn.innerHTML = '5x<span style="font-size:86%">WHY?</span>';

  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    openWhyTreeForBox(div);
  });

  div.appendChild(btn);
  updateWhyIcon(div);
}

function createCauseBox({ x, y, text = "", whyTree = [] }) {
  const div = document.createElement("div");
  div.className = "causeBox";
  div.style.left = px(x);
  div.style.top = px(y);
  div.title = "Dobbeltklik for at redigere";
  div._whyTree = Array.isArray(whyTree) ? deepClone(whyTree) : [];

  const span = document.createElement("span");
  span.className = "causeText";
  span.textContent = text;
  div.appendChild(span);

  addWhyIcon(div);
  reserveSpaceForWhy(div);

  div.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    openEditCauseInput(div);
  });

  return div;
}

function openEditCauseInput(div) {
  const existing = document.querySelector(".edit-cause-input");
  if (existing) existing.remove();

  const rect = div.getBoundingClientRect();
  const textarea = document.createElement("textarea");
  textarea.className = "edit-cause-input";
  textarea.value = getCauseText(div);

  textarea.style.left = `${window.scrollX + rect.left}px`;
  textarea.style.top = `${window.scrollY + rect.top}px`;
  textarea.style.width = `${rect.width}px`;
  textarea.style.height = `${Math.max(rect.height, 100)}px`;

  function saveEdit() {
    const val = sanitizeTextContent(textarea.value);
    if (val) {
      setCauseText(div, val);
    }
    reserveSpaceForWhy(div);
    textarea.remove();
  }

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Escape") textarea.remove();
    if (e.key === "Enter" && e.ctrlKey) saveEdit();
  });

  textarea.addEventListener("blur", saveEdit);

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
}

function closePopup() {
  const popup = getPopup();
  const popupText = getPopupText();
  if (!popup) return;

  popup.style.display = "none";
  if (popupText) popupText.value = "";
}

function openAddPopupAt(clientX, clientY) {
  const popup = getPopup();
  const popupText = getPopupText();
  if (!popup || !popupText) return;

  const diagramRect = getDiagramRect();

  // Placér popup tæt ved musen, men indenfor skærmen
  const popupW = 320;
  const popupH = 130;
  const left = clamp(clientX + 12, 10, window.innerWidth - popupW - 10);
  const top = clamp(clientY + 12, 10, window.innerHeight - popupH - 10);

  popup.style.display = "block";
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  popup.style.transform = "none";

  // klikposition til selve boksen i diagrammet
  clickCoords.x = clamp(clientX - diagramRect.left, 0, DIAGRAM_W - 220);
  clickCoords.y = clamp(clientY - diagramRect.top, 0, DIAGRAM_H - 120);

  popupText.value = "";

  addPopupMayClose = false;
  requestAnimationFrame(() => {
    popupText.focus();
    addPopupMayClose = true;
  });
}

function submitText() {
  const popupText = getPopupText();
  if (!popupText) return;

  let text = sanitizeTextContent(popupText.value);
  if (!text) return;
  if (text.length > 1000) text = text.substring(0, 1000) + "…";

  const div = createCauseBox({
    x: clickCoords.x,
    y: clickCoords.y,
    text
  });

  causesDiv.appendChild(div);
  closePopup();
}

function submitTextOrClose() {
  const popupText = getPopupText();
  if (!popupText) {
    closePopup();
    return;
  }

  const text = sanitizeTextContent(popupText.value);

  if (text) {
    submitText();   // ← tilføjer boksen automatisk
  } else {
    closePopup();
  }
}

// =====================================================
// Drag & drop
// =====================================================
function startDrag(div, clientX, clientY) {
  dragState.active = true;
  dragState.target = div;
  dragState.startMouseX = clientX;
  dragState.startMouseY = clientY;
  dragState.startLeft = parseInt(div.style.left, 10) || 0;
  dragState.startTop = parseInt(div.style.top, 10) || 0;
  dragState.moved = false;
}

function onMouseMove(e) {
  if (!dragState.active || !dragState.target) return;

  const dx = e.clientX - dragState.startMouseX;
  const dy = e.clientY - dragState.startMouseY;

  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
    dragState.moved = true;
  }

  const target = dragState.target;
  const targetRect = target.getBoundingClientRect();
  const width = targetRect.width;
  const height = targetRect.height;

  const newLeft = clamp(dragState.startLeft + dx, 0, DIAGRAM_W - width);
  const newTop = clamp(dragState.startTop + dy, 0, DIAGRAM_H - height);

  target.style.left = px(newLeft);
  target.style.top = px(newTop);
}

function onMouseUp() {
  dragState.active = false;
  dragState.target = null;
}

// =====================================================
// Diagram interactions
// =====================================================
function initDiagramInteractions() {
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  // Klik på tomt område => popup
  diagramArea.addEventListener("mousedown", (e) => {
    if (isAddPopupOpen()) return;
    if (e.target.closest(".causeBox")) return;
    if (e.target.closest("#problemBox")) return;
    if (e.target.closest("#popup")) return;

    openAddPopupAt(e.clientX, e.clientY);
  });

  // Drag bokse
  diagramArea.addEventListener("mousedown", (e) => {
    if (isAddPopupOpen()) return;

    const box = e.target.closest(".causeBox");
    if (!box) return;
    if (e.target.closest(".why-icon")) return;

    // Lad browserens resize-håndtag virke nederst til højre
    const rect = box.getBoundingClientRect();
    const RESIZE_ZONE = 18;
    const nearRight = e.clientX >= rect.right - RESIZE_ZONE;
    const nearBottom = e.clientY >= rect.bottom - RESIZE_ZONE;

    if (nearRight && nearBottom) {
      return; // vigtigt: ingen drag her, så resize får lov
    }

    e.preventDefault();
    startDrag(box, e.clientX, e.clientY);
  });

  // Klik udenfor popup lukker
  document.addEventListener("mousedown", (e) => {
    const popup = getPopup();
    if (!popup || popup.style.display !== "block") return;

    const clickedOutside = !e.target.closest("#popup");
    if (clickedOutside && addPopupMayClose) {
      submitTextOrClose();
    }
  });
}

// =====================================================
// 5xWhy popup
// =====================================================
function autoSizeTA(inp) {
  inp.style.height = "auto";
  inp.style.height = `${inp.scrollHeight}px`;
}

function autoSizeAllWhyTextareas() {
  const root = document.getElementById("tree5whyRoot");
  if (!root) return;
  root.querySelectorAll(".tree5why-textarea").forEach(autoSizeTA);
}

function renderWhyTree(tree, parentEl, parentPath = []) {
  parentEl.innerHTML = "";

  const nodes = Array.isArray(tree) ? tree : [];

  nodes.forEach((node, idx) => {
    const path = parentPath.concat(idx + 1);
    const levelLabel = t("why") + " " + path.join(".");

    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree5why-node";

    const left = document.createElement("div");
    left.className = "tree5why-left";

    if (parentPath.length > 0) {
      const dot = document.createElement("span");
      dot.className = "tree5why-dot";

      if (node.selectedAction) {
        dot.classList.add("selected-action");
        nodeDiv.classList.add("selected-action");
      }

      dot.addEventListener("click", (ev) => {
        ev.stopPropagation();
        node.selectedAction = !node.selectedAction;
        renderAndAutoSizeTree();
      });

      left.appendChild(dot);
    }

    nodeDiv.appendChild(left);

    const right = document.createElement("div");
    right.className = "tree5why-right";

    const lvl = document.createElement("div");
    lvl.className = "tree5why-level";
    lvl.textContent = levelLabel;
    right.appendChild(lvl);

    const line = document.createElement("div");
    line.className = "tree5why-line";

    const inp = document.createElement("textarea");
    inp.className = "tree5why-textarea";
    inp.placeholder = t("whyPlaceholder");
    inp.value = node.q || "";
    inp.addEventListener("input", () => {
      node.q = inp.value;
      autoSizeTA(inp);
    });
    inp.addEventListener("focus", () => {
      document.querySelectorAll(".tree5why-node.selected").forEach(el => el.classList.remove("selected"));
      nodeDiv.classList.add("selected");
    });

    line.appendChild(inp);

    const actionsInline = document.createElement("div");

    const addBtn = document.createElement("button");
    addBtn.className = "tree5why-btn add";
    addBtn.textContent = t("addSubWhy");
    addBtn.addEventListener("click", () => {
      node.children = node.children || [];
      node.children.push({ q: "", children: [] });
      renderAndAutoSizeTree();
    });
    actionsInline.appendChild(addBtn);

    const canDelete = !(node.children && node.children.length > 0);
    const delBtn = document.createElement("button");
    delBtn.className = "tree5why-btn del";
    delBtn.textContent = "✕";
    delBtn.disabled = !canDelete;
    delBtn.setAttribute("aria-disabled", canDelete ? "false" : "true");
    delBtn.addEventListener("click", () => {
      if (!canDelete) return;
      tree.splice(idx, 1);
      renderAndAutoSizeTree();
    });
    actionsInline.appendChild(delBtn);

    line.appendChild(actionsInline);
    right.appendChild(line);
    nodeDiv.appendChild(right);

    if (node.children && node.children.length > 0) {
      const subTree = document.createElement("div");
      subTree.className = "tree5why-children";
      renderWhyTree(node.children, subTree, path);
      nodeDiv.appendChild(subTree);
    }

    parentEl.appendChild(nodeDiv);
  });
}

function renderAndAutoSizeTree() {
  const root = document.getElementById("tree5whyRoot");
  if (!root) return;
  renderWhyTree(window.whyTree, root);
  requestAnimationFrame(autoSizeAllWhyTextareas);
}

function openWhyTreeForBox(boxDiv) {
  currentWhyBox = boxDiv;

  const causeText = getCauseText(boxDiv);
  const causeEl = document.getElementById("whyTreeCause");
  if (causeEl) causeEl.textContent = causeText;

  window.whyTree = boxDiv._whyTree ? deepClone(boxDiv._whyTree) : [];
  renderAndAutoSizeTree();

  const popup = document.getElementById("whyTreePopup");
  const backdrop = document.getElementById("whyTreeBackdrop");
  if (popup) popup.classList.remove("hidden");
  if (backdrop) backdrop.classList.remove("hidden");

  requestAnimationFrame(autoSizeAllWhyTextareas);
}

function closeWhyTreePopup(save) {
  const popup = document.getElementById("whyTreePopup");
  const backdrop = document.getElementById("whyTreeBackdrop");

  if (save && currentWhyBox) {
    currentWhyBox._whyTree = deepClone(window.whyTree);
    updateWhyIcon(currentWhyBox);
  }

  currentWhyBox = null;
  window.whyTree = [];

  if (popup) popup.classList.add("hidden");
  if (backdrop) backdrop.classList.add("hidden");
}

function addWhy(tree) {
  const node = { q: "", children: [] };
  tree.push(node);
  renderAndAutoSizeTree();
}

// =====================================================
// Save / load project
// =====================================================
function makeSafeFilename(name) {
  return (name || "ishikawa-projekt")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\./g, "-")
    .substring(0, 80) || "ishikawa-projekt";
}

function buildProjectData() {
  const causes = [];

  document.querySelectorAll("#causes .causeBox").forEach(div => {
    causes.push({
      x: parseInt(div.style.left, 10) || 0,
      y: parseInt(div.style.top, 10) || 0,
      text: getCauseText(div),
      whyTree: Array.isArray(div._whyTree) ? deepClone(div._whyTree) : []
    });
  });

  const problemText = problemBox.classList.contains("placeholder")
    ? ""
    : problemBox.textContent;

  return {
    appVersion: 2,
    language: currentLanguage,
    analysisType: "fishbone",
    categoryPreset: "fishbone_6m",
    problem: problemText,
    causes
  };
}

function saveProject() {
  const data = buildProjectData();

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${makeSafeFilename(data.problem)}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function migrateProjectData(data) {
  const cloned = structuredClone(data);

  if (!cloned.appVersion) {
    cloned.appVersion = 1;
  }

  if (cloned.appVersion < 2) {
    cloned.language = cloned.language || "da";
    cloned.analysisType = cloned.analysisType || "fishbone";
    cloned.categoryPreset = cloned.categoryPreset || "fishbone_6m";

    cloned.causes = Array.isArray(cloned.causes)
      ? cloned.causes.map(cause => ({
          x: cause.x || 0,
          y: cause.y || 0,
          text: cause.text || "",
          whyTree: Array.isArray(cause.whyTree) ? cause.whyTree : []
        }))
      : [];

    cloned.appVersion = 2;
  }

  return cloned;
}

function loadProjectFromFile(file) {
  const reader = new FileReader();

  reader.onload = function (ev) {
    try {
      const rawData = JSON.parse(ev.target.result);
      const data = migrateProjectData(rawData);

      currentLanguage = data.language || "da";

      if (data.problem !== undefined) {
        const txt = data.problem || "";
        if (!txt.trim()) {
          problemBox.classList.add("placeholder");
          problemBox.textContent = problemBox.getAttribute("data-placeholder");
          problemBox.style.height = "80px";
        } else {
          problemBox.classList.remove("placeholder");
          problemBox.textContent = txt;
          adjustProblemBoxHeight();
        }
      }

      causesDiv.innerHTML = "";

      if (Array.isArray(data.causes)) {
        data.causes.forEach((cause) => {
          const div = createCauseBox({
            x: cause.x || 0,
            y: cause.y || 0,
            text: cause.text || "",
            whyTree: Array.isArray(cause.whyTree) ? cause.whyTree : []
          });
          causesDiv.appendChild(div);
        });
      }

      applyLanguage();

    } catch (err) {
      console.error(err);
      alert("Kunne ikke åbne projektfilen.");
    }
  };

  reader.readAsText(file);
}

// =====================================================
// PDF helpers
// =====================================================
function buildCausesListHTML() {
  const mNames = getMNames();

  const categories = {};
  mNames.forEach(name => {
    categories[name] = [];
  });

  const unknownLabel = currentLanguage === "no" ? "Ukjent" : "Ukendt";
  categories[unknownLabel] = [];

  document.querySelectorAll("#causes .causeBox").forEach(div => {
    const cat = getMCatFromPos(div);
    const safeCat = categories[cat] ? cat : unknownLabel;
    categories[safeCat].push(getCauseText(div));
  });

  const listTitle = currentLanguage === "no"
    ? "Liste over alle årsaker (gruppert etter M)"
    : "Liste over alle årsager (grupperet efter M)";

  let html = `<div style="font-size:22px; font-weight:bold; margin-bottom:10px;">${listTitle}</div>`;

  for (const m of mNames) {
    if (categories[m].length) {
      html += `<div style="margin-top:12px; font-size:20px; font-weight:bold; color:#253c7c;">${escapeHTML(m)}</div>`;
      categories[m].forEach(txt => {
        html += `<div style="margin-left:16px;">- ${escapeHTML(txt)}</div>`;
      });
    }
  }

  if (categories[unknownLabel].length) {
    html += `<div style="margin-top:12px; font-size:20px; font-weight:bold; color:#253c7c;">${unknownLabel}</div>`;
    categories[unknownLabel].forEach(txt => {
      html += `<div style="margin-left:16px;">- ${escapeHTML(txt)}</div>`;
    });
  }

  return html;
}

function getTreeDepth(nodes) {
  if (!nodes || !nodes.length) return 0;
  let max = 0;
  nodes.forEach(node => {
    const childDepth = getTreeDepth(node.children || []);
    max = Math.max(max, 1 + childDepth);
  });
  return max;
}

function countTreeNodes(nodes) {
  if (!nodes || !nodes.length) return 0;
  let count = 0;
  nodes.forEach(node => {
    count += 1 + countTreeNodes(node.children || []);
  });
  return count;
}

function makePdfPage() {
  const page = document.createElement("div");
  page.className = "pdf-page";
  page.style.width = `${DIAGRAM_W}px`;
  page.style.height = `${DIAGRAM_H}px`;
  page.style.boxSizing = "border-box";
  page.style.background = "#fff";
  page.style.overflow = "hidden";
  return page;
}

function renderWhyTreeForPdf(tree, parentEl, parentPath = [], options = {}) {
  parentEl.innerHTML = "";

  const {
    nodeWidth = 220,
    childIndent = 12,
    fontSize = 12,
    lineHeight = 1.28,
    paddingY = 6,
    paddingX = 8,
    levelFontSize = 9.5
  } = options;

  const nodes = Array.isArray(tree) ? tree : [tree];

  nodes.forEach((node, idx) => {
    const path = parentPath.concat(idx + 1);
    const levelLabel = t("why") + " " + path.join(".");
    const txt = sanitizeTextContent(node.q || "");
    if (!txt) return;

    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree5why-node";
    nodeDiv.style.display = "flex";
    nodeDiv.style.alignItems = "flex-start";
    nodeDiv.style.padding = "2px 0";
    nodeDiv.style.marginBottom = "6px";
    nodeDiv.style.background = node.selectedAction ? "#fff9c6" : "#fff";

    const left = document.createElement("div");
    left.className = "tree5why-left";
    left.style.width = "14px";
    left.style.minWidth = "14px";
    left.style.marginRight = "4px";
    left.style.display = "flex";
    left.style.justifyContent = "center";

    if (parentPath.length > 0) {
      const dot = document.createElement("span");
      dot.className = "tree5why-dot";
      dot.style.width = "8px";
      dot.style.height = "8px";
      dot.style.borderRadius = "50%";
      dot.style.display = "inline-block";
      dot.style.background = node.selectedAction ? "#ffe600" : "#bdd2ee";
      left.appendChild(dot);
    }

    nodeDiv.appendChild(left);

    const right = document.createElement("div");
    right.className = "tree5why-right";
    right.style.display = "flex";
    right.style.flexDirection = "column";
    right.style.alignItems = "flex-start";
    right.style.width = "auto";
    right.style.maxWidth = "none";

    const lvl = document.createElement("div");
    lvl.className = "tree5why-level";
    lvl.textContent = levelLabel;
    lvl.style.fontSize = `${levelFontSize}px`;
    lvl.style.color = "#555";
    lvl.style.marginBottom = "2px";
    lvl.style.whiteSpace = "nowrap";
    right.appendChild(lvl);

    const textDiv = document.createElement("div");
    textDiv.className = "tree5why-pdf-text";
    textDiv.textContent = txt;

    textDiv.style.width = `${nodeWidth}px`;
    textDiv.style.maxWidth = `${nodeWidth}px`;
    textDiv.style.minWidth = "0";
    textDiv.style.height = "auto";
    textDiv.style.maxHeight = "none";
    textDiv.style.overflow = "visible";
    textDiv.style.boxSizing = "border-box";
    textDiv.style.padding = `${paddingY}px ${paddingX}px`;
    textDiv.style.border = "1px solid #8899cc";
    textDiv.style.borderRadius = "8px";
    textDiv.style.background = "#f6f8ff";
    textDiv.style.fontSize = `${fontSize}px`;
    textDiv.style.lineHeight = String(lineHeight);
    textDiv.style.whiteSpace = "pre-wrap";
    textDiv.style.overflowWrap = "anywhere";
    textDiv.style.wordBreak = "break-word";
    textDiv.style.display = "block";

    right.appendChild(textDiv);
    nodeDiv.appendChild(right);

    if (node.children && node.children.length > 0) {
      const subTree = document.createElement("div");
      subTree.className = "tree5why-children";
      subTree.style.marginLeft = `${childIndent}px`;
      subTree.style.paddingLeft = `${Math.max(6, childIndent - 4)}px`;
      subTree.style.borderLeft = "2px solid #a5c3f2";
      subTree.style.position = "relative";

      renderWhyTreeForPdf(node.children, subTree, path, options);
      nodeDiv.appendChild(subTree);
    }

    parentEl.appendChild(nodeDiv);
  });
}

function buildWhyBilagPage(boxDiv, index) {
  const page = makePdfPage();

  const inner = document.createElement("div");
  inner.style.boxSizing = "border-box";
  inner.style.width = `${DIAGRAM_W}px`;
  inner.style.height = `${DIAGRAM_H}px`;
  inner.style.padding = "24px 28px";
  inner.style.background = "#fff";
  inner.style.overflow = "hidden";

  const title = document.createElement("div");
  title.textContent = `${t("causeTitle")} ${getCauseText(boxDiv) || `#${index + 1}`}`;
  title.style.textAlign = "center";
  title.style.fontSize = "22px";
  title.style.fontWeight = "bold";
  title.style.color = "#253c7c";
  title.style.marginBottom = "14px";
  inner.appendChild(title);

  const treeViewport = document.createElement("div");
  treeViewport.style.width = `${DIAGRAM_W - 56}px`;
  treeViewport.style.height = `${DIAGRAM_H - 80}px`;
  treeViewport.style.overflow = "hidden";
  treeViewport.style.position = "relative";
  treeViewport.style.background = "#fff";

  const treeContent = document.createElement("div");
  treeContent.style.transformOrigin = "top left";
  treeContent.style.display = "inline-block";
  treeContent.style.background = "#fff";

  const options = {
    nodeWidth: 180,
    childIndent: 12,
    fontSize: 10,
    levelFontSize: 8,
    paddingY: 5,
    paddingX: 6,
    lineHeight: 1.2
  };

  const treeData = Array.isArray(boxDiv._whyTree) ? boxDiv._whyTree : [];
  renderWhyTreeForPdf(treeData, treeContent, [], options);

  const measureWrap = document.createElement("div");
  measureWrap.style.position = "fixed";
  measureWrap.style.left = "-30000px";
  measureWrap.style.top = "0";
  measureWrap.style.background = "#fff";
  measureWrap.appendChild(treeContent);
  document.body.appendChild(measureWrap);

  const rect = treeContent.getBoundingClientRect();
  const contentW = Math.max(1, rect.width);
  const contentH = Math.max(1, rect.height);

  const availableWidth = treeViewport.clientWidth || (DIAGRAM_W - 56);
  const availableHeight = treeViewport.clientHeight || (DIAGRAM_H - 80);

  const scale = Math.min(
    availableWidth / contentW,
    availableHeight / contentH,
    1
  );

  treeContent.style.width = `${contentW}px`;
  treeContent.style.transform = `scale(${scale})`;

  measureWrap.remove();

  treeViewport.appendChild(treeContent);
  inner.appendChild(treeViewport);
  page.appendChild(inner);

  return page;
}

function buildFishbonePdfPage() {
  if (typeof adjustProblemBoxHeight === "function") {
    adjustProblemBoxHeight();
  }

  const page = makePdfPage();
  const clone = document.getElementById("diagramArea").cloneNode(true);

  clone.style.margin = "0";
  clone.style.width = `${DIAGRAM_W}px`;
  clone.style.height = `${DIAGRAM_H}px`;
  clone.style.border = "none";
  clone.style.boxShadow = "none";
  clone.style.overflow = "hidden";
  clone.style.background = "#fff";

  clone.querySelectorAll(".why-icon").forEach(el => el.remove());

  page.appendChild(clone);
  return page;
}

function buildCausesListPdfPage() {
  const page = makePdfPage();

  const inner = document.createElement("div");
  inner.style.boxSizing = "border-box";
  inner.style.width = `${DIAGRAM_W}px`;
  inner.style.height = `${DIAGRAM_H}px`;
  inner.style.padding = "34px 58px";
  inner.style.background = "#fff";
  inner.style.fontSize = "16px";
  inner.innerHTML = buildCausesListHTML();

  page.appendChild(inner);
  return page;
}

function saveAllAsPDF() {
  try {
    if (typeof adjustProblemBoxHeight === "function") {
      adjustProblemBoxHeight();
    }

    const wrapper = document.createElement("div");
    wrapper.style.background = "#fff";
    wrapper.style.width = `${DIAGRAM_W}px`;
    wrapper.style.margin = "0";
    wrapper.style.padding = "0";

    const mount = document.createElement("div");
    mount.style.position = "fixed";
    mount.style.left = "-30000px";
    mount.style.top = "0";
    mount.style.width = `${DIAGRAM_W}px`;
    mount.style.background = "#fff";

    const pages = [];

    pages.push(buildFishbonePdfPage());

    const whyBoxes = Array.from(document.querySelectorAll("#causes .causeBox"))
      .filter(div => Array.isArray(div._whyTree) && div._whyTree.length > 0);

    whyBoxes.forEach((div, index) => {
      pages.push(buildWhyBilagPage(div, index));
    });

    pages.push(buildCausesListPdfPage());

    pages.forEach((page) => {
      page.style.display = "block";
      page.style.margin = "0";
      wrapper.appendChild(page);
    });

    mount.appendChild(wrapper);
    document.body.appendChild(mount);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateString = `${day}-${month}-${year}`;

    const opt = {
      margin: 0,
      filename: `fiskeben-samlet-${dateString}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      },
      jsPDF: {
        unit: "px",
        format: [DIAGRAM_W, DIAGRAM_H],
        orientation: "landscape"
      }
    };

    const worker = html2pdf().set(opt).from(wrapper).toPdf();

    worker.get("pdf").then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = totalPages; i > 1; i--) {
        pdf.setPage(i);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const content = pdf.internal.pages[i];
        const isBlank = !content || content.length <= 1;

        if (isBlank) {
          pdf.deletePage(i);
          continue;
        }

        // ekstra sikkerhed: hvis siden kun har minimal/ingen tegnedata
        const pageText = Array.isArray(content) ? content.join("").trim() : String(content).trim();
        if (!pageText) {
          pdf.deletePage(i);
        }
      }
    }).then(() => {
      return worker.save();
    }).then(() => {
      if (mount.parentNode) mount.parentNode.removeChild(mount);
    }).catch((e) => {
      console.error("saveAllAsPDF crashed:", e);
      alert("PDF kunne ikke genereres. Se console for detaljer.");
      if (mount.parentNode) mount.parentNode.removeChild(mount);
    });

  } catch (e) {
    console.error("saveAllAsPDF crashed:", e);
    alert("PDF kunne ikke genereres. Se console for detaljer.");
  }
}

// =====================================================
// Buttons + init
// =====================================================
function initButtons() {
  const savePdfBtn = document.getElementById("savePdfBtn");
  const saveProjectBtn = document.getElementById("saveProjectBtn");
  const openProjectBtn = document.getElementById("openProjectBtn");
  const fileInput = document.getElementById("loadProjectFile");

  if (savePdfBtn) savePdfBtn.addEventListener("click", saveAllAsPDF);
  if (saveProjectBtn) saveProjectBtn.addEventListener("click", saveProject);
  if (openProjectBtn && fileInput) {
    openProjectBtn.addEventListener("click", () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener("change", (evt) => {
      const file = evt.target.files && evt.target.files[0];
      if (!file) return;
      loadProjectFromFile(file);
      fileInput.value = "";
    });
  }

  const addCauseBtn = document.getElementById("addCauseBtn");
  const cancelCauseBtn = document.getElementById("cancelCauseBtn");
  const popupText = document.getElementById("popupText");
  const popup = document.getElementById("popup");

  if (addCauseBtn) addCauseBtn.addEventListener("click", submitText);
  if (cancelCauseBtn) cancelCauseBtn.addEventListener("click", closePopup);

  if (popupText) {
    popupText.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitText();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closePopup();
      }
    });
  }

  if (popup) {
    popup.addEventListener("mousedown", (e) => e.stopPropagation());
  }

  const whyTreeSaveBtn = document.getElementById("whyTreeSaveBtn");
  const whyTreeCancelBtn = document.getElementById("whyTreeCancelBtn");
  const whyTreeCloseBtn = document.querySelector("#whyTreePopup .why-tree-close");
  const whyTreeBackdrop = document.getElementById("whyTreeBackdrop");
  const addRootWhyBtn = document.getElementById("addRootWhyBtn");

  if (whyTreeSaveBtn) whyTreeSaveBtn.addEventListener("click", () => closeWhyTreePopup(true));
  if (whyTreeCancelBtn) whyTreeCancelBtn.addEventListener("click", () => closeWhyTreePopup(false));
  if (whyTreeCloseBtn) whyTreeCloseBtn.addEventListener("click", () => closeWhyTreePopup(false));
  if (whyTreeBackdrop) whyTreeBackdrop.addEventListener("click", () => closeWhyTreePopup(false));
  if (addRootWhyBtn) addRootWhyBtn.addEventListener("click", () => addWhy(window.whyTree));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const whyPopup = document.getElementById("whyTreePopup");
      if (whyPopup && !whyPopup.classList.contains("hidden")) {
        closeWhyTreePopup(false);
      }
    }
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll("#causes .causeBox").forEach(reserveSpaceForWhy);
  });

  const languageToggle = document.getElementById("languageToggle");
  if (languageToggle) {
    languageToggle.textContent = currentLanguage === "da" ? "DK" : "NO";

    languageToggle.addEventListener("click", () => {
      currentLanguage = currentLanguage === "da" ? "no" : "da";
      applyLanguage();
    });
  }

  applyLanguage();
}

const languageSelect = document.getElementById("languageSelect");
if (languageSelect) {
  languageSelect.value = currentLanguage;
  languageSelect.addEventListener("change", () => {
    currentLanguage = languageSelect.value;
    applyLanguage();
  });
}

// =====================================================
// Boot
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  drawFishbone();
  initProblemBox();
  initHelpOverlays();
  initButtons();
  initDiagramInteractions();
});