// === Utils ===
function escapeHTML(str) {
  return (str || "").replace(/&/g,"&amp;")
                    .replace(/</g,"&lt;")
                    .replace(/>/g,"&gt;")
                    .replace(/"/g,"&quot;");
}

// === Help overlay (fiskeben) ===
document.addEventListener('DOMContentLoaded', () => {
  const helpBtn = document.getElementById('helpBtn');
  const helpOverlay = document.getElementById('helpOverlay');
  const closeHelpBtn = document.querySelector('#helpOverlay .closeHelp');
  if (!helpBtn || !helpOverlay || !closeHelpBtn) return;

  helpBtn.addEventListener('click', (e) => {e.stopPropagation(); helpOverlay.classList.toggle('hidden');});
  closeHelpBtn.addEventListener('click', () => helpOverlay.classList.add('hidden'));
  helpOverlay.addEventListener('click', (e) => { if (e.target === helpOverlay) helpOverlay.classList.add('hidden'); });
});

// === Help overlay (5xWhy) ===
document.addEventListener('DOMContentLoaded', () => {
  const helpBtn = document.getElementById('whyHelpBtn');
  const helpOverlay = document.getElementById('whyHelpOverlay');
  const closeHelpBtn = document.querySelector('#whyHelpOverlay .closeHelp');
  if (!helpBtn || !helpOverlay || !closeHelpBtn) return;

  // (1) Stop klik inde i selve boksen i at ramme bagved
  const content = helpOverlay.querySelector('.help-content');
  if (content) {
    content.addEventListener('click', (e) => e.stopPropagation());
  }

  // (2) Stop klik på ❓ i at trigge andre klik-handlers (fx luk 5xWhy)
  helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    helpOverlay.classList.toggle('hidden');
  });

  // (3) Stop klik på X i at trigge andre klik-handlers
  closeHelpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    helpOverlay.classList.add('hidden');
  });

  // Klik på selve overlay-baggrunden lukker overlay
  helpOverlay.addEventListener('click', (e) => {
    if (e.target === helpOverlay) helpOverlay.classList.add('hidden');
  });
});


// === Ishikawa: tegn fiskebenet ===
const rygX0 = 370, rygX1 = 900, rygY = 396;
const boneLen = 230 + 76;
const step = (rygX1 - rygX0) / 2;
const boneAngle = 60 * Math.PI / 180;
const mNames = ["Metode","Maskine","Miljø","Menneske","Måling","Materiale"];

let svgBones = "";
svgBones += `<line x1="${rygX0-283}" y1="${rygY}" x2="${rygX1+13}" y2="${rygY}" stroke="black" stroke-width="10" />`;
svgBones += `<polygon points="${rygX1+14},${rygY-14} ${rygX1+74},${rygY} ${rygX1+14},${rygY+14}" fill="crimson"/>`;
for (let i = 0; i < 3; i++) {
  const xBase = rygX0 + i * step;

  const x2top = xBase - boneLen * Math.cos(boneAngle);
  const y2top = rygY - boneLen * Math.sin(boneAngle);
  svgBones += `<line x1="${xBase}" y1="${rygY}" x2="${x2top}" y2="${y2top}" stroke="black" stroke-width="6"/>`;
  svgBones += `<text x="${x2top-50}" y="${y2top-20}" font-size="28" font-weight="bold" fill="#283c6c">${mNames[i]}</text>`;

  const x2bot = xBase - boneLen * Math.cos(boneAngle);
  const y2bot = rygY + boneLen * Math.sin(boneAngle);
  svgBones += `<line x1="${xBase}" y1="${rygY}" x2="${x2bot}" y2="${y2bot}" stroke="black" stroke-width="6"/>`;
  svgBones += `<text x="${x2bot-50}" y="${y2bot+38}" font-size="28" font-weight="bold" fill="#283c6c">${mNames[i+3]}</text>`;
}
document.getElementById("ishikawa").innerHTML = svgBones;

// === M-positionsmåling og kategorisering ===
function getMPositions() {
  const topPositions = [];
  const bottomPositions = [];
  const texts = Array.from(document.querySelectorAll('#ishikawa text'));
  const diagramRect = document.getElementById('diagramArea').getBoundingClientRect();
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
  const rect = div.getBoundingClientRect();
  const boxCenterX = rect.left + (rect.width / 2);
  const boxLeft = rect.left;
  const boxRight = rect.right;
  const { topPositions, bottomPositions } = getMPositions();
  const diagramRect = document.getElementById('diagramArea').getBoundingClientRect();
  const topHalf = rect.top < (diagramRect.top + (diagramRect.height / 2));
  const positions = topHalf ? topPositions : bottomPositions;
  const offsetIndex = topHalf ? 0 : 3;
  let nearestIndex = 0;
  let nearestDist = Math.abs(boxCenterX - positions[0]);
  for (let i = 1; i < positions.length; i++) {
    const dist = Math.abs(boxCenterX - positions[i]);
    if (dist < nearestDist) { nearestDist = dist; nearestIndex = i; }
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
  return mNames[nearestIndex + offsetIndex];
}

// === Liste over årsager grupperet efter M ===
function buildCausesListHTML() {
  const categories = {
    "Metode": [],
    "Maskine": [],
    "Miljø": [],
    "Menneske": [],
    "Måling": [],
    "Materiale": []
  };
  document.querySelectorAll('#causes .causeBox').forEach(div => {
    const cat = getMCatFromPos(div) || "Ukendt";
    categories[cat].push(getCauseText(div));
  });
  let html = '<div style="font-size:22px; font-weight:bold; margin-bottom:10px;">Liste over alle årsager (grupperet efter M)</div>';
  for (const m of mNames) {
    if (categories[m].length) {
      html += `<div style="margin-top:12px; font-size:20px; font-weight:bold; color:#253c7c;">${m}</div>`;
      categories[m].forEach(txt => {
        html += `<div style="margin-left:16px;">- ${escapeHTML(txt)}</div>`;
      });
    }
  }
  return html;
}

// === Problemfelt (placeholder, autohøjde) ===
const problemBox = document.getElementById('problemBox');
function adjustProblemBoxHeight() {
  problemBox.style.height = "auto";
  problemBox.style.height = problemBox.scrollHeight + "px";
}
function sanitizeProblemBox() {
  const txt = problemBox.innerText;
  problemBox.textContent = txt;
}
problemBox.addEventListener('focus', function () {
  if (problemBox.classList.contains('placeholder')) {
    problemBox.textContent = "";
    problemBox.classList.remove('placeholder');
  }
});
problemBox.addEventListener('blur', function () {
  sanitizeProblemBox();
  if (problemBox.textContent.trim() === "") {
    problemBox.classList.add('placeholder');
    problemBox.textContent = problemBox.getAttribute('data-placeholder');
    problemBox.style.height = "80px";
  } else {
    adjustProblemBoxHeight();
  }
});
problemBox.addEventListener('input', function () { adjustProblemBoxHeight(); });
if (problemBox.textContent.trim() === "") {
  problemBox.classList.add('placeholder');
  problemBox.textContent = problemBox.getAttribute('data-placeholder');
  problemBox.style.height = "80px";
} else {
  adjustProblemBoxHeight();
}

// === Hjælpere til årsagstekst ===
function getCauseText(div) {
  const span = div.querySelector('.causeText');
  if (span) return span.textContent;
  const clone = div.cloneNode(true);
  const btn = clone.querySelector('.why-icon');
  if (btn) btn.remove();
  return clone.textContent.trim();
}
function setCauseText(div, txt) {
  let span = div.querySelector('.causeText');
  if (!span) {
    span = document.createElement('span');
    span.className = 'causeText';
    div.insertBefore(span, div.firstChild || null);
  }
  span.textContent = txt;
}
function reserveSpaceForWhy(div) {
  const btn = div.querySelector('.why-icon');
  if (!btn) return;
  requestAnimationFrame(() => {
    const pt = Math.max(24, btn.offsetHeight + 8);
    div.style.paddingTop = pt + 'px';
  });
}

// === 5xWhy-træ logik ===
let currentWhyBox = null;  // den årsagsboks, vi arbejder på
window.whyTree = [];       // træ for den aktuelle boks

function renderWhyTree(tree, parentEl, parentPath = []) {
  parentEl.innerHTML = "";
  tree.forEach((node, idx) => {
    const path = parentPath.concat(idx + 1);
    const levelLabel = "Hvorfor " + path.join('.');

    const nodeDiv = document.createElement('div');
    nodeDiv.className = "tree5why-node";

    const left = document.createElement('div');
    left.className = 'tree5why-left';

    // Dot kun på child-niveau
    if (parentPath.length > 0) {
      const dot = document.createElement('span');
      dot.className = 'tree5why-dot';
      if (node.selectedAction) {
        dot.classList.add("selected-action");
        nodeDiv.classList.add("selected-action");
      }
      dot.onclick = function (ev) {
        ev.stopPropagation();
        node.selectedAction = !node.selectedAction;
        renderAndAutoSizeTree();
      };
      left.appendChild(dot);
    }

    nodeDiv.appendChild(left);

    const right = document.createElement('div');
    right.className = 'tree5why-right';

    const lvl = document.createElement('div');
    lvl.className = 'tree5why-level';
    lvl.textContent = levelLabel;
    right.appendChild(lvl);

    const line = document.createElement('div');
    line.className = 'tree5why-line';

    const inp = document.createElement('textarea');
    inp.className = "tree5why-textarea";
    inp.placeholder = "Hvorfor?";
    inp.value = node.q || "";
    inp.oninput = () => { node.q = inp.value; autoSizeTA(inp); };
    inp.onfocus = function () {
      document.querySelectorAll('.tree5why-node.selected').forEach(el => el.classList.remove('selected'));
      nodeDiv.classList.add('selected');
    };
    line.appendChild(inp);

    const actionsInline = document.createElement('div');

    const addBtn = document.createElement('button');
    addBtn.className = "tree5why-btn add";
    addBtn.textContent = "+ Under-hvorfor";
    addBtn.onclick = () => {
      node.children = node.children || [];
      node.children.push({ q: "", children: [] });
      renderAndAutoSizeTree();
    };
    actionsInline.appendChild(addBtn);

    const canDelete = !(node.children && node.children.length > 0);
    const delBtn = document.createElement('button');
    delBtn.className = "tree5why-btn del";
    delBtn.textContent = "✕";
    delBtn.disabled = !canDelete;
    delBtn.setAttribute('aria-disabled', canDelete ? 'false' : 'true');
    delBtn.onclick = function () {
      if (canDelete) {
        tree.splice(idx, 1);
        renderAndAutoSizeTree();
      }
    };
    actionsInline.appendChild(delBtn);

    line.appendChild(actionsInline);
    right.appendChild(line);

    nodeDiv.appendChild(right);

    // Børn
    if (node.children && node.children.length > 0) {
      const subTree = document.createElement('div');
      subTree.className = "tree5why-children";
      renderWhyTree(node.children, subTree, path);
      nodeDiv.appendChild(subTree);
    }

    parentEl.appendChild(nodeDiv);
  });
}

// PDF: samme træ-layout som popup’en, men read-only (ingen textarea/knapper)
function renderWhyTreeForPdf(tree, parentEl, parentPath = []) {
  parentEl.innerHTML = "";
  tree.forEach((node, idx) => {
    const path = parentPath.concat(idx + 1);
    const levelLabel = "Hvorfor " + path.join('.');
    const txt = (node.q || "").trim();
    if (!txt) return;

    const nodeDiv = document.createElement('div');
    nodeDiv.className = "tree5why-node";

    const left = document.createElement('div');
    left.className = 'tree5why-left';

    // Dot kun på child-niveau (samme som popup)
    if (parentPath.length > 0) {
      const dot = document.createElement('span');
      dot.className = 'tree5why-dot';

      if (node.selectedAction) {
        dot.classList.add("selected-action");
        nodeDiv.classList.add("selected-action");
      }

      left.appendChild(dot);
    }

    nodeDiv.appendChild(left);

    const right = document.createElement('div');
    right.className = 'tree5why-right';

    const lvl = document.createElement('div');
    lvl.className = 'tree5why-level';
    lvl.textContent = levelLabel;
    right.appendChild(lvl);

    const line = document.createElement('div');
    line.className = 'tree5why-line';

    const textDiv = document.createElement('div');
    textDiv.className = "tree5why-pdf-text";
    textDiv.style.whiteSpace = "pre-wrap";
    textDiv.textContent = txt;

    line.appendChild(textDiv);
    right.appendChild(line);

    nodeDiv.appendChild(right);

    // Børn
    if (node.children && node.children.length > 0) {
      const subTree = document.createElement('div');
      subTree.className = "tree5why-children";
      renderWhyTreeForPdf(node.children, subTree, path);
      nodeDiv.appendChild(subTree);
    }

    parentEl.appendChild(nodeDiv);
  });
}

function autoSizeTA(inp) {
  inp.style.height = 'auto';
  inp.style.height = inp.scrollHeight + 'px';
}

function autoSizeAllWhyTextareas() {
  document.querySelectorAll('#whyTreePopup .tree5why-textarea').forEach(el => autoSizeTA(el));
}

function renderAndAutoSizeTree() {
  const root = document.getElementById('tree5whyRoot');
  if (!root) return;
  renderWhyTree(window.whyTree, root);
  autoSizeAllWhyTextareas();
}

// Åbn træ-popup for en given boks
function openWhyTreeForBox(boxDiv) {
  currentWhyBox = boxDiv;
  const causeText = getCauseText(boxDiv);
  const causeEl = document.getElementById('whyTreeCause');
  if (causeEl) causeEl.textContent = causeText;

  window.whyTree = boxDiv._whyTree ? JSON.parse(JSON.stringify(boxDiv._whyTree)) : [];
  renderAndAutoSizeTree();

  const popup = document.getElementById('whyTreePopup');
  const backdrop = document.getElementById('whyTreeBackdrop');
  if (popup) popup.classList.remove('hidden');
  if (backdrop) backdrop.classList.remove('hidden');
}

// Luk popup (med eller uden gem)
function closeWhyTreePopup(save) {
  const popup = document.getElementById('whyTreePopup');
  const backdrop = document.getElementById('whyTreeBackdrop');
  if (save && currentWhyBox) {
    currentWhyBox._whyTree = JSON.parse(JSON.stringify(window.whyTree));
    updateWhyIcon(currentWhyBox);
  }
  currentWhyBox = null;
  window.whyTree = [];
  if (popup) popup.classList.add('hidden');
  if (backdrop) backdrop.classList.add('hidden');
}

// Tilføj top-niveau hvorfor
function addWhy(tree) {
  const node = { q: "", children: [] };
  tree.push(node);
  renderAndAutoSizeTree();
}

// === 5xWhy-bilag til PDF (DOM-baseret + samme klasser som popup) ===
function buildWhySupplementsHTML() {
  const tempWrapper = document.createElement('div');

  const boxesWithWhy = Array.from(document.querySelectorAll('#causes .causeBox'))
    .filter(div => div._whyTree && Array.isArray(div._whyTree) && div._whyTree.length);

  boxesWithWhy.forEach((div, i) => {
    const bilag = document.createElement('div');
    bilag.className = 'why-bilag';

    // Kun sideskift mellem bilag – aldrig efter sidste
    const isLast = (i === boxesWithWhy.length - 1);
    bilag.style = `${!isLast ? 'page-break-after:always;' : ''} width:882px; max-width:100%; margin:60px auto; font-size:18px;`;

    const header = document.createElement('div');
    header.style = 'font-size:30px;font-weight:bold;color:#253c7c;padding-bottom:12px;text-align:center; border-bottom:1.5px solid #a8a7a7;';
    header.textContent = `Årsag: ${getCauseText(div)}`;
    bilag.appendChild(header);

    const treeRoot = document.createElement('div');
    treeRoot.className = 'tree5why-root';
    renderWhyTreeForPdf(div._whyTree, treeRoot);
    bilag.appendChild(treeRoot);

    tempWrapper.appendChild(bilag);
  });

  return tempWrapper.innerHTML.trim();
}

// === Gem alt som PDF ===
function saveAllAsPDF() {
  if (typeof adjustProblemBoxHeight === 'function') adjustProblemBoxHeight();
  const wrapper = document.createElement('div');
  wrapper.style.width = '1122px';
  wrapper.style.background = '#fff';
  const diagramClone = document.getElementById('diagramArea').cloneNode(true);
  diagramClone.style.margin = '0';
  wrapper.appendChild(diagramClone);

  const suppHTML = buildWhySupplementsHTML();
  if (suppHTML.trim().length > 0) {
    const suppDiv = document.createElement('div');
    suppDiv.innerHTML = suppHTML;
    wrapper.appendChild(suppDiv);
    const listHTML = buildCausesListHTML();
    if (listHTML.trim().length) {
      const listDiv = document.createElement('div');
      listDiv.style = "page-break-before:always; width:882px; max-width:100%; margin:60px auto; font-size:18px;";
      listDiv.innerHTML = listHTML;
      wrapper.appendChild(listDiv);
    }
  } else {
    const listHTML = buildCausesListHTML();
    if (listHTML.trim().length) {
      const listDiv = document.createElement('div');
      listDiv.style = "width:882px; max-width:100%; margin:60px auto; font-size:18px;";
      listDiv.innerHTML = listHTML;
      wrapper.appendChild(listDiv);
    }
  }
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${day}-${month}-${year}`;
  html2pdf().from(wrapper).set({
    margin: 0,
    pagebreak: { mode: ['css','legacy'] },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'px', format: [1122, 793], orientation: 'landscape' }
  }).save(`fiskeben-samlet-${dateString}.pdf`);
}

function makeSafeFilename(name) {
  return (name || "ishikawa-projekt")
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\\/:*?"<>|]/g, '')   // fjerner ugyldige tegn i filnavne
    .replace(/\./g, '-')            // undgår mange punkter i filnavn
    .substring(0, 80)               // begræns længde
    || "ishikawa-projekt";
}

function saveProject() {
  const causes = [];
  document.querySelectorAll("#causes .causeBox").forEach(div => {
    causes.push({
      x: parseInt(div.style.left, 10) || 0,
      y: parseInt(div.style.top, 10) || 0,
      text: getCauseText(div),
      whyTree: Array.isArray(div._whyTree) ? div._whyTree : []
    });
  });

  const problemText = (problemBox.classList.contains('placeholder') ? "" : problemBox.textContent);

  const data = {
    problem: problemText,
    causes
  };

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;

  const safeName = makeSafeFilename(problemText);
  a.download = `${safeName}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 0);
}


document.getElementById('loadProjectFile').addEventListener('change', function (evt) {
  const f = evt.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.problem !== undefined) {
        const txt = data.problem || "";
        if (!txt.trim()) {
          problemBox.classList.add('placeholder');
          problemBox.textContent = problemBox.getAttribute('data-placeholder');
          problemBox.style.height = "80px";
        } else {
          problemBox.classList.remove('placeholder');
          problemBox.textContent = txt;
          adjustProblemBoxHeight();
        }
      }
      const causesDiv = document.getElementById('causes');
      causesDiv.innerHTML = '';
      if (Array.isArray(data.causes)) {
        data.causes.forEach(cause => {
          const div = document.createElement("div");
          div.className = "causeBox";
          div.style.left = (cause.x || 0) + "px";
          div.style.top = (cause.y || 0) + "px";
          div.title = "Dobbeltklik for at redigere";
          div.ondblclick = () => openEditCauseInput(div);
          const span = document.createElement('span');
          span.className = 'causeText';
          span.textContent = (cause.text || "");
          div.appendChild(span);
          div._whyTree = Array.isArray(cause.whyTree) ? cause.whyTree : [];
          addWhyIcon(div);
          causesDiv.appendChild(div);
          reserveSpaceForWhy(div);
        });
      }
    } catch (e) {
      alert("Kunne ikke indlæse projektfilen! (" + e.message + ")");
    }
  };
  reader.readAsText(f);
  evt.target.value = "";
});

// === Åbn redigering af årsagsboks ===
let editInput = null;
function openEditCauseInput(div) {
  div.classList.add('editing');
  const causeText = getCauseText(div);
  const divRect = div.getBoundingClientRect();

  editInput = document.createElement('textarea');
  editInput.value = causeText;
  editInput.className = "edit-cause-input";
  editInput.maxLength = 1000;
  editInput.style.left   = (divRect.left + window.scrollX) + "px";
  editInput.style.top    = (divRect.top + window.scrollY) + "px";
  editInput.style.width  = div.offsetWidth + "px";
  editInput.style.height = div.offsetHeight + "px";
  editInput.style.resize = "vertical";

  let hasSaved = false;
  function saveEditOnce() {
    if (hasSaved) return;
    hasSaved = true;
    const nyTekst = editInput.value.trim();
    div.innerHTML = "";
    setCauseText(div, nyTekst);
    addWhyIcon(div);
    reserveSpaceForWhy(div);
    div.classList.remove('editing');
    if (document.body.contains(editInput)) document.body.removeChild(editInput);
    editInput = null;
  }

  editInput.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      saveEditOnce();
    }
    if (ev.key === 'Escape') {
      div.classList.remove('editing');
      if (document.body.contains(editInput)) document.body.removeChild(editInput);
      editInput = null;
    }
  });

  editInput.addEventListener('blur', function () {
    saveEditOnce();
  });

  document.body.appendChild(editInput);
  editInput.focus();
}

// === Årsagsbokse: add, drag, edit ===
const diagram = document.getElementById('diagramArea');
const causesDiv = document.getElementById('causes');
let clickCoords = { x: 0, y: 0 };
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };

// Klik-udenfor: luk add-popup og indsæt ved tekst
let addPopupMayClose = false;
document.addEventListener('mousedown', function (e) {
  const pb = document.getElementById('problemBox');
  if (pb && pb.contains(e.target)) return;
  const popupEl = document.getElementById('popup');
  if (!popupEl) return;
  const isOpen = popupEl.style.display === 'block';
  const clickedOutside = !popupEl.contains(e.target);
  if (isOpen && addPopupMayClose && clickedOutside) {
    const popupTextEl = document.getElementById('popupText');
    const val = (popupTextEl ? popupTextEl.value : '').trim();
    if (val) { submitText(); } else { closePopup(); }
  }
});

// Tilføj årsag: klik i tomt område -> popup
diagram.addEventListener('mousedown', function (e) {
  if (e.target.closest('#problemBox')) return;
  if (e.target.closest(".causeBox")) return;
  if (!diagram.contains(e.target)) return;

  const rect = diagram.getBoundingClientRect();
  clickCoords = { x: e.clientX - rect.left, y: e.clientY - rect.top };

  const popup = document.getElementById('popup');
  const popupText = document.getElementById('popupText');
  if (popupText) popupText.value = "";
  popup.style.display = 'block';
  popup.style.left = (e.pageX + 5) + 'px';
  popup.style.top = (e.pageY - 20) + 'px';
  popup.style.transform = 'none';

  addPopupMayClose = false;
  setTimeout(() => { addPopupMayClose = true; }, 0);
  e.stopPropagation();
  setTimeout(() => { if (popupText) popupText.focus(); }, 30);
});

// Klik i popup må ikke lukke den
document.addEventListener('DOMContentLoaded', () => {
  const popupEl = document.getElementById('popup');
  if (popupEl) popupEl.addEventListener('mousedown', (ev) => ev.stopPropagation());
});

// Drag vs rediger: klik/hold for drag, klik for rediger
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragMoved = false;
diagram.addEventListener('mousedown', function (e) {
  if (e.target.closest('#problemBox')) return;

  const whyPopup = document.getElementById('whyTreePopup');
  if (whyPopup && !whyPopup.classList.contains('hidden')) {
    e.preventDefault();
    return;
  }
  if (e.target.classList.contains("why-icon")) return;
  const targetBox = e.target.closest(".causeBox");
  if (!targetBox) return;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragMoved = false;

  function onMouseMove(moveEvent) {
    const dx = moveEvent.clientX - dragStartX;
    const dy = moveEvent.clientY - dragStartY;
    if (!dragMoved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      dragMoved = true;
      isDragging = true;
      dragTarget = targetBox;
      const rect = dragTarget.getBoundingClientRect();
      dragOffset.x = moveEvent.clientX - rect.left;
      dragOffset.y = moveEvent.clientY - rect.top;
      diagram.style.cursor = "grabbing";
    }
    if (isDragging && dragTarget) {
      const rect = diagram.getBoundingClientRect();
      let x = moveEvent.clientX - rect.left - dragOffset.x;
      let y = moveEvent.clientY - rect.top - dragOffset.y;
      x = Math.max(0, Math.min(rect.width - dragTarget.offsetWidth, x));
      y = Math.max(0, Math.min(rect.height - dragTarget.offsetHeight, y));
      dragTarget.style.left = x + "px";
      dragTarget.style.top = y + "px";
    }
  }
  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    diagram.style.cursor = "crosshair";
    if (!dragMoved) { openEditCauseInput(targetBox); }
    isDragging = false;
    dragTarget = null;
  }
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

// Indsæt årsagsboks fra popup
function submitText() {
  let text = document.getElementById('popupText').value.trim();
  if (!text) return;
  if (text.length > 1000) text = text.substring(0, 1000) + "…";
  const div = document.createElement("div");
  div.className = "causeBox";
  div.style.left = clickCoords.x + "px";
  div.style.top = clickCoords.y + "px";
  div.title = "Dobbeltklik for at redigere";
  div.ondblclick = () => openEditCauseInput(div);
  const span = document.createElement('span');
  span.className = 'causeText';
  span.textContent = text;
  div.appendChild(span);
  addWhyIcon(div);
  causesDiv.appendChild(div);
  reserveSpaceForWhy(div);
  closePopup();
}

function closePopup() {
  const popup = document.getElementById('popup');
  popup.style.display = 'none';
  popup.style.left = '50%';
  popup.style.top = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
}

// 5xWhy-ikon på boks
function addWhyIcon(div) {
  let btn = document.createElement('button');
  btn.type = "button";
  btn.className = "why-icon";
  btn.setAttribute('aria-label', '5xWhy');
  btn.innerHTML = '5x<span style="font-size:86%">WHY?</span>';
  btn.onclick = function (ev) {
    ev.stopPropagation();
    openWhyTreeForBox(div);
  };
  div.appendChild(btn);
  updateWhyIcon(div);
}

function updateWhyIcon(div) {
  const btn = div.querySelector('.why-icon');
  if (!btn) return;
  const hasTree = div._whyTree && Array.isArray(div._whyTree) && div._whyTree.length > 0;
  if (hasTree) {
    btn.setAttribute("data-filled", "yes");
    btn.title = "5xWhy-træ udfyldt";
  } else {
    btn.removeAttribute("data-filled");
    btn.title = "Åbn 5xWhy-træ";
  }
}

// Init knapper
window.addEventListener('resize', () => {
  document.querySelectorAll('#causes .causeBox').forEach(div => reserveSpaceForWhy(div));
});

document.addEventListener('DOMContentLoaded', () => {
  const savePdfBtn     = document.getElementById('savePdfBtn');
  const saveProjectBtn = document.getElementById('saveProjectBtn');
  const openProjectBtn = document.getElementById('openProjectBtn');
  const fileInput      = document.getElementById('loadProjectFile');

  if (savePdfBtn)     savePdfBtn.addEventListener('click', saveAllAsPDF);
  if (saveProjectBtn) saveProjectBtn.addEventListener('click', saveProject);
  if (openProjectBtn) openProjectBtn.addEventListener('click', () => fileInput && fileInput.click());

  const addBtn    = document.getElementById('addCauseBtn');
  const cancelBtn = document.getElementById('cancelCauseBtn');
  const popupText = document.getElementById('popupText');

  if (addBtn)    addBtn.addEventListener('click', submitText);
  if (cancelBtn) cancelBtn.addEventListener('click', closePopup);
  if (popupText) popupText.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitText(); });

  const popupEl = document.getElementById('popup');
  if (popupEl) popupEl.addEventListener('mousedown', (ev) => ev.stopPropagation());

  // 5xWhy-træ popup knapper
  const whySaveBtn   = document.getElementById('whyTreeSaveBtn');
  const whyCancelBtn = document.getElementById('whyTreeCancelBtn');
  const whyCloseBtn  = document.querySelector('#whyTreePopup .why-tree-close');
  const whyBackdrop  = document.getElementById('whyTreeBackdrop');
  const addRootBtn   = document.getElementById('addRootWhyBtn');

  if (whySaveBtn)   whySaveBtn.addEventListener('click', () => closeWhyTreePopup(true));
  if (whyCancelBtn) whyCancelBtn.addEventListener('click', () => closeWhyTreePopup(false));
  if (whyCloseBtn)  whyCloseBtn.addEventListener('click', () => closeWhyTreePopup(false));
  if (whyBackdrop)  whyBackdrop.addEventListener('click', () => closeWhyTreePopup(false));

  if (addRootBtn) addRootBtn.addEventListener('click', () => addWhy(window.whyTree));

  // ESC lukker træ-popup hvis åben
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const popup = document.getElementById('whyTreePopup');
      if (popup && !popup.classList.contains('hidden')) {
        closeWhyTreePopup(false);
      }
    }
  });
});
