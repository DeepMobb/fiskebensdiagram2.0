// =====================================================
// Fiskeben ROPEX - Script.js (v70)
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

const MIN_CATEGORY_COUNT = 1;
const MAX_CATEGORY_COUNT = 8;

let categoryCount = 6;
let categoryNames = null; // null betyder: brug standard 6M-navne på valgt sprog

function normalizeCategoryCount(value) {
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) return 6;
  return clamp(num, MIN_CATEGORY_COUNT, MAX_CATEGORY_COUNT);
}

function getDefaultMNames() {
  return [t("m1"), t("m2"), t("m3"), t("m4"), t("m5"), t("m6")];
}

function getCategoryFallbackName(index) {
  const defaults = getDefaultMNames();
  return defaults[index] || `${t("categoryFieldLabel")} ${index + 1}`;
}

function getMNames() {
  const names = [];
  const source = Array.isArray(categoryNames) ? categoryNames : getDefaultMNames();

  for (let i = 0; i < categoryCount; i++) {
    const name = String(source[i] || "").trim() || getCategoryFallbackName(i);
    names.push(name);
  }

  return names;
}

function setCategoryNames(names, count) {
  categoryCount = normalizeCategoryCount(count);
  categoryNames = [];

  for (let i = 0; i < categoryCount; i++) {
    categoryNames.push(String(names[i] || "").trim() || getCategoryFallbackName(i));
  }
}

function getCategoryLayout(count = categoryCount) {
  const safeCount = normalizeCategoryCount(count);
  const top = [];
  const bottom = [];

  if (safeCount <= 6) {
    const topCount = Math.ceil(safeCount / 2);
    for (let i = 0; i < safeCount; i++) {
      if (i < topCount) top.push(i);
      else bottom.push(i);
    }
  } else {
    // Når der tilføjes ben efter de 6 M'er, beholdes de oprindelige 6 M'er
    // på samme side. Det gør, at eksisterende årsager ikke hopper op/ned,
    // bare fordi man går fra 6 til 7 eller 8 ben.
    for (let i = 0; i < Math.min(3, safeCount); i++) top.push(i);
    for (let i = 3; i < Math.min(6, safeCount); i++) bottom.push(i);

    for (let i = 6; i < safeCount; i++) {
      if ((i - 6) % 2 === 0) top.push(i);
      else bottom.push(i);
    }
  }

  return { top, bottom };
}

const I18N = {
  da: {
    pageTitle: "Fiskeben ROPEX",
    appTitle: "Fiskeben ROPEX",
    pageKicker: "ROPEX værktøj",
    pageSubtitle: "Årsagsanalyse, 5xWhy og opfølgende tiltag samlet ét sted.",
    navFishbone: "Fiskeben",
    navWhy: "5xWhy",
    navAction: "Tiltag",

    helpBtnTitle: "Få hjælp til at komme igang!",
    closeHelpTitle: "Luk hjælp",
    helpTitle: "Hjælp til Fiskeben ROPEX",
    helpItem1: "Klik hvor som helst på fiskebenet for at tilføje en årsag.",
    helpItem2: "Træk og slip for at flytte årsager.",
    helpItem3: "Dobbeltklik på en boks for at redigere. Klik på × for at slette en årsag.",
    helpItem4: "Klik på 5xWHY-ikonet på en årsag - eller brug 5xWhy-knappen i toppen, hvis du kun vil lave en 5xWhy uden fiskeben.",
    helpItem5: "Brug “Ret M’er / ben” til at ændre antal ben og navnene på benene. Skriv antal ben fra 1-8, ret teksterne og tryk Gem.",
    helpItem8: "Brug tiltagstabellen under diagrammet til at skrive dato, opgave, hvem og ROPEX nr.",
    helpItem9: "Brug Fortryd til at gå et trin tilbage, hvis du kommer til at slette, flytte eller ændre noget.",
    helpItem6: "Du kan gemme og åbne projekter som .json-filer.",
    helpItem7: "“Gem alt som PDF” laver en PDF med diagram, 5xWhy-træer, tiltagstabel og M-liste.",
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
    deleteCause: "Slet årsag",
    deleteCauseConfirm: "Vil du slette denne årsag?",

    savePdf: "Gem alt som PDF",
    saveProject: "Gem projekt",
    openProject: "Åbn projekt",
    undo: "Fortryd",
    undoTitle: "Fortryd seneste ændring",
    categorySettings: "Ret M’er / ben",
    categoryPopupTitle: "Ret M’er / ben",
    categoryCountLabel: "Antal ben",
    categoryFieldLabel: "Ben",
    categorySave: "Gem",
    categoryReset: "Tilbage til 6 M’er",

    actionTableTitle: "Tiltag / opgaver",
    actionTableDate: "Dato",
    actionTableTask: "Opgave",
    actionTableWho: "Hvem",
    actionTableRopex: "ROPEX nr.",
    addActionRow: "+ Tilføj opgave",
    deleteActionRow: "Slet række",

    whyPopupTitle: "5xWhy-træ for valgt årsag",
    standaloneWhyTitle: "Selvstændig 5xWhy",
    standaloneWhyIntro: "Lav en 5xWhy uden først at oprette et fiskeben.",
    standaloneWhyPdfTitle: "Selvstændig 5xWhy",
    standaloneWhyTitleLabel: "Overskrift",
    standaloneWhyTitlePlaceholder: "Skriv overskrift her",
    standaloneWhyEmptyText: "Tilføj første hvorfor for at starte analysen.",
    whyHelpBtnTitle: "Hjælp",
    whyCloseTitle: "Luk",
    addRootWhy: "+ Tilføj hvorfor (øverste niveau)",
    whySave: "Gem & luk",
    whyCancel: "Luk uden at gemme",

    why: "Hvorfor",
    whyPlaceholder: "Hvorfor?",
    addSubWhy: "+ Under-hvorfor",

    causeTitle: "Årsag:",
    unknown: "Ukendt",
    causesListTitle: "Liste over alle årsager (grupperet efter ben/M)",
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
    pageKicker: "ROPEX-verktøy",
    pageSubtitle: "Årsaksanalyse, 5xWhy og oppfølgingstiltak samlet på ett sted.",
    navFishbone: "Fiskebein",
    navWhy: "5xWhy",
    navAction: "Tiltak",

    helpBtnTitle: "Få hjelp til å komme i gang!",
    closeHelpTitle: "Lukk hjelp",
    helpTitle: "Hjelp til Fiskebein ROPEX",
    helpItem1: "Klikk hvor som helst på fiskebeinet for å legge til en årsak.",
    helpItem2: "Dra og slipp for å flytte årsaker.",
    helpItem3: "Dobbeltklikk på en boks for å redigere. Klikk på × for å slette en årsak.",
    helpItem4: "Klikk på 5xWHY-ikonet på en årsak - eller bruk 5xWhy-knappen øverst hvis du bare vil lage en 5xWhy uten fiskebein.",
    helpItem5: "Bruk “Endre M’er / bein” for å endre antall bein og navnene på beina. Skriv antall bein fra 1-8, endre tekstene og trykk Lagre.",
    helpItem8: "Bruk oppgavetabellen under diagrammet til å skrive dato, oppgave, hvem og ROPEX nr.",
    helpItem9: "Bruk Angre for å gå ett trinn tilbake hvis du kommer til å slette, flytte eller endre noe.",
    helpItem6: "Du kan lagre og åpne prosjekter som .json-filer.",
    helpItem7: "«Lagre alt som PDF» lager en PDF med diagram, 5xWhy-trær, oppgavetabell og M-liste.",
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
    deleteCause: "Slett årsak",
    deleteCauseConfirm: "Vil du slette denne årsaken?",

    savePdf: "Lagre alt som PDF",
    saveProject: "Lagre prosjekt",
    openProject: "Åpne prosjekt",
    undo: "Angre",
    undoTitle: "Angre siste endring",
    categorySettings: "Endre M’er / bein",
    categoryPopupTitle: "Endre M’er / bein",
    categoryCountLabel: "Antall bein",
    categoryFieldLabel: "Bein",
    categorySave: "Lagre",
    categoryReset: "Tilbake til 6 M’er",

    actionTableTitle: "Tiltak / oppgaver",
    actionTableDate: "Dato",
    actionTableTask: "Oppgave",
    actionTableWho: "Hvem",
    actionTableRopex: "ROPEX nr.",
    addActionRow: "+ Legg til oppgave",
    deleteActionRow: "Slett rad",

    whyPopupTitle: "5xWhy-tre for valgt årsak",
    standaloneWhyTitle: "Selvstendig 5xWhy",
    standaloneWhyIntro: "Lag en 5xWhy uten først å opprette et fiskebein.",
    standaloneWhyPdfTitle: "Selvstendig 5xWhy",
    standaloneWhyTitleLabel: "Overskrift",
    standaloneWhyTitlePlaceholder: "Skriv overskrift her",
    standaloneWhyEmptyText: "Legg til første hvorfor for å starte analysen.",
    whyHelpBtnTitle: "Hjelp",
    whyCloseTitle: "Lukk",
    addRootWhy: "+ Legg til hvorfor (øverste nivå)",
    whySave: "Lagre og lukk",
    whyCancel: "Lukk uten å lagre",

    why: "Hvorfor",
    whyPlaceholder: "Hvorfor?",
    addSubWhy: "+ Legg til under-hvorfor",

    causeTitle: "Årsak:",
    unknown: "Ukjent",
    causesListTitle: "Liste over alle årsaker (gruppert etter bein/M)",
    m1: "Metode",
    m2: "Maskin",
    m3: "Miljø",
    m4: "Menneske",
    m5: "Måling",
    m6: "Materiale"
  },
  en: {
    pageTitle: "Fishbone ROPEX",
    appTitle: "Fishbone ROPEX",
    pageKicker: "ROPEX tool",
    pageSubtitle: "Root cause analysis, 5xWhy and follow-up actions in one place.",
    navFishbone: "Fishbone",
    navWhy: "5xWhy",
    navAction: "Actions",

    helpBtnTitle: "Help getting started",
    closeHelpTitle: "Close help",
    helpTitle: "Help for Fishbone ROPEX",
    helpItem1: "Click anywhere on the fishbone to add a cause.",
    helpItem2: "Drag and drop to move causes.",
    helpItem3: "Double-click a box to edit it. Click × to delete a cause.",
    helpItem4: "Click the 5xWHY icon on a cause — or use the 5xWhy button at the top if you only want to create a 5xWhy without a fishbone.",
    helpItem5: "Use “Edit M’s / bones” to change the number of bones and their names. Enter 1–8 bones, edit the texts and press Save.",
    helpItem8: "Use the action table below the diagram to enter date, task, responsible person and ROPEX no.",
    helpItem9: "Use Undo to go one step back if you delete, move or change something by mistake.",
    helpItem6: "You can save and open projects as .json files.",
    helpItem7: "“Save all as PDF” creates a PDF with the diagram, 5xWhy trees, action table and M-list.",
    helpFooter: "Thank you for using Fishbone ROPEX!",

    whyHelpTitle: "Help for 5xWhy",
    whyHelpItem1: "Start with the most obvious explanation (Why 1).",
    whyHelpItem2: "Use “+ Sub-why” to go deeper (Why 1.1, 1.1.1 etc.).",
    whyHelpItem3: "Write briefly and concretely in each box.",
    whyHelpItem4: "Stop when you have a cause you can act on (not necessarily exactly 5).",
    whyHelpItem5: "The dot can be used to mark the most important branch.",

    problemPlaceholder: "Write the problem here",
    problemTitle: "Write the problem here",

    causePlaceholder: "Write cause here",
    addCause: "Add",
    cancel: "Cancel",
    deleteCause: "Delete cause",
    deleteCauseConfirm: "Do you want to delete this cause?",

    savePdf: "Save all as PDF",
    saveProject: "Save project",
    openProject: "Open project",
    undo: "Undo",
    undoTitle: "Undo latest change",
    categorySettings: "Edit M’s / bones",
    categoryPopupTitle: "Edit M’s / bones",
    categoryCountLabel: "Number of bones",
    categoryFieldLabel: "Bone",
    categorySave: "Save",
    categoryReset: "Back to 6 M’s",

    actionTableTitle: "Actions / tasks",
    actionTableDate: "Date",
    actionTableTask: "Task",
    actionTableWho: "Who",
    actionTableRopex: "ROPEX no.",
    addActionRow: "+ Add task",
    deleteActionRow: "Delete row",

    whyPopupTitle: "5xWhy tree for selected cause",
    standaloneWhyTitle: "Standalone 5xWhy",
    standaloneWhyIntro: "Create a 5xWhy without first creating a fishbone.",
    standaloneWhyPdfTitle: "Standalone 5xWhy",
    standaloneWhyTitleLabel: "Title",
    standaloneWhyTitlePlaceholder: "Write title here",
    standaloneWhyEmptyText: "Add the first why to start the analysis.",
    whyHelpBtnTitle: "Help",
    whyCloseTitle: "Close",
    addRootWhy: "+ Add why (top level)",
    whySave: "Save & close",
    whyCancel: "Close without saving",

    why: "Why",
    whyPlaceholder: "Why?",
    addSubWhy: "+ Sub-why",

    causeTitle: "Cause:",
    unknown: "Unknown",
    causesListTitle: "List of all causes (grouped by bone/M)",
    m1: "Method",
    m2: "Machine",
    m3: "Environment",
    m4: "Manpower",
    m5: "Measurement",
    m6: "Material"
  }
};

let currentLanguage = "da";

const LANGUAGE_ORDER = ["da", "no", "en"];

function normalizeLanguage(lang) {
  return LANGUAGE_ORDER.includes(lang) ? lang : "da";
}

function getNextLanguage(lang) {
  const safeLang = normalizeLanguage(lang);
  const index = LANGUAGE_ORDER.indexOf(safeLang);
  return LANGUAGE_ORDER[(index + 1) % LANGUAGE_ORDER.length];
}

function t(key) {
  currentLanguage = normalizeLanguage(currentLanguage);
  return I18N[currentLanguage]?.[key] || I18N.da?.[key] || key;
}

function applyLanguage() {
  const savePdfBtn = document.getElementById("savePdfBtn");
  const saveProjectBtn = document.getElementById("saveProjectBtn");
  const undoBtn = document.getElementById("undoBtn");
  const openProjectBtn = document.getElementById("openProjectBtn");
  const whySavePdfBtn = document.getElementById("whySavePdfBtn");
  const whySaveProjectBtn = document.getElementById("whySaveProjectBtn");
  const whyUndoBtn = document.getElementById("whyUndoBtn");
  const whyOpenProjectBtn = document.getElementById("whyOpenProjectBtn");
  const categorySettingsBtn = document.getElementById("categorySettingsBtn");
  const categoryPopupTitle = document.getElementById("categoryPopupTitle");
  const categoryCountLabel = document.getElementById("categoryCountLabel");
  const categorySaveBtn = document.getElementById("categorySaveBtn");
  const categoryResetBtn = document.getElementById("categoryResetBtn");
  const categoryCancelBtn = document.getElementById("categoryCancelBtn");
  const categoryPopupCloseBtn = document.getElementById("categoryPopupCloseBtn");
  const addCauseBtn = document.getElementById("addCauseBtn");
  const cancelCauseBtn = document.getElementById("cancelCauseBtn");
  const popupText = document.getElementById("popupText");
  const languageToggle = document.getElementById("languageToggle");
  const navFishboneBtn = document.getElementById("navFishboneBtn");
  const navWhyBtn = document.getElementById("navWhyBtn");
  const navActionBtn = document.getElementById("navActionBtn");

  const actionTableTitle = document.getElementById("actionTableTitle");
  const actionHeaderDate = document.getElementById("actionHeaderDate");
  const actionHeaderTask = document.getElementById("actionHeaderTask");
  const actionHeaderWho = document.getElementById("actionHeaderWho");
  const actionHeaderRopex = document.getElementById("actionHeaderRopex");
  const addActionRowBtn = document.getElementById("addActionRowBtn");

  const helpBtn = document.getElementById("helpBtn");
  const closeHelpBtn = document.getElementById("closeHelpBtn");
  const helpTitle = document.getElementById("helpTitle");
  const helpItem1 = document.getElementById("helpItem1");
  const helpItem2 = document.getElementById("helpItem2");
  const helpItem3 = document.getElementById("helpItem3");
  const helpItem4 = document.getElementById("helpItem4");
  const helpItem5 = document.getElementById("helpItem5");
  const helpItem6 = document.getElementById("helpItem6");
  const helpItem7 = document.getElementById("helpItem7");
  const helpItem8 = document.getElementById("helpItem8");
  const helpItem9 = document.getElementById("helpItem9");
  const helpFooter = document.getElementById("helpFooter");

  const appTitle = document.getElementById("appTitle");
  const pageKicker = document.getElementById("pageKicker");
  const pageSubtitle = document.getElementById("pageSubtitle");
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
  const standaloneWhyHeading = document.getElementById("standaloneWhyHeading");
  const standaloneWhyTitleLabel = document.getElementById("standaloneWhyTitleLabel");
  const standaloneWhyTitleInput = document.getElementById("standaloneWhyTitleInput");
  const standaloneAddRootWhyBtn = document.getElementById("standaloneAddRootWhyBtn");
  const standaloneWhyHelpBtn = document.getElementById("standaloneWhyHelpBtn");

  [savePdfBtn, whySavePdfBtn].forEach(btn => { if (btn) btn.textContent = t("savePdf"); });
  [saveProjectBtn, whySaveProjectBtn].forEach(btn => { if (btn) btn.textContent = t("saveProject"); });
  [openProjectBtn, whyOpenProjectBtn].forEach(btn => { if (btn) btn.textContent = t("openProject"); });
  [undoBtn, whyUndoBtn].forEach(btn => {
    if (btn) {
      btn.textContent = t("undo");
      btn.title = t("undoTitle");
    }
  });
  if (categorySettingsBtn) categorySettingsBtn.textContent = t("categorySettings");
  if (navFishboneBtn) navFishboneBtn.textContent = t("navFishbone");
  if (navWhyBtn) navWhyBtn.textContent = t("navWhy");
  if (navActionBtn) navActionBtn.textContent = t("navAction");

  if (actionTableTitle) actionTableTitle.textContent = t("actionTableTitle");
  if (actionHeaderDate) actionHeaderDate.textContent = t("actionTableDate");
  if (actionHeaderTask) actionHeaderTask.textContent = t("actionTableTask");
  if (actionHeaderWho) actionHeaderWho.textContent = t("actionTableWho");
  if (actionHeaderRopex) actionHeaderRopex.textContent = t("actionTableRopex");
  if (addActionRowBtn) addActionRowBtn.textContent = t("addActionRow");
  document.querySelectorAll(".delete-action-row-btn").forEach(btn => {
    btn.title = t("deleteActionRow");
    btn.setAttribute("aria-label", t("deleteActionRow"));
  });
  if (categoryPopupTitle) categoryPopupTitle.textContent = t("categoryPopupTitle");
  if (categoryCountLabel) categoryCountLabel.textContent = t("categoryCountLabel");
  if (categorySaveBtn) categorySaveBtn.textContent = t("categorySave");
  if (categoryResetBtn) categoryResetBtn.textContent = t("categoryReset");
  if (categoryCancelBtn) categoryCancelBtn.textContent = t("cancel");
  if (categoryPopupCloseBtn) categoryPopupCloseBtn.title = t("whyCloseTitle");

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
  if (helpItem7) helpItem7.textContent = t("helpItem7");
  if (helpItem8) helpItem8.textContent = t("helpItem8");
  if (helpItem9) helpItem9.textContent = t("helpItem9");
  if (helpFooter) helpFooter.textContent = t("helpFooter");

  if (appTitle) appTitle.textContent = t("appTitle");
  if (pageKicker) pageKicker.textContent = t("pageKicker");
  if (pageSubtitle) pageSubtitle.textContent = t("pageSubtitle");

  if (problemBox) {
    problemBox.setAttribute("data-placeholder", t("problemPlaceholder"));
    problemBox.setAttribute("title", t("problemTitle"));

    if (problemBox.classList.contains("placeholder")) {
      problemBox.textContent = t("problemPlaceholder");
      adjustProblemBoxSize();
    }
  }

  if (whyHelpTitle) whyHelpTitle.textContent = t("whyHelpTitle");
  if (whyHelpItem1) whyHelpItem1.textContent = t("whyHelpItem1");
  if (whyHelpItem2) whyHelpItem2.textContent = t("whyHelpItem2");
  if (whyHelpItem3) whyHelpItem3.textContent = t("whyHelpItem3");
  if (whyHelpItem4) whyHelpItem4.textContent = t("whyHelpItem4");
  if (whyHelpItem5) whyHelpItem5.textContent = t("whyHelpItem5");

  if (whyTreeTitle) whyTreeTitle.textContent = (typeof whyTreeMode !== "undefined" && whyTreeMode === "standalone") ? t("standaloneWhyTitle") : t("whyPopupTitle");
  if (whyHelpBtn) whyHelpBtn.title = t("whyHelpBtnTitle");
  if (whyTreeCloseBtn) whyTreeCloseBtn.title = t("whyCloseTitle");
  if (addRootWhyBtn) addRootWhyBtn.textContent = t("addRootWhy");
  if (whyTreeSaveBtn) whyTreeSaveBtn.textContent = t("whySave");
  if (whyTreeCancelBtn) whyTreeCancelBtn.textContent = t("whyCancel");
  if (standaloneWhyHeading) standaloneWhyHeading.textContent = t("standaloneWhyTitle");
  if (standaloneWhyTitleLabel) standaloneWhyTitleLabel.textContent = t("standaloneWhyTitleLabel");
  if (standaloneWhyTitleInput) {
    standaloneWhyTitleInput.setAttribute("data-placeholder", t("standaloneWhyTitlePlaceholder"));
    standaloneWhyTitleInput.setAttribute("title", t("standaloneWhyTitlePlaceholder"));
    if (standaloneWhyTitleInput.classList.contains("placeholder")) {
      standaloneWhyTitleInput.textContent = t("standaloneWhyTitlePlaceholder");
    }
  }
  if (standaloneAddRootWhyBtn) standaloneAddRootWhyBtn.textContent = t("addRootWhy");
  if (standaloneWhyHelpBtn) standaloneWhyHelpBtn.title = t("whyHelpBtnTitle");

  if (languageToggle) {
    const languageLabels = { da: "DK", no: "NO", en: "EN" };
    const nextLanguage = getNextLanguage(currentLanguage);
    const nextLanguageNames = { da: "dansk", no: "norsk", en: "English" };

    languageToggle.textContent = languageLabels[currentLanguage] || "DK";
    languageToggle.title =
      currentLanguage === "en"
        ? "Switch to Danish"
        : `Skift til ${nextLanguageNames[nextLanguage] || "næste sprog"}`;
  }

  document.title = t("pageTitle");

  drawFishbone();

  document.querySelectorAll("#causes .causeBox").forEach((div) => {
    div.setAttribute("data-placeholder", t("causePlaceholder"));

    const deleteBtn = div.querySelector(".delete-cause-btn");
    if (deleteBtn) {
      deleteBtn.title = t("deleteCause");
      deleteBtn.setAttribute("aria-label", t("deleteCause"));
    }

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

  const categoryPopup = document.getElementById("categoryPopup");
  if (categoryPopup && !categoryPopup.classList.contains("hidden")) {
    renderCategoryFields();
  }

  if (typeof renderStandaloneAndAutoSizeTree === "function") {
    renderStandaloneAndAutoSizeTree();
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
let whyTreeMode = "cause";
let standaloneWhyTree = [];
let standaloneWhyTitle = "";
window.whyTree = [];

const MAX_UNDO_STEPS = 30;
let undoStack = [];
let isRestoringUndo = false;
let problemUndoSnapshot = null;

const dragState = {
  active: false,
  target: null,
  startMouseX: 0,
  startMouseY: 0,
  startLeft: 0,
  startTop: 0,
  moved: false,
  undoSnapshot: null
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
// Fortryd / Angre
// =====================================================
function refreshUndoButton() {
  document.querySelectorAll("#undoBtn, #whyUndoBtn").forEach(btn => {
    btn.disabled = undoStack.length === 0;
  });
}

function pushUndoSnapshot(snapshot) {
  if (isRestoringUndo || !snapshot) return;

  const serialized = JSON.stringify(snapshot);
  const last = undoStack.length ? JSON.stringify(undoStack[undoStack.length - 1]) : null;
  if (serialized === last) return;

  undoStack.push(deepClone(snapshot));
  if (undoStack.length > MAX_UNDO_STEPS) undoStack.shift();
  refreshUndoButton();
}

function pushUndoState() {
  if (typeof buildProjectData !== "function") return;
  pushUndoSnapshot(buildProjectData());
}

function setProblemTextFromData(text) {
  const txt = String(text || "");
  if (!problemBox) return;

  if (!txt.trim()) {
    problemBox.classList.add("placeholder");
    problemBox.textContent = problemBox.getAttribute("data-placeholder") || t("problemPlaceholder");
    problemBox.style.height = `${PROBLEM_BOX_DEFAULT_HEIGHT}px`;
    adjustProblemBoxSize();
  } else {
    problemBox.classList.remove("placeholder");
    problemBox.textContent = txt;
    adjustProblemBoxSize();
  }
}

function restoreProjectData(data) {
  const restored = migrateProjectData(data);

  currentLanguage = normalizeLanguage(restored.language || "da");
  categoryCount = normalizeCategoryCount(restored.categoryCount || 6);
  categoryNames = Array.isArray(restored.categoryNames) ? restored.categoryNames.slice(0, categoryCount) : null;

  standaloneWhyTitle = typeof restored.standaloneWhyTitle === "string" ? restored.standaloneWhyTitle : "";
  standaloneWhyTree = Array.isArray(restored.standaloneWhyTree) ? deepClone(restored.standaloneWhyTree) : [];
  setStandaloneWhyTitleText(standaloneWhyTitle);
  renderStandaloneAndAutoSizeTree();

  setProblemTextFromData(restored.problem || "");

  causesDiv.innerHTML = "";
  if (Array.isArray(restored.causes)) {
    restored.causes.forEach((cause) => {
      const div = createCauseBox({
        x: cause.x || 0,
        y: cause.y || 0,
        text: cause.text || "",
        whyTree: Array.isArray(cause.whyTree) ? cause.whyTree : [],
        categoryIndex: cause.categoryIndex
      });
      causesDiv.appendChild(div);
    });
  }

  setActionRows(restored.actions || []);
  applyLanguage();
  document.querySelectorAll("#causes .causeBox").forEach(div => {
    if (getStoredCategoryIndex(div) === null) updateCauseCategoryFromPosition(div);
  });
  refreshUndoButton();
}

function undoLastChange() {
  if (!undoStack.length) return;

  const snapshot = undoStack.pop();
  isRestoringUndo = true;
  try {
    restoreProjectData(snapshot);
  } finally {
    isRestoringUndo = false;
    refreshUndoButton();
  }
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

  const standaloneWhyHelpBtn = document.getElementById("standaloneWhyHelpBtn");

  if (standaloneWhyHelpBtn && whyHelpOverlay) {
    standaloneWhyHelpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      whyHelpOverlay.classList.remove("hidden");
    });
  }

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
// Ret M'er / ben
// =====================================================
function renderCategoryFields() {
  const categoryFields = document.getElementById("categoryFields");
  const categoryCountInput = document.getElementById("categoryCountInput");
  if (!categoryFields || !categoryCountInput) return;

  const rawCountValue = categoryCountInput.value.trim();
  const oldInputValues = Array.from(categoryFields.querySelectorAll(".category-name-input")).map(input => input.value);

  // Lad feltet være midlertidigt tomt, mens man skriver et nyt tal.
  // Ellers hopper det tilbage til fx 8, når man sletter tallet først.
  if (rawCountValue === "") {
    categoryFields.innerHTML = "";
    return;
  }

  const count = normalizeCategoryCount(rawCountValue);
  if (String(count) !== rawCountValue) categoryCountInput.value = String(count);
  categoryFields.innerHTML = "";

  const currentNames = getMNames();

  for (let i = 0; i < count; i++) {
    const row = document.createElement("label");
    row.className = "category-field-row";

    const label = document.createElement("span");
    label.textContent = `${t("categoryFieldLabel")} ${i + 1}`;
    row.appendChild(label);

    const input = document.createElement("input");
    input.type = "text";
    input.className = "category-name-input";
    input.value = oldInputValues[i] ?? currentNames[i] ?? getCategoryFallbackName(i);
    input.maxLength = 30;
    row.appendChild(input);

    categoryFields.appendChild(row);
  }
}

function openCategorySettings() {
  const popup = document.getElementById("categoryPopup");
  const backdrop = document.getElementById("categoryPopupBackdrop");
  const countInput = document.getElementById("categoryCountInput");
  if (!popup || !backdrop || !countInput) return;

  countInput.value = String(categoryCount);
  renderCategoryFields();

  popup.classList.remove("hidden");
  backdrop.classList.remove("hidden");
}

function closeCategorySettings() {
  const popup = document.getElementById("categoryPopup");
  const backdrop = document.getElementById("categoryPopupBackdrop");
  if (popup) popup.classList.add("hidden");
  if (backdrop) backdrop.classList.add("hidden");
}

function saveCategorySettings() {
  const countInput = document.getElementById("categoryCountInput");
  if (!countInput) return;

  const undoSnapshot = buildProjectData();
  const capturedAnchors = captureCauseCategoryAnchors();

  const count = normalizeCategoryCount(countInput.value.trim() || categoryCount);
  const inputs = Array.from(document.querySelectorAll("#categoryFields .category-name-input"));
  const names = inputs.slice(0, count).map((input, index) => {
    return input.value.trim() || getCategoryFallbackName(index);
  });

  setCategoryNames(names, count);
  drawFishbone();
  moveCausesWithChangedBones(capturedAnchors);

  if (JSON.stringify(undoSnapshot) !== JSON.stringify(buildProjectData())) {
    pushUndoSnapshot(undoSnapshot);
  }

  closeCategorySettings();
}

function resetCategorySettings() {
  const undoSnapshot = buildProjectData();
  const capturedAnchors = captureCauseCategoryAnchors();

  categoryCount = 6;
  categoryNames = null;
  drawFishbone();
  moveCausesWithChangedBones(capturedAnchors);

  if (JSON.stringify(undoSnapshot) !== JSON.stringify(buildProjectData())) {
    pushUndoSnapshot(undoSnapshot);
  }

  closeCategorySettings();
}

// =====================================================
// Tegn fiskeben
// =====================================================

function getBoneBaseX(index, countOnSide) {
  if (countOnSide <= 1) return (rygX0 + rygX1) / 2;

  // Fast afstand giver et mere roligt layout, når der er færre/flere ben end 6.
  // 3 ben pr. side svarer til det oprindelige 6M-layout.
  let startX = rygX0;
  let endX = rygX1;

  if (countOnSide === 2) {
    startX = rygX0 + 85;
    endX = rygX1 - 85;
  }

  if (countOnSide >= 4) {
    startX = rygX0 - 50;
    endX = rygX1 - 40;
  }

  return startX + index * ((endX - startX) / (countOnSide - 1));
}

function drawFishbone() {
  const ishikawa = document.getElementById("ishikawa");
  if (!ishikawa) return;

  const mNames = getMNames();
  const layout = getCategoryLayout(mNames.length);

  const labelFontSize = mNames.length >= 7 ? 26 : 28;

  let svgBones = "";
  svgBones += `<line x1="${rygX0 - 283}" y1="${rygY}" x2="${rygX1 + 13}" y2="${rygY}" stroke="black" stroke-width="10" />`;
  svgBones += `<polygon points="${rygX1 + 14},${rygY - 14} ${rygX1 + 74},${rygY} ${rygX1 + 14},${rygY + 14}" fill="crimson"/>`;

  layout.top.forEach((catIndex, sideIndex) => {
    const xBase = getBoneBaseX(sideIndex, layout.top.length);
    const x2top = xBase - boneLen * Math.cos(boneAngle);
    const y2top = rygY - boneLen * Math.sin(boneAngle);

    svgBones += `<line x1="${xBase}" y1="${rygY}" x2="${x2top}" y2="${y2top}" stroke="black" stroke-width="6"/>`;
    svgBones += `<text data-cat-index="${catIndex}" x="${x2top}" y="${y2top - 20}" text-anchor="middle" font-size="${labelFontSize}" font-weight="bold" fill="#283c6c">${escapeHTML(mNames[catIndex])}</text>`;
  });

  layout.bottom.forEach((catIndex, sideIndex) => {
    const xBase = getBoneBaseX(sideIndex, layout.bottom.length);
    const x2bot = xBase - boneLen * Math.cos(boneAngle);
    const y2bot = rygY + boneLen * Math.sin(boneAngle);

    svgBones += `<line x1="${xBase}" y1="${rygY}" x2="${x2bot}" y2="${y2bot}" stroke="black" stroke-width="6"/>`;
    svgBones += `<text data-cat-index="${catIndex}" x="${x2bot}" y="${y2bot + 38}" text-anchor="middle" font-size="${labelFontSize}" font-weight="bold" fill="#283c6c">${escapeHTML(mNames[catIndex])}</text>`;
  });

  ishikawa.innerHTML = svgBones;
}

// =====================================================
// Problem-boks
// =====================================================
function sanitizeProblemBox() {
  const txt = problemBox.innerText;
  problemBox.textContent = txt;
}

const PROBLEM_BOX_CENTER_X = 561;
const PROBLEM_BOX_MIN_WIDTH = 520;
const PROBLEM_BOX_MAX_WIDTH = 860;
const PROBLEM_BOX_DEFAULT_HEIGHT = 46;
const PROBLEM_BOX_OFFSET_GAP = 4;
const PROBLEM_BOX_OFFSET_SCALE = 0.5;
let currentFishboneOffsetY = 0;

function getProblemBoxTextForLayout() {
  if (!problemBox || problemBox.classList.contains("placeholder")) return "";
  return sanitizeTextContent(problemBox.innerText || problemBox.textContent || "");
}

function estimateProblemBoxTextWidth() {
  if (!problemBox) return PROBLEM_BOX_MIN_WIDTH;

  const text = getProblemBoxTextForLayout();
  if (!text.trim()) return PROBLEM_BOX_MIN_WIDTH;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return PROBLEM_BOX_MIN_WIDTH;

  const computed = window.getComputedStyle(problemBox);
  ctx.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;

  const lines = text.split(/\n+/).filter(Boolean);
  const widest = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
  return Math.min(PROBLEM_BOX_MAX_WIDTH, Math.max(PROBLEM_BOX_MIN_WIDTH, Math.ceil(widest + 48)));
}

function getFishboneYOffset() {
  if (!problemBox) return 0;
  const height = parseFloat(problemBox.style.height) || problemBox.offsetHeight || PROBLEM_BOX_DEFAULT_HEIGHT;
  const extraHeight = Math.max(0, height - PROBLEM_BOX_DEFAULT_HEIGHT);
  if (!extraHeight) return 0;
  return Math.max(0, Math.round((extraHeight * PROBLEM_BOX_OFFSET_SCALE) + PROBLEM_BOX_OFFSET_GAP));
}

function getCauseBaseY(div) {
  if (!div) return 0;
  const stored = parseFloat(div.dataset.baseY);
  if (Number.isFinite(stored)) return stored;

  const visualTop = parseFloat(div.style.top) || 0;
  const baseY = visualTop - currentFishboneOffsetY;
  div.dataset.baseY = String(baseY);
  return baseY;
}

function setCauseBaseY(div, baseY) {
  if (!div) return;
  const safeBase = Number.isFinite(baseY) ? baseY : 0;
  div.dataset.baseY = String(safeBase);
  div.style.top = px(safeBase + currentFishboneOffsetY);
}

function applyFishboneVerticalOffset() {
  const newOffset = getFishboneYOffset();

  document.querySelectorAll("#causes .causeBox").forEach(div => {
    const baseY = getCauseBaseY(div);
    div.style.top = px(baseY + newOffset);
  });

  currentFishboneOffsetY = newOffset;

  const svg = document.getElementById("fishboneSvg");
  if (svg) {
    svg.style.transform = currentFishboneOffsetY ? `translateY(${currentFishboneOffsetY}px)` : "";
  }
}

function adjustProblemBoxSize() {
  if (!problemBox) return;

  const targetWidth = estimateProblemBoxTextWidth();
  problemBox.style.width = `${targetWidth}px`;
  problemBox.style.left = `${Math.round(PROBLEM_BOX_CENTER_X - (targetWidth / 2))}px`;

  problemBox.style.height = "auto";
  const nextHeight = Math.max(PROBLEM_BOX_DEFAULT_HEIGHT, problemBox.scrollHeight);
  problemBox.style.height = `${nextHeight}px`;
  applyFishboneVerticalOffset();
}

function initProblemBox() {
  if (!problemBox) return;

  problemBox.addEventListener("focus", () => {
    problemUndoSnapshot = typeof buildProjectData === "function" ? buildProjectData() : null;

    if (problemBox.classList.contains("placeholder")) {
      problemBox.textContent = "";
      problemBox.classList.remove("placeholder");
    }
  });

  problemBox.addEventListener("blur", () => {
    const before = problemUndoSnapshot;

    sanitizeProblemBox();
    if (problemBox.textContent.trim() === "") {
      problemBox.classList.add("placeholder");
      problemBox.textContent = problemBox.getAttribute("data-placeholder");
      problemBox.style.height = `${PROBLEM_BOX_DEFAULT_HEIGHT}px`;
      adjustProblemBoxSize();
    } else {
      adjustProblemBoxSize();
    }

    if (before && JSON.stringify(before) !== JSON.stringify(buildProjectData())) {
      pushUndoSnapshot(before);
    }
    problemUndoSnapshot = null;
  });

  problemBox.addEventListener("input", adjustProblemBoxSize);

  if (problemBox.textContent.trim() === "") {
    problemBox.classList.add("placeholder");
    problemBox.textContent = problemBox.getAttribute("data-placeholder");
    problemBox.style.height = `${PROBLEM_BOX_DEFAULT_HEIGHT}px`;
    adjustProblemBoxSize();
  } else {
    adjustProblemBoxSize();
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

function getStoredCategoryIndex(div) {
  if (!div || !div.dataset) return null;
  const index = parseInt(div.dataset.categoryIndex, 10);
  if (Number.isNaN(index)) return null;
  if (index < 0 || index >= categoryCount) return null;
  return index;
}

function getMCatFromPos(div) {
  if (!div) return null;

  const mNames = getMNames();
  const storedIndex = getStoredCategoryIndex(div);
  if (storedIndex !== null) return mNames[storedIndex] || null;

  const positions = getMLabelPositionData();
  if (!positions.length) return null;

  const index = getNearestCategoryIndexForBox(div, positions);
  if (index !== null) {
    div.dataset.categoryIndex = String(index);
    return mNames[index] || null;
  }

  return null;
}

function getMLabelPositionData() {
  const diagramRect = getDiagramRect();
  const mNames = getMNames();

  return Array.from(document.querySelectorAll("#ishikawa text")).map((txt, fallbackIndex) => {
    const rect = txt.getBoundingClientRect();
    const attrIndex = parseInt(txt.getAttribute("data-cat-index"), 10);
    const index = Number.isNaN(attrIndex) ? fallbackIndex : attrIndex;
    const centerY = rect.top + (rect.height / 2) - diagramRect.top;

    return {
      index,
      name: mNames[index] || "",
      side: centerY < (diagramRect.height / 2) ? "top" : "bottom",
      x: rect.left + (rect.width / 2) - diagramRect.left,
      y: centerY
    };
  }).sort((a, b) => a.index - b.index);
}

function getNearestCategoryIndexForBox(div, positions) {
  if (!div || !positions.length) return 0;

  const diagramRect = getDiagramRect();
  const rect = div.getBoundingClientRect();
  const centerX = rect.left + (rect.width / 2) - diagramRect.left;
  const boxTop = rect.top - diagramRect.top;
  const preferredSide = boxTop < (diagramRect.height / 2) ? "top" : "bottom";

  let candidates = positions.filter(pos => pos.side === preferredSide);
  if (!candidates.length) candidates = positions;

  let nearest = candidates[0];
  let nearestDist = Math.abs(centerX - nearest.x);

  for (let i = 1; i < candidates.length; i++) {
    const dist = Math.abs(centerX - candidates[i].x);
    if (dist < nearestDist) {
      nearest = candidates[i];
      nearestDist = dist;
    }
  }

  return nearest.index;
}

function updateCauseCategoryFromPosition(div) {
  const positions = getMLabelPositionData();
  if (!positions.length || !div) return;
  div.dataset.categoryIndex = String(getNearestCategoryIndexForBox(div, positions));
}

function getFallbackCategoryIndexForRemovedBone(item, newPositions) {
  if (!item || !newPositions.length) return 0;

  let candidates = newPositions.filter(pos => pos.side === item.side);
  if (!candidates.length) candidates = newPositions;

  let nearest = candidates[0];
  let nearestDist = Math.abs(item.anchorX - nearest.x);

  for (let i = 1; i < candidates.length; i++) {
    const dist = Math.abs(item.anchorX - candidates[i].x);
    if (dist < nearestDist) {
      nearest = candidates[i];
      nearestDist = dist;
    }
  }

  return nearest.index;
}


function captureCauseCategoryAnchors() {
  const positions = getMLabelPositionData();
  if (!positions.length) return [];

  return Array.from(document.querySelectorAll("#causes .causeBox")).map(div => {
    const storedIndex = getStoredCategoryIndex(div);
    const index = storedIndex !== null ? storedIndex : getNearestCategoryIndexForBox(div, positions);
    const anchor = positions.find(pos => pos.index === index) || positions[0];

    div.dataset.categoryIndex = String(index);

    return {
      div,
      index,
      side: anchor.side,
      anchorX: anchor.x,
      anchorY: anchor.y
    };
  });
}

function moveCausesWithChangedBones(capturedAnchors) {
  if (!Array.isArray(capturedAnchors) || !capturedAnchors.length) return;

  const newPositions = getMLabelPositionData();
  if (!newPositions.length) return;

  capturedAnchors.forEach(item => {
    if (!item.div || !causesDiv.contains(item.div)) return;

    let targetIndex = item.index;
    let newAnchor = newPositions.find(pos => pos.index === targetIndex);

    if (!newAnchor) {
      targetIndex = getFallbackCategoryIndexForRemovedBone(item, newPositions);
      newAnchor = newPositions.find(pos => pos.index === targetIndex) || newPositions[newPositions.length - 1];
    }

    const dx = newAnchor.x - item.anchorX;
    const dy = newAnchor.y - item.anchorY;

    const rect = item.div.getBoundingClientRect();
    const currentLeft = parseInt(item.div.style.left, 10) || 0;
    const currentBaseTop = getCauseBaseY(item.div);

    item.div.style.left = px(clamp(currentLeft + dx, 0, DIAGRAM_W - rect.width));
    setCauseBaseY(item.div, clamp(currentBaseTop + dy, 0, DIAGRAM_H - rect.height - currentFishboneOffsetY));
    item.div.dataset.categoryIndex = String(targetIndex);
  });
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
  const deleteBtn = clone.querySelector(".delete-cause-btn");
  if (deleteBtn) deleteBtn.remove();
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

function addDeleteCauseButton(div) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "delete-cause-btn";
  btn.title = t("deleteCause");
  btn.setAttribute("aria-label", t("deleteCause"));
  btn.textContent = "×";

  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (!window.confirm(t("deleteCauseConfirm"))) return;

    pushUndoState();

    const editInput = document.querySelector(".edit-cause-input");
    if (editInput) editInput.remove();

    if (currentWhyBox === div && typeof closeWhyTreePopup === "function") {
      closeWhyTreePopup(false);
    }

    div.remove();
  });

  div.appendChild(btn);
}

function createCauseBox({ x, y, text = "", whyTree = [], categoryIndex = null }) {
  const div = document.createElement("div");
  div.className = "causeBox";
  div.style.left = px(x);
  div.dataset.baseY = String(y || 0);
  div.style.top = px((y || 0) + currentFishboneOffsetY);
  div.title = "Dobbeltklik for at redigere";
  div._whyTree = Array.isArray(whyTree) ? deepClone(whyTree) : [];

  const parsedCategoryIndex = parseInt(categoryIndex, 10);
  if (!Number.isNaN(parsedCategoryIndex) && parsedCategoryIndex >= 0 && parsedCategoryIndex < categoryCount) {
    div.dataset.categoryIndex = String(parsedCategoryIndex);
  }

  const span = document.createElement("span");
  span.className = "causeText";
  span.textContent = text;
  div.appendChild(span);

  addDeleteCauseButton(div);
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

  const undoSnapshot = buildProjectData();
  const originalText = getCauseText(div);
  let editSaved = false;

  const rect = div.getBoundingClientRect();
  const textarea = document.createElement("textarea");
  textarea.className = "edit-cause-input";
  textarea.value = originalText;

  textarea.style.left = `${window.scrollX + rect.left}px`;
  textarea.style.top = `${window.scrollY + rect.top}px`;
  textarea.style.width = `${rect.width}px`;
  textarea.style.height = `${Math.max(rect.height, 100)}px`;

  function saveEdit() {
    if (editSaved) return;
    editSaved = true;

    const val = sanitizeTextContent(textarea.value);
    if (val && val !== originalText) {
      pushUndoSnapshot(undoSnapshot);
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
  clickCoords.y = clamp(clientY - diagramRect.top - currentFishboneOffsetY, 0, DIAGRAM_H - 120);

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

  pushUndoState();
  causesDiv.appendChild(div);
  updateCauseCategoryFromPosition(div);
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
  dragState.startTop = getCauseBaseY(div);
  dragState.moved = false;
  dragState.undoSnapshot = buildProjectData();
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
  const newTop = clamp(dragState.startTop + dy, 0, DIAGRAM_H - height - currentFishboneOffsetY);

  target.style.left = px(newLeft);
  setCauseBaseY(target, newTop);
}

function onMouseUp() {
  const moved = dragState.active && dragState.moved;
  const undoSnapshot = dragState.undoSnapshot;
  const target = dragState.target;

  dragState.active = false;
  dragState.target = null;
  dragState.undoSnapshot = null;

  if (moved && target) {
    updateCauseCategoryFromPosition(target);
    pushUndoSnapshot(undoSnapshot);
  }
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
    if (e.target.closest(".delete-cause-btn")) return;

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


function getStandaloneWhyTitleText() {
  const titleInput = document.getElementById("standaloneWhyTitleInput");
  if (titleInput && !titleInput.classList.contains("placeholder")) {
    return sanitizeTextContent(titleInput.textContent || "");
  }
  return sanitizeTextContent(standaloneWhyTitle || "");
}

function setStandaloneWhyTitleText(text) {
  standaloneWhyTitle = sanitizeTextContent(text || "");
  const titleInput = document.getElementById("standaloneWhyTitleInput");
  if (!titleInput) return;

  const placeholder = t("standaloneWhyTitlePlaceholder");

  if (!standaloneWhyTitle.trim()) {
    titleInput.classList.add("placeholder");
    titleInput.textContent = placeholder;
  } else {
    titleInput.classList.remove("placeholder");
    titleInput.textContent = standaloneWhyTitle;
  }
}

function initStandaloneWhyTitle() {
  const titleInput = document.getElementById("standaloneWhyTitleInput");
  if (!titleInput) return;

  setStandaloneWhyTitleText(standaloneWhyTitle);

  let undoSnapshot = null;

  titleInput.addEventListener("focus", () => {
    undoSnapshot = buildProjectData();

    if (titleInput.classList.contains("placeholder")) {
      titleInput.classList.remove("placeholder");
      titleInput.textContent = "";
    }
  });

  titleInput.addEventListener("blur", () => {
    const before = undoSnapshot;
    standaloneWhyTitle = sanitizeTextContent(titleInput.textContent || "");
    setStandaloneWhyTitleText(standaloneWhyTitle);

    if (before && JSON.stringify(before) !== JSON.stringify(buildProjectData())) {
      pushUndoSnapshot(before);
    }

    undoSnapshot = null;
  });

  titleInput.addEventListener("input", () => {
    standaloneWhyTitle = titleInput.classList.contains("placeholder") ? "" : sanitizeTextContent(titleInput.textContent || "");
  });
}

function autoSizeAllStandaloneWhyTextareas() {
  const root = document.getElementById("standaloneTree5whyRoot");
  if (!root) return;
  root.querySelectorAll(".tree5why-textarea").forEach(autoSizeTA);
}

function renderStandaloneWhyTree(tree, parentEl, parentPath = []) {
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
        const before = buildProjectData();
        node.selectedAction = !node.selectedAction;
        renderStandaloneAndAutoSizeTree();
        pushUndoSnapshot(before);
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

    let undoSnapshot = null;

    inp.addEventListener("focus", () => {
      undoSnapshot = buildProjectData();
      document.querySelectorAll(".tree5why-node.selected").forEach(el => el.classList.remove("selected"));
      nodeDiv.classList.add("selected");
    });

    inp.addEventListener("input", () => {
      node.q = inp.value;
      autoSizeTA(inp);
    });

    inp.addEventListener("blur", () => {
      node.q = sanitizeTextContent(inp.value || "");
      inp.value = node.q;
      autoSizeTA(inp);

      if (undoSnapshot && JSON.stringify(undoSnapshot) !== JSON.stringify(buildProjectData())) {
        pushUndoSnapshot(undoSnapshot);
      }
      undoSnapshot = null;
    });

    line.appendChild(inp);

    const actionsInline = document.createElement("div");

    const addBtn = document.createElement("button");
    addBtn.className = "tree5why-btn add";
    addBtn.type = "button";
    addBtn.textContent = t("addSubWhy");
    addBtn.addEventListener("click", () => {
      const before = buildProjectData();
      node.children = node.children || [];
      node.children.push({ q: "", children: [] });
      renderStandaloneAndAutoSizeTree();
      pushUndoSnapshot(before);
    });
    actionsInline.appendChild(addBtn);

    const canDelete = !(node.children && node.children.length > 0);
    const delBtn = document.createElement("button");
    delBtn.className = "tree5why-btn del";
    delBtn.type = "button";
    delBtn.textContent = "✕";
    delBtn.disabled = !canDelete;
    delBtn.setAttribute("aria-disabled", canDelete ? "false" : "true");
    delBtn.addEventListener("click", () => {
      if (!canDelete) return;
      const before = buildProjectData();
      tree.splice(idx, 1);
      renderStandaloneAndAutoSizeTree();
      pushUndoSnapshot(before);
    });
    actionsInline.appendChild(delBtn);

    line.appendChild(actionsInline);
    right.appendChild(line);
    nodeDiv.appendChild(right);

    if (node.children && node.children.length > 0) {
      const subTree = document.createElement("div");
      subTree.className = "tree5why-children";
      renderStandaloneWhyTree(node.children, subTree, path);
      nodeDiv.appendChild(subTree);
    }

    parentEl.appendChild(nodeDiv);
  });
}

function renderStandaloneAndAutoSizeTree() {
  const root = document.getElementById("standaloneTree5whyRoot");
  if (!root) return;
  renderStandaloneWhyTree(standaloneWhyTree, root);
  requestAnimationFrame(autoSizeAllStandaloneWhyTextareas);
}

function addStandaloneRootWhy() {
  const before = buildProjectData();
  standaloneWhyTree.push({ q: "", children: [] });
  renderStandaloneAndAutoSizeTree();
  pushUndoSnapshot(before);
}

function showToolPage(pageName) {
  const fishbonePage = document.getElementById("fishbonePage");
  const standalonePage = document.getElementById("standaloneWhyPage");
  const navFishboneBtn = document.getElementById("navFishboneBtn");
  const navWhyBtn = document.getElementById("navWhyBtn");
  const navActionBtn = document.getElementById("navActionBtn");
  const categorySettingsBtn = document.getElementById("categorySettingsBtn");

  const showStandalone = pageName === "why";

  if (fishbonePage) fishbonePage.classList.toggle("hidden", showStandalone);
  if (standalonePage) standalonePage.classList.toggle("hidden", !showStandalone);

  if (navFishboneBtn) navFishboneBtn.classList.toggle("active", pageName === "fishbone");
  if (navWhyBtn) navWhyBtn.classList.toggle("active", pageName === "why");
  if (navActionBtn) navActionBtn.classList.toggle("active", pageName === "action");

  if (categorySettingsBtn) {
    categorySettingsBtn.style.display = showStandalone ? "none" : "inline-flex";
  }

  if (showStandalone) {
    setStandaloneWhyTitleText(standaloneWhyTitle);
    renderStandaloneAndAutoSizeTree();
    standalonePage?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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

function showWhyTreePopup() {
  renderAndAutoSizeTree();

  const popup = document.getElementById("whyTreePopup");
  const backdrop = document.getElementById("whyTreeBackdrop");
  if (popup) popup.classList.remove("hidden");
  if (backdrop) backdrop.classList.remove("hidden");

  requestAnimationFrame(autoSizeAllWhyTextareas);
}

function openWhyTreeForBox(boxDiv) {
  currentWhyBox = boxDiv;
  whyTreeMode = "cause";

  const titleEl = document.getElementById("whyTreeTitle");
  if (titleEl) titleEl.textContent = t("whyPopupTitle");

  const causeText = getCauseText(boxDiv);
  const causeEl = document.getElementById("whyTreeCause");
  if (causeEl) causeEl.textContent = causeText;

  window.whyTree = boxDiv._whyTree ? deepClone(boxDiv._whyTree) : [];
  showWhyTreePopup();
}

function openStandaloneWhyTree() {
  currentWhyBox = null;
  whyTreeMode = "standalone";
  showToolPage("why");
}

function closeWhyTreePopup(save) {
  const popup = document.getElementById("whyTreePopup");
  const backdrop = document.getElementById("whyTreeBackdrop");

  if (save) {
    const before = buildProjectData();
    const newTree = JSON.stringify(window.whyTree || []);

    if (currentWhyBox) {
      const oldTree = JSON.stringify(currentWhyBox._whyTree || []);
      currentWhyBox._whyTree = deepClone(window.whyTree);
      updateWhyIcon(currentWhyBox);

      if (oldTree !== newTree) {
        pushUndoSnapshot(before);
      }
    } else if (whyTreeMode === "standalone") {
      const oldTree = JSON.stringify(standaloneWhyTree || []);
      standaloneWhyTree = deepClone(window.whyTree);

      if (oldTree !== newTree) {
        pushUndoSnapshot(before);
      }
    }
  }

  currentWhyBox = null;
  whyTreeMode = "cause";
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
// Tiltagstabel
// =====================================================
function autoSizeActionInput(input) {
  if (!input) return;
  input.style.height = "auto";
  input.style.height = `${Math.max(42, input.scrollHeight)}px`;
}

function autoSizeAllActionInputs() {
  document.querySelectorAll("#actionTableBody .action-cell-input").forEach(autoSizeActionInput);
}

function normalizeDateForInput(value) {
  const txt = sanitizeTextContent(value || "");
  if (!txt) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;

  const match = txt.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  return "";
}

function formatDateForDisplay(value) {
  const txt = sanitizeTextContent(value || "");
  const match = txt.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return txt;
}

function createActionInput(field, value, extraClass = "") {
  const isDate = field === "date";
  const input = isDate ? document.createElement("input") : document.createElement("textarea");

  input.className = `action-cell-input ${extraClass}`.trim();
  input.dataset.field = field;

  if (isDate) {
    input.type = "date";
    input.value = normalizeDateForInput(value);
    input.title = currentLanguage === "no" ? "Velg dato" : (currentLanguage === "en" ? "Choose date" : "Vælg dato");
  } else {
    input.value = value || "";
    input.rows = 1;
  }

  let undoSnapshot = null;

  input.addEventListener("focus", () => {
    undoSnapshot = buildProjectData();
  });

  input.addEventListener("input", () => {
    if (!isDate) autoSizeActionInput(input);
  });

  input.addEventListener("blur", () => {
    const before = undoSnapshot;

    if (!isDate) {
      input.value = sanitizeTextContent(input.value);
      autoSizeActionInput(input);
    }

    if (before && JSON.stringify(before) !== JSON.stringify(buildProjectData())) {
      pushUndoSnapshot(before);
    }
    undoSnapshot = null;
  });

  return input;
}

function createActionRow(row = {}) {
  const tr = document.createElement("tr");

  const fields = [
    ["date", row.date, "action-date-input"],
    ["task", row.task, "action-task-input"],
    ["who", row.who, "action-who-input"],
    ["ropex", row.ropex, "action-ropex-input"]
  ];

  fields.forEach(([field, value, className]) => {
    const td = document.createElement("td");
    const input = createActionInput(field, value, className);
    td.appendChild(input);
    tr.appendChild(td);
  });

  const deleteTd = document.createElement("td");
  deleteTd.className = "action-delete-cell";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-action-row-btn";
  deleteBtn.title = t("deleteActionRow");
  deleteBtn.setAttribute("aria-label", t("deleteActionRow"));
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", () => {
    pushUndoState();
    tr.remove();
    const body = document.getElementById("actionTableBody");
    if (body && body.children.length === 0) {
      addActionRow();
    }
  });

  deleteTd.appendChild(deleteBtn);
  tr.appendChild(deleteTd);

  requestAnimationFrame(() => {
    tr.querySelectorAll(".action-cell-input").forEach(autoSizeActionInput);
  });

  return tr;
}

function addActionRow(row = {}) {
  const body = document.getElementById("actionTableBody");
  if (!body) return;
  body.appendChild(createActionRow(row));
}

function getActionRows() {
  return Array.from(document.querySelectorAll("#actionTableBody tr")).map(tr => {
    const getValue = (field) => {
      const input = tr.querySelector(`[data-field="${field}"]`);
      return sanitizeTextContent(input ? input.value : "");
    };

    return {
      date: getValue("date"),
      task: getValue("task"),
      who: getValue("who"),
      ropex: getValue("ropex")
    };
  });
}

function getFilledActionRows() {
  return getActionRows().filter(row => {
    return row.date || row.task || row.who || row.ropex;
  });
}

function setActionRows(rows) {
  const body = document.getElementById("actionTableBody");
  if (!body) return;

  body.innerHTML = "";

  if (Array.isArray(rows) && rows.length > 0) {
    rows.forEach(row => addActionRow(row));
  } else {
    addActionRow();
  }

  requestAnimationFrame(autoSizeAllActionInputs);
}

function initActionTable() {
  const addActionRowBtn = document.getElementById("addActionRowBtn");
  if (addActionRowBtn) {
    addActionRowBtn.addEventListener("click", () => {
      pushUndoState();
      addActionRow();
    });
  }

  const body = document.getElementById("actionTableBody");
  if (body && body.children.length === 0) {
    addActionRow();
  }
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
    const storedIndex = getStoredCategoryIndex(div);
    causes.push({
      x: parseInt(div.style.left, 10) || 0,
      y: Math.round(getCauseBaseY(div)),
      text: getCauseText(div),
      categoryIndex: storedIndex !== null ? storedIndex : getNearestCategoryIndexForBox(div, getMLabelPositionData()),
      whyTree: Array.isArray(div._whyTree) ? deepClone(div._whyTree) : []
    });
  });

  const problemText = problemBox.classList.contains("placeholder")
    ? ""
    : (problemBox.innerText || problemBox.textContent);

  return {
    appVersion: 8,
    language: normalizeLanguage(currentLanguage),
    analysisType: "fishbone",
    categoryPreset: categoryNames ? "fishbone_custom" : "fishbone_6m",
    categoryCount: categoryCount,
    categoryNames: Array.isArray(categoryNames) ? deepClone(categoryNames) : null,
    problem: problemText,
    causes,
    standaloneWhyTitle: getStandaloneWhyTitleText(),
    standaloneWhyTree: Array.isArray(standaloneWhyTree) ? deepClone(standaloneWhyTree) : [],
    actions: getActionRows()
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
          categoryIndex: Number.isInteger(cause.categoryIndex) ? cause.categoryIndex : null,
          whyTree: Array.isArray(cause.whyTree) ? cause.whyTree : []
        }))
      : [];

    cloned.appVersion = 2;
  }

  if (cloned.appVersion < 3) {
    cloned.categoryCount = 6;
    cloned.categoryNames = null;
    cloned.appVersion = 3;
  }

  if (cloned.appVersion < 4) {
    cloned.actions = [];
    cloned.appVersion = 4;
  }

  if (cloned.appVersion < 5) {
    cloned.appVersion = 5;
  }

  if (cloned.appVersion < 6) {
    cloned.causes = Array.isArray(cloned.causes)
      ? cloned.causes.map(cause => ({
          ...cause,
          categoryIndex: Number.isInteger(cause.categoryIndex) ? cause.categoryIndex : null
        }))
      : [];

    cloned.appVersion = 6;
  }

  if (cloned.appVersion < 7) {
    cloned.standaloneWhyTree = [];
    cloned.appVersion = 7;
  }

  cloned.categoryCount = normalizeCategoryCount(cloned.categoryCount || 6);
  cloned.categoryNames = Array.isArray(cloned.categoryNames)
    ? cloned.categoryNames.slice(0, cloned.categoryCount).map((name, index) => String(name || "").trim() || getCategoryFallbackName(index))
    : null;

  cloned.causes = Array.isArray(cloned.causes)
    ? cloned.causes.map(cause => {
        const rawIndex = parseInt(cause && cause.categoryIndex, 10);
        const categoryIndex = !Number.isNaN(rawIndex) && rawIndex >= 0 && rawIndex < cloned.categoryCount
          ? rawIndex
          : null;

        return {
          x: cause && cause.x || 0,
          y: cause && cause.y || 0,
          text: sanitizeTextContent(cause && cause.text),
          categoryIndex,
          whyTree: Array.isArray(cause && cause.whyTree) ? cause.whyTree : []
        };
      })
    : [];

  cloned.actions = Array.isArray(cloned.actions)
    ? cloned.actions.map(row => ({
        date: sanitizeTextContent(row && row.date),
        task: sanitizeTextContent(row && row.task),
        who: sanitizeTextContent(row && row.who),
        ropex: sanitizeTextContent(row && row.ropex)
      }))
    : [];

  cloned.standaloneWhyTree = Array.isArray(cloned.standaloneWhyTree)
    ? deepClone(cloned.standaloneWhyTree)
    : [];

  if (cloned.appVersion < 8) {
    cloned.standaloneWhyTitle = "";
    cloned.appVersion = 8;
  }

  cloned.standaloneWhyTitle = typeof cloned.standaloneWhyTitle === "string"
    ? sanitizeTextContent(cloned.standaloneWhyTitle)
    : "";

  return cloned;
}

function loadProjectFromFile(file) {
  const reader = new FileReader();

  reader.onload = function (ev) {
    try {
      const rawData = JSON.parse(ev.target.result);
      const data = migrateProjectData(rawData);

      pushUndoState();
      restoreProjectData(data);

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

  const unknownLabel = t("unknown");
  categories[unknownLabel] = [];

  document.querySelectorAll("#causes .causeBox").forEach(div => {
    const cat = getMCatFromPos(div);
    const safeCat = categories[cat] ? cat : unknownLabel;
    categories[safeCat].push(getCauseText(div));
  });

  const listTitle = t("causesListTitle");

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
  page.style.display = "block";
  page.style.margin = "0";
  page.style.padding = "0";
  page.style.width = `${DIAGRAM_W}px`;
  page.style.height = `${DIAGRAM_H}px`;
  page.style.minWidth = `${DIAGRAM_W}px`;
  page.style.minHeight = `${DIAGRAM_H}px`;
  page.style.maxWidth = `${DIAGRAM_W}px`;
  page.style.maxHeight = `${DIAGRAM_H}px`;
  page.style.boxSizing = "border-box";
  page.style.background = "#fff";
  page.style.overflow = "hidden";
  page.style.breakInside = "avoid";
  page.style.pageBreakInside = "avoid";
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
    nodeDiv.style.background = node.selectedAction ? "#edf3ff" : "#fff";

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
      dot.style.background = node.selectedAction ? "#e30613" : "#bdd2ee";
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

function buildWhyBilagPageFromTree(titleText, treeData) {
  const page = makePdfPage();

  const inner = document.createElement("div");
  inner.style.boxSizing = "border-box";
  inner.style.width = `${DIAGRAM_W}px`;
  inner.style.height = `${DIAGRAM_H}px`;
  inner.style.padding = "24px 28px";
  inner.style.background = "#fff";
  inner.style.overflow = "hidden";

  const title = document.createElement("div");
  title.textContent = titleText;
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

  renderWhyTreeForPdf(Array.isArray(treeData) ? treeData : [], treeContent, [], options);

  const measureWrap = document.createElement("div");
  measureWrap.style.position = "fixed";
  measureWrap.style.left = "-30000px";
  measureWrap.style.top = "0";
  measureWrap.style.background = "#fff";
  measureWrap.appendChild(treeContent);
  document.body.appendChild(measureWrap);

  const rect = treeContent.getBoundingClientRect();
  const contentW = Math.max(1, Math.ceil(rect.width), treeContent.scrollWidth);
  const contentH = Math.max(1, Math.ceil(rect.height), treeContent.scrollHeight);

  const availableWidth = treeViewport.clientWidth || (DIAGRAM_W - 56);
  const availableHeight = treeViewport.clientHeight || (DIAGRAM_H - 80);

  const scale = Math.min(
    availableWidth / contentW,
    availableHeight / contentH,
    1
  );

  treeContent.style.width = `${contentW}px`;
  treeContent.style.height = `${contentH}px`;
  treeContent.style.transform = `scale(${scale})`;

  measureWrap.remove();

  treeViewport.appendChild(treeContent);
  inner.appendChild(treeViewport);
  page.appendChild(inner);

  return page;
}

function buildWhyBilagPage(boxDiv, index) {
  const titleText = `${t("causeTitle")} ${getCauseText(boxDiv) || `#${index + 1}`}`;
  const treeData = Array.isArray(boxDiv._whyTree) ? boxDiv._whyTree : [];
  return buildWhyBilagPageFromTree(titleText, treeData);
}

function buildStandaloneWhyPdfPage() {
  const title = getStandaloneWhyTitleText() || t("standaloneWhyPdfTitle");
  return buildWhyBilagPageFromTree(title, standaloneWhyTree);
}

function buildFishbonePdfPage() {
  if (typeof adjustProblemBoxSize === "function") {
    adjustProblemBoxSize();
  }

  const page = makePdfPage();
  const clone = document.getElementById("diagramArea").cloneNode(true);

  // Brug den stabile PDF-visning igen: selve diagrammet lægges 1:1 ind på siden.
  // Den tidligere ekstra skalering gav stor tom topmargen i nogle browsere.
  clone.style.position = "relative";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.margin = "0";
  clone.style.width = `${DIAGRAM_W}px`;
  clone.style.height = `${DIAGRAM_H}px`;
  clone.style.border = "none";
  clone.style.boxShadow = "none";
  clone.style.overflow = "hidden";
  clone.style.background = "#fff";
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";

  clone.querySelectorAll(".why-icon, .delete-cause-btn").forEach(el => el.remove());

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


function buildActionPlanPdfPages() {
  // PDF'en skal altid have siden med Tiltag / opgaver med.
  // Derfor bruger vi alle rækker fra tabellen og falder tilbage til en tom række,
  // hvis der endnu ikke er skrevet noget.
  let rows = getActionRows();
  rows = rows.length ? rows : [{ date: "", task: "", who: "", ropex: "" }];

  const hasContent = rows.some(row => row.date || row.task || row.who || row.ropex);
  if (!hasContent && rows.length < 4) {
    while (rows.length < 4) rows.push({ date: "", task: "", who: "", ropex: "" });
  }

  const pages = [];
  const rowsPerPage = 10;

  for (let start = 0; start < rows.length; start += rowsPerPage) {
    const chunk = rows.slice(start, start + rowsPerPage);
    const page = makePdfPage();

    const inner = document.createElement("div");
    inner.style.boxSizing = "border-box";
    inner.style.width = `${DIAGRAM_W}px`;
    inner.style.height = `${DIAGRAM_H}px`;
    inner.style.padding = "34px 48px";
    inner.style.background = "#fff";
    inner.style.fontSize = "16px";
    inner.style.overflow = "hidden";

    const title = document.createElement("div");
    title.textContent = t("actionTableTitle");
    title.style.textAlign = "center";
    title.style.fontSize = "24px";
    title.style.fontWeight = "bold";
    title.style.color = "#253c7c";
    title.style.marginBottom = "18px";
    inner.appendChild(title);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.tableLayout = "fixed";
    table.style.fontSize = "15px";

    const colgroup = document.createElement("colgroup");
    ["14%", "48%", "18%", "20%"].forEach(width => {
      const col = document.createElement("col");
      col.style.width = width;
      colgroup.appendChild(col);
    });
    table.appendChild(colgroup);

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    [t("actionTableDate"), t("actionTableTask"), t("actionTableWho"), t("actionTableRopex")].forEach(label => {
      const th = document.createElement("th");
      th.textContent = label;
      th.style.border = "1px solid #333";
      th.style.background = "#111";
      th.style.color = "#fff";
      th.style.fontWeight = "bold";
      th.style.textAlign = "center";
      th.style.padding = "12px 8px";
      th.style.fontSize = "16px";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    chunk.forEach(row => {
      const tr = document.createElement("tr");
      [formatDateForDisplay(row.date), row.task, row.who, row.ropex].forEach(value => {
        const td = document.createElement("td");
        td.textContent = value || "";
        td.style.border = "1px solid #333";
        td.style.padding = "12px 10px";
        td.style.verticalAlign = "top";
        td.style.whiteSpace = "pre-wrap";
        td.style.overflowWrap = "anywhere";
        td.style.wordBreak = "break-word";
        td.style.minHeight = "48px";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    inner.appendChild(table);

    if (rows.length > rowsPerPage) {
      const pageNote = document.createElement("div");
      pageNote.textContent = `${Math.floor(start / rowsPerPage) + 1} / ${Math.ceil(rows.length / rowsPerPage)}`;
      pageNote.style.textAlign = "right";
      pageNote.style.fontSize = "12px";
      pageNote.style.color = "#666";
      pageNote.style.marginTop = "10px";
      inner.appendChild(pageNote);
    }

    page.appendChild(inner);
    pages.push(page);
  }

  return pages;
}


function setupHeaderNavigation() {
  const navFishboneBtn = document.getElementById("navFishboneBtn");
  const navWhyBtn = document.getElementById("navWhyBtn");
  const navActionBtn = document.getElementById("navActionBtn");

  if (navFishboneBtn) {
    navFishboneBtn.addEventListener("click", () => {
      showToolPage("fishbone");
      const diagram = document.getElementById("diagramArea");
      if (diagram) diagram.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (navWhyBtn) {
    navWhyBtn.addEventListener("click", () => {
      openStandaloneWhyTree();
    });
  }

  if (navActionBtn) {
    navActionBtn.addEventListener("click", () => {
      [navFishboneBtn, navWhyBtn, navActionBtn].forEach(btn => {
        if (btn) btn.classList.toggle("active", btn === navActionBtn);
      });

      const section = document.getElementById("actionTableSection");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}



function treeHasTextForPdf(nodes) {
  if (!Array.isArray(nodes)) return false;

  return nodes.some(node => {
    const text = sanitizeTextContent((node && node.q) || "").trim();
    return !!text || treeHasTextForPdf((node && node.children) || []);
  });
}

function isPlaceholderStandaloneTitle(title) {
  const safeTitle = sanitizeTextContent(title || "").trim();
  if (!safeTitle) return true;

  return [
    I18N.da?.standaloneWhyTitlePlaceholder,
    I18N.no?.standaloneWhyTitlePlaceholder,
    I18N.en?.standaloneWhyTitlePlaceholder
  ].some(value => safeTitle === value);
}

function hasFishboneContentForPdf() {
  const problemText = problemBox && !problemBox.classList.contains("placeholder")
    ? sanitizeTextContent(problemBox.textContent || "")
    : "";
  return !!problemText.trim() || document.querySelectorAll("#causes .causeBox").length > 0;
}

function hasCausesForPdf() {
  return document.querySelectorAll("#causes .causeBox").length > 0;
}

function hasStandaloneWhyForPdf() {
  const title = getStandaloneWhyTitleText();
  const hasRealTitle = !!title.trim() && !isPlaceholderStandaloneTitle(title);
  return hasRealTitle || treeHasTextForPdf(standaloneWhyTree);
}

function getPdfJsPDFClass() {
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  if (window.jsPDF) return window.jsPDF;
  return null;
}

function buildPdfPages() {
  const pages = [];

  if (hasFishboneContentForPdf()) {
    pages.push(buildFishbonePdfPage());
  }

  if (hasStandaloneWhyForPdf()) {
    pages.push(buildStandaloneWhyPdfPage());
  }

  const whyBoxes = Array.from(document.querySelectorAll("#causes .causeBox"))
    .filter(div => treeHasTextForPdf(div._whyTree));

  whyBoxes.forEach((div, index) => {
    pages.push(buildWhyBilagPage(div, index));
  });

  buildActionPlanPdfPages().forEach(page => pages.push(page));

  if (hasCausesForPdf()) {
    pages.push(buildCausesListPdfPage());
  }

  if (!pages.length) {
    pages.push(buildFishbonePdfPage());
  }

  pages.forEach((page) => {
    page.style.display = "block";
    page.style.margin = "0";
    page.style.padding = "0";
    page.style.width = `${DIAGRAM_W}px`;
    page.style.height = `${DIAGRAM_H}px`;
    page.style.minWidth = `${DIAGRAM_W}px`;
    page.style.minHeight = `${DIAGRAM_H}px`;
    page.style.maxWidth = `${DIAGRAM_W}px`;
    page.style.maxHeight = `${DIAGRAM_H}px`;
    page.style.boxSizing = "border-box";
    page.style.overflow = "hidden";
    page.style.background = "#fff";
  });

  return pages;
}


function getPdfOptions(filename) {
  return {
    margin: 0,
    filename: filename || "fiskeben.pdf",
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
}

function createPdfRenderMount(page) {
  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-30000px";
  mount.style.top = "0";
  mount.style.width = `${DIAGRAM_W}px`;
  mount.style.height = `${DIAGRAM_H}px`;
  mount.style.background = "#fff";
  mount.style.overflow = "hidden";
  mount.style.pointerEvents = "none";

  page.style.display = "block";
  page.style.margin = "0";
  page.style.padding = "0";
  page.style.width = `${DIAGRAM_W}px`;
  page.style.height = `${DIAGRAM_H}px`;
  page.style.minWidth = `${DIAGRAM_W}px`;
  page.style.minHeight = `${DIAGRAM_H}px`;
  page.style.maxWidth = `${DIAGRAM_W}px`;
  page.style.maxHeight = `${DIAGRAM_H}px`;
  page.style.boxSizing = "border-box";
  page.style.overflow = "hidden";
  page.style.background = "#fff";

  mount.appendChild(page);
  document.body.appendChild(mount);
  return mount;
}

function waitForPdfLayout() {
  return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

async function pageToCanvasWithHtml2Pdf(page) {
  const mount = createPdfRenderMount(page);

  try {
    await waitForPdfLayout();

    // Brug html2pdf/html2canvas gennem samme stabile flow for alle sider.
    // Direkte html2canvas på en fixed mount gav forskydning nedad i PDF'en.
    const worker = html2pdf()
      .set(getPdfOptions())
      .from(page)
      .toCanvas();

    const canvas = await worker.get("canvas");
    return canvas;
  } finally {
    mount.remove();
  }
}

function createPdfDocument(filename) {
  const JsPDF = getPdfJsPDFClass();

  if (JsPDF) {
    return new JsPDF({
      orientation: "landscape",
      unit: "px",
      format: [DIAGRAM_W, DIAGRAM_H],
      compress: true,
      hotfixes: ["px_scaling"]
    });
  }

  return null;
}

async function createBlankPdfWithHtml2Pdf(filename) {
  const blank = makePdfPage();
  const mount = createPdfRenderMount(blank);

  try {
    await waitForPdfLayout();

    const worker = html2pdf()
      .set(getPdfOptions(filename))
      .from(blank)
      .toPdf();

    const pdf = await worker.get("pdf");
    return pdf;
  } finally {
    mount.remove();
  }
}

async function saveAllAsPDF() {
  const oldScrollX = window.scrollX || window.pageXOffset || 0;
  const oldScrollY = window.scrollY || window.pageYOffset || 0;

  try {
    if (typeof adjustProblemBoxSize === "function") {
      adjustProblemBoxSize();
    }

    if (typeof html2pdf !== "function") {
      throw new Error("PDF-biblioteket blev ikke indlæst korrekt.");
    }

    // Nulstil kun vandret scroll under PDF-generering.
    // Det stabile offscreen-render håndterer lodret placering uden at skubbe indholdet ned.
    window.scrollTo(0, oldScrollY);

    const pages = buildPdfPages();

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateString = `${day}-${month}-${year}`;
    const filename = `fiskeben-samlet-${dateString}.pdf`;

    const pdf = await createBlankPdfWithHtml2Pdf(filename);

    for (let i = 0; i < pages.length; i++) {
      const canvas = await pageToCanvasWithHtml2Pdf(pages[i]);
      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      if (i > 0) {
        pdf.addPage([DIAGRAM_W, DIAGRAM_H], "landscape");
      } else {
        pdf.setPage(1);
      }

      pdf.addImage(imgData, "JPEG", 0, 0, DIAGRAM_W, DIAGRAM_H);
    }

    pdf.save(filename);
  } catch (err) {
    console.error(err);
    alert("Der opstod en fejl under PDF-generering. Se konsollen for detaljer.");
  } finally {
    window.scrollTo(oldScrollX, oldScrollY);
  }
}



// =====================================================
// PDF direct renderer - avoids browser screenshot offset issues
// =====================================================
function directPdfRgb(hex) {
  const safe = String(hex || "#000000").replace("#", "");
  const full = safe.length === 3 ? safe.split("").map(ch => ch + ch).join("") : safe.padEnd(6, "0").slice(0, 6);
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function directPdfSetTextColor(pdf, hex) {
  const [r, g, b] = directPdfRgb(hex);
  pdf.setTextColor(r, g, b);
}

function directPdfSetFillColor(pdf, hex) {
  const [r, g, b] = directPdfRgb(hex);
  pdf.setFillColor(r, g, b);
}

function directPdfSetDrawColor(pdf, hex) {
  const [r, g, b] = directPdfRgb(hex);
  pdf.setDrawColor(r, g, b);
}

function directPdfCleanText(value) {
  return sanitizeTextContent(value || "").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
}

function directPdfNewPage(pdf, state) {
  if (state.started) {
    pdf.addPage([DIAGRAM_W, DIAGRAM_H], "landscape");
  } else {
    state.started = true;
  }

  directPdfSetFillColor(pdf, "#ffffff");
  pdf.rect(0, 0, DIAGRAM_W, DIAGRAM_H, "F");
}

function directPdfSplitText(pdf, text, maxWidth) {
  const cleaned = directPdfCleanText(text);
  if (!cleaned) return [];
  const paragraphs = cleaned.split("\n");
  const lines = [];
  paragraphs.forEach((paragraph) => {
    const split = pdf.splitTextToSize(paragraph || " ", maxWidth);
    split.forEach(line => lines.push(line));
  });
  return lines;
}

function directPdfDrawWrappedText(pdf, text, x, y, maxWidth, options = {}) {
  const fontSize = options.fontSize || 14;
  const lineHeight = options.lineHeight || Math.round(fontSize * 1.25);
  const maxLines = options.maxLines || 100;
  pdf.setFont("helvetica", options.fontStyle || "normal");
  pdf.setFontSize(fontSize);
  directPdfSetTextColor(pdf, options.color || "#20375c");

  let lines = directPdfSplitText(pdf, text, maxWidth);
  if (lines.length > maxLines) {
    lines = lines.slice(0, Math.max(1, maxLines));
    lines[lines.length - 1] = String(lines[lines.length - 1]).replace(/\s*$/, "") + "...";
  }

  lines.forEach((line, index) => {
    pdf.text(String(line), x, y + (index * lineHeight));
  });

  return lines.length * lineHeight;
}

function directPdfEstimateTextHeight(pdf, text, maxWidth, fontSize, lineHeight, maxLines = 100) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(fontSize);
  const lines = directPdfSplitText(pdf, text, maxWidth).slice(0, maxLines);
  return Math.max(lineHeight, lines.length * lineHeight);
}

function directPdfDrawBox(pdf, x, y, w, h, text, options = {}) {
  const radius = options.radius ?? 8;
  const fill = options.fill || "#f2f3f5";
  const stroke = options.stroke || "#8b96a8";
  const textColor = options.textColor || "#20375c";
  const fontSize = options.fontSize || 14;
  const fontStyle = options.fontStyle || "bold";
  const padX = options.padX || 10;
  const padY = options.padY || 14;
  const lineHeight = options.lineHeight || Math.round(fontSize * 1.22);

  directPdfSetFillColor(pdf, fill);
  directPdfSetDrawColor(pdf, stroke);
  pdf.setLineWidth(options.lineWidth || 1);
  pdf.roundedRect(x, y, w, h, radius, radius, "FD");

  const maxLines = Math.max(1, Math.floor((h - (padY * 2)) / lineHeight));
  directPdfDrawWrappedText(pdf, text, x + padX, y + padY + fontSize * 0.8, Math.max(20, w - padX * 2), {
    fontSize,
    lineHeight,
    maxLines,
    color: textColor,
    fontStyle
  });
}

function directPdfGetElementBox(el, fallback) {
  if (!el) return fallback;
  const left = parseFloat(el.style.left);
  const top = parseFloat(el.style.top);
  const width = parseFloat(el.style.width);
  const height = parseFloat(el.style.height);

  return {
    x: Number.isFinite(left) ? left : fallback.x,
    y: Number.isFinite(top) ? top : fallback.y,
    w: Number.isFinite(width) ? width : (el.offsetWidth || fallback.w),
    h: Number.isFinite(height) ? height : (el.offsetHeight || fallback.h)
  };
}

function directPdfDrawFishbonePage(pdf, state) {
  directPdfNewPage(pdf, state);

  const mNames = getMNames();
  const layout = getCategoryLayout(mNames.length);
  const labelFontSize = mNames.length >= 7 ? 20 : 22;
  const pdfFishboneOffsetY = currentFishboneOffsetY || 0;

  pdf.setLineCap("butt");
  directPdfSetDrawColor(pdf, "#000000");
  pdf.setLineWidth(10);
  pdf.line(rygX0 - 283, rygY + pdfFishboneOffsetY, rygX1 + 13, rygY + pdfFishboneOffsetY);

  directPdfSetFillColor(pdf, "#dc143c");
  pdf.triangle(rygX1 + 14, rygY + pdfFishboneOffsetY - 14, rygX1 + 74, rygY + pdfFishboneOffsetY, rygX1 + 14, rygY + pdfFishboneOffsetY + 14, "F");

  pdf.setLineWidth(6);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(labelFontSize);
  directPdfSetTextColor(pdf, "#283c6c");

  layout.top.forEach((catIndex, sideIndex) => {
    const xBase = getBoneBaseX(sideIndex, layout.top.length);
    const x2 = xBase - boneLen * Math.cos(boneAngle);
    const y2 = rygY + pdfFishboneOffsetY - boneLen * Math.sin(boneAngle);
    directPdfSetDrawColor(pdf, "#000000");
    pdf.line(xBase, rygY + pdfFishboneOffsetY, x2, y2);
    directPdfSetTextColor(pdf, "#283c6c");
    pdf.text(directPdfCleanText(mNames[catIndex]), x2, y2 - 20, { align: "center" });
  });

  layout.bottom.forEach((catIndex, sideIndex) => {
    const xBase = getBoneBaseX(sideIndex, layout.bottom.length);
    const x2 = xBase - boneLen * Math.cos(boneAngle);
    const y2 = rygY + pdfFishboneOffsetY + boneLen * Math.sin(boneAngle);
    directPdfSetDrawColor(pdf, "#000000");
    pdf.line(xBase, rygY + pdfFishboneOffsetY, x2, y2);
    directPdfSetTextColor(pdf, "#283c6c");
    pdf.text(directPdfCleanText(mNames[catIndex]), x2, y2 + 38, { align: "center" });
  });

  const problemText = problemBox && !problemBox.classList.contains("placeholder")
    ? directPdfCleanText(problemBox.textContent || "")
    : directPdfCleanText(t("problemPlaceholder"));
  const problem = directPdfGetElementBox(problemBox, { x: 301, y: 2, w: 520, h: 48 });
  directPdfDrawBox(pdf, problem.x, problem.y, problem.w, Math.max(54, problem.h), problemText, {
    fill: "#ffffff",
    stroke: "#e30613",
    textColor: problemBox && problemBox.classList.contains("placeholder") ? "#b88086" : "#7b0e14",
    fontSize: 16,
    fontStyle: "bold",
    radius: 10,
    lineWidth: 2,
    padX: 12,
    padY: 12
  });

  Array.from(document.querySelectorAll("#causes .causeBox")).forEach(div => {
    const x = parseFloat(div.style.left);
    const y = parseFloat(div.style.top);
    const w = div.offsetWidth || parseFloat(div.style.width) || 220;
    const h = div.offsetHeight || parseFloat(div.style.height) || 70;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    directPdfDrawBox(pdf, x, y, w, Math.max(44, h), getCauseText(div), {
      fill: "#f2f3f5",
      stroke: "#8b96a8",
      textColor: "#20375c",
      fontSize: 15,
      fontStyle: "bold",
      radius: 8,
      padX: 10,
      padY: 10
    });
  });
}

function directPdfFlattenWhyTree(nodes, depth = 0, path = [], parentId = null, items = []) {
  if (!Array.isArray(nodes)) return items;

  nodes.forEach((node, index) => {
    const currentPath = path.concat(index + 1);
    const text = directPdfCleanText((node && node.q) || "");
    let itemId = parentId;

    if (text) {
      itemId = items.length;
      items.push({
        id: itemId,
        parentId,
        depth,
        label: `${t("why")} ${currentPath.join(".")}`,
        text,
        selectedAction: !!node.selectedAction
      });
    }

    directPdfFlattenWhyTree((node && node.children) || [], depth + 1, currentPath, itemId, items);
  });

  return items;
}

function directPdfDrawWhyPages(pdf, state, titleText, treeData) {
  const items = directPdfFlattenWhyTree(Array.isArray(treeData) ? treeData : []);
  if (!items.length) return;

  const maxDepth = Math.max(1, ...items.map(item => item.depth + 1));
  const marginX = 38;
  const gapX = maxDepth >= 5 ? 18 : 32;
  const nodeW = Math.max(135, Math.min(220, (DIAGRAM_W - marginX * 2 - gapX * (maxDepth - 1)) / maxDepth));
  const fontSize = maxDepth >= 5 ? 9.5 : 11;
  const lineHeight = Math.round(fontSize * 1.25);
  const labelSize = Math.max(7.5, fontSize - 2);
  const maxBoxH = maxDepth >= 5 ? 58 : 70;
  const spacingY = 12;
  const topY = 96;
  const bottomY = DIAGRAM_H - 42;
  const positions = {};
  let y = topY;
  let pageNoForTree = 0;

  function startWhyPage(isContinuation) {
    directPdfNewPage(pdf, state);
    pageNoForTree += 1;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    directPdfSetTextColor(pdf, "#253c7c");
    const shownTitle = isContinuation ? `${titleText} (${pageNoForTree})` : titleText;
    pdf.text(directPdfCleanText(shownTitle), DIAGRAM_W / 2, 54, { align: "center" });
    y = topY;
  }

  startWhyPage(false);

  items.forEach(item => {
    const x = marginX + item.depth * (nodeW + gapX);
    const textHeight = directPdfEstimateTextHeight(pdf, item.text, nodeW - 16, fontSize, lineHeight, 8);
    const boxH = Math.min(maxBoxH, Math.max(30, textHeight + 18));
    const itemH = boxH + 18;

    if (y + itemH > bottomY) {
      startWhyPage(true);
    }

    const labelY = y + labelSize;
    const boxY = y + 14;

    const parent = item.parentId !== null ? positions[item.parentId] : null;
    if (parent && parent.page === pageNoForTree) {
      directPdfSetDrawColor(pdf, "#a5c3f2");
      pdf.setLineWidth(2);
      const startX = parent.x + parent.w;
      const startY = parent.y + parent.h / 2;
      const endX = x - 10;
      const endY = boxY + boxH / 2;
      pdf.line(startX, startY, (startX + endX) / 2, startY);
      pdf.line((startX + endX) / 2, startY, (startX + endX) / 2, endY);
      pdf.line((startX + endX) / 2, endY, endX, endY);
      if (item.selectedAction) {
        directPdfSetFillColor(pdf, "#e30613");
      } else {
        directPdfSetFillColor(pdf, "#bdd2ee");
      }
      pdf.circle(endX + 4, endY, 4, "F");
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(labelSize);
    directPdfSetTextColor(pdf, "#555555");
    pdf.text(directPdfCleanText(item.label), x, labelY);

    directPdfDrawBox(pdf, x, boxY, nodeW, boxH, item.text, {
      fill: item.selectedAction ? "#edf3ff" : "#f6f8ff",
      stroke: "#8899cc",
      textColor: "#20375c",
      fontSize,
      fontStyle: "normal",
      radius: 6,
      padX: 8,
      padY: 7,
      lineWidth: 1
    });

    positions[item.id] = { page: pageNoForTree, x, y: boxY, w: nodeW, h: boxH };
    y += itemH + spacingY;
  });
}

function directPdfDrawActionPages(pdf, state) {
  let rows = getActionRows();
  const hasContent = rows.some(row => row.date || row.task || row.who || row.ropex);

  if (!rows.length) rows = [{ date: "", task: "", who: "", ropex: "" }];
  if (!hasContent) {
    rows = [{ date: "", task: "", who: "", ropex: "" }];
    while (rows.length < 4) rows.push({ date: "", task: "", who: "", ropex: "" });
  }

  const rowsPerPage = 10;
  const colX = [48, 178, 720, 892];
  const colW = [130, 542, 172, 182];
  const rowH = 44;
  const tableY = 112;

  for (let start = 0; start < rows.length; start += rowsPerPage) {
    const chunk = rows.slice(start, start + rowsPerPage);
    directPdfNewPage(pdf, state);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    directPdfSetTextColor(pdf, "#253c7c");
    pdf.text(directPdfCleanText(t("actionTableTitle")), DIAGRAM_W / 2, 72, { align: "center" });

    const headers = [t("actionTableDate"), t("actionTableTask"), t("actionTableWho"), t("actionTableRopex")];
    pdf.setFontSize(13);
    headers.forEach((header, i) => {
      directPdfSetFillColor(pdf, "#111111");
      directPdfSetDrawColor(pdf, "#333333");
      pdf.rect(colX[i], tableY, colW[i], 30, "FD");
      directPdfSetTextColor(pdf, "#ffffff");
      pdf.text(directPdfCleanText(header), colX[i] + colW[i] / 2, tableY + 20, { align: "center" });
    });

    chunk.forEach((row, rowIndex) => {
      const y0 = tableY + 30 + rowIndex * rowH;
      const values = [formatDateForDisplay(row.date), row.task, row.who, row.ropex];
      values.forEach((value, i) => {
        directPdfSetFillColor(pdf, "#ffffff");
        directPdfSetDrawColor(pdf, "#333333");
        pdf.rect(colX[i], y0, colW[i], rowH, "FD");
        directPdfDrawWrappedText(pdf, value || "", colX[i] + 8, y0 + 18, colW[i] - 16, {
          fontSize: 11,
          lineHeight: 13,
          maxLines: 2,
          color: "#222222",
          fontStyle: "normal"
        });
      });
    });

    if (rows.length > rowsPerPage) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      directPdfSetTextColor(pdf, "#666666");
      pdf.text(`${Math.floor(start / rowsPerPage) + 1} / ${Math.ceil(rows.length / rowsPerPage)}`, DIAGRAM_W - 48, DIAGRAM_H - 32, { align: "right" });
    }
  }
}

function directPdfDrawCausesListPage(pdf, state) {
  if (!hasCausesForPdf()) return;

  directPdfNewPage(pdf, state);
  const mNames = getMNames();
  const categories = {};
  mNames.forEach(name => { categories[name] = []; });
  const unknownLabel = t("unknown");
  categories[unknownLabel] = [];

  Array.from(document.querySelectorAll("#causes .causeBox")).forEach(div => {
    const cat = getMCatFromPos(div);
    const safeCat = categories[cat] ? cat : unknownLabel;
    categories[safeCat].push(getCauseText(div));
  });

  let y = 64;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  directPdfSetTextColor(pdf, "#222222");
  pdf.text(directPdfCleanText(t("causesListTitle")), 60, y);
  y += 26;

  Object.keys(categories).forEach(category => {
    if (!categories[category].length) return;
    if (y > DIAGRAM_H - 80) {
      directPdfNewPage(pdf, state);
      y = 64;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    directPdfSetTextColor(pdf, "#253c7c");
    pdf.text(directPdfCleanText(category), 60, y);
    y += 18;

    categories[category].forEach(cause => {
      const text = `- ${directPdfCleanText(cause)}`;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(13);
      directPdfSetTextColor(pdf, "#222222");
      const used = directPdfDrawWrappedText(pdf, text, 74, y, DIAGRAM_W - 140, {
        fontSize: 13,
        lineHeight: 16,
        maxLines: 3,
        color: "#222222",
        fontStyle: "normal"
      });
      y += Math.max(16, used) + 2;
    });
    y += 10;
  });
}

function directPdfBuildFilename() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `fiskeben-samlet-${day}-${month}-${year}.pdf`;
}

async function createDirectPdfDocument(filename) {
  const JsPDF = getPdfJsPDFClass();

  if (JsPDF) {
    return new JsPDF({
      orientation: "landscape",
      unit: "px",
      format: [DIAGRAM_W, DIAGRAM_H],
      compress: true,
      hotfixes: ["px_scaling"]
    });
  }

  // Når siden åbnes lokalt som file://, eksponerer html2pdf-bundlen ikke altid
  // jsPDF direkte på window. Vi kan stadig få en jsPDF-instans gennem html2pdf.
  // html2pdf kan dog starte med en ekstra blank side i nogle browsere, så vi
  // normaliserer dokumentet til præcis én tom side, inden direct renderer tegner.
  if (typeof html2pdf === "function") {
    const pdf = await createBlankPdfWithHtml2Pdf(filename);

    if (pdf && typeof pdf.getNumberOfPages === "function" && typeof pdf.deletePage === "function") {
      for (let pageNo = pdf.getNumberOfPages(); pageNo > 1; pageNo -= 1) {
        pdf.deletePage(pageNo);
      }
    }

    if (pdf && typeof pdf.setPage === "function") {
      pdf.setPage(1);
    }

    return pdf;
  }

  throw new Error("PDF-biblioteket blev ikke indlæst korrekt.");
}

async function saveAllAsPDF() {
  try {
    if (typeof adjustProblemBoxSize === "function") {
      adjustProblemBoxSize();
    }

    const filename = directPdfBuildFilename();
    const pdf = await createDirectPdfDocument(filename);
    const state = { started: false };

    if (hasFishboneContentForPdf()) {
      directPdfDrawFishbonePage(pdf, state);
    }

    if (hasStandaloneWhyForPdf()) {
      const title = getStandaloneWhyTitleText() || t("standaloneWhyPdfTitle");
      directPdfDrawWhyPages(pdf, state, title, standaloneWhyTree);
    }

    Array.from(document.querySelectorAll("#causes .causeBox"))
      .filter(div => treeHasTextForPdf(div._whyTree))
      .forEach((div, index) => {
        const title = `${t("causeTitle")} ${getCauseText(div) || `#${index + 1}`}`;
        directPdfDrawWhyPages(pdf, state, title, div._whyTree);
      });

    directPdfDrawActionPages(pdf, state);
    directPdfDrawCausesListPage(pdf, state);

    if (!state.started) {
      directPdfDrawFishbonePage(pdf, state);
    }

    pdf.save(filename);
  } catch (err) {
    console.error(err);
    alert("Der opstod en fejl under PDF-generering. Se konsollen for detaljer.");
  }
}


function initButtons() {
  const savePdfBtn = document.getElementById("savePdfBtn");
  const saveProjectBtn = document.getElementById("saveProjectBtn");
  const undoBtn = document.getElementById("undoBtn");
  const openProjectBtn = document.getElementById("openProjectBtn");
  const whySavePdfBtn = document.getElementById("whySavePdfBtn");
  const whySaveProjectBtn = document.getElementById("whySaveProjectBtn");
  const whyUndoBtn = document.getElementById("whyUndoBtn");
  const whyOpenProjectBtn = document.getElementById("whyOpenProjectBtn");
  const categorySettingsBtn = document.getElementById("categorySettingsBtn");
  const fileInput = document.getElementById("loadProjectFile");

  if (savePdfBtn) savePdfBtn.addEventListener("click", saveAllAsPDF);
  setupHeaderNavigation();
  if (saveProjectBtn) saveProjectBtn.addEventListener("click", saveProject);
  if (undoBtn) undoBtn.addEventListener("click", undoLastChange);
  if (categorySettingsBtn) categorySettingsBtn.addEventListener("click", openCategorySettings);
  if (openProjectBtn && fileInput) {
    openProjectBtn.addEventListener("click", () => fileInput.click());
  }

  const standaloneAddRootWhyBtn = document.getElementById("standaloneAddRootWhyBtn");

  if (whySavePdfBtn) whySavePdfBtn.addEventListener("click", saveAllAsPDF);
  if (whySaveProjectBtn) whySaveProjectBtn.addEventListener("click", saveProject);
  if (whyUndoBtn) whyUndoBtn.addEventListener("click", undoLastChange);
  if (whyOpenProjectBtn && fileInput) {
    whyOpenProjectBtn.addEventListener("click", () => fileInput.click());
  }
  if (standaloneAddRootWhyBtn) standaloneAddRootWhyBtn.addEventListener("click", addStandaloneRootWhy);
  initStandaloneWhyTitle();

  if (fileInput) {
    fileInput.addEventListener("change", (evt) => {
      const file = evt.target.files && evt.target.files[0];
      if (!file) return;
      loadProjectFromFile(file);
      fileInput.value = "";
    });
  }

  const categoryCountInput = document.getElementById("categoryCountInput");
  const categorySaveBtn = document.getElementById("categorySaveBtn");
  const categoryResetBtn = document.getElementById("categoryResetBtn");
  const categoryCancelBtn = document.getElementById("categoryCancelBtn");
  const categoryPopupCloseBtn = document.getElementById("categoryPopupCloseBtn");
  const categoryPopupBackdrop = document.getElementById("categoryPopupBackdrop");

  if (categoryCountInput) categoryCountInput.addEventListener("input", renderCategoryFields);
  if (categorySaveBtn) categorySaveBtn.addEventListener("click", saveCategorySettings);
  if (categoryResetBtn) categoryResetBtn.addEventListener("click", resetCategorySettings);
  if (categoryCancelBtn) categoryCancelBtn.addEventListener("click", closeCategorySettings);
  if (categoryPopupCloseBtn) categoryPopupCloseBtn.addEventListener("click", closeCategorySettings);
  if (categoryPopupBackdrop) categoryPopupBackdrop.addEventListener("click", closeCategorySettings);

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
    languageToggle.textContent = ({ da: "DK", no: "NO", en: "EN" }[currentLanguage] || "DK");

    languageToggle.addEventListener("click", () => {
      currentLanguage = getNextLanguage(currentLanguage);
      applyLanguage();
    });
  }

  applyLanguage();
}

const languageSelect = document.getElementById("languageSelect");
if (languageSelect) {
  languageSelect.value = currentLanguage;
  languageSelect.addEventListener("change", () => {
    currentLanguage = normalizeLanguage(languageSelect.value);
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
  initActionTable();
  renderStandaloneAndAutoSizeTree();
  initButtons();
  initDiagramInteractions();
  refreshUndoButton();
});