if (typeof hoverTimer === 'undefined') {
  var hoverTimer = null;
  var leaveTimer = null;
  var currentLink = null;
  var triggerBtn = null;
  var peekContainer = null;
  var peekOverlay = null;
}

const EXCLUDED_WORDS = [/^\d+$/, /next/i, /prev/i, /page/i, /köv/i, /előző/i, /lapoz/i, /mutass/i, /show/i];

function shouldSkipLink(link) {
  const linkText = link.innerText.trim();
  const linkHref = link.getAttribute('href');

  if (!linkHref || linkHref.startsWith('#') || linkHref.startsWith('javascript:')) return true;

  const isExcludedText = EXCLUDED_WORDS.some(regex => regex.test(linkText));
  if (isExcludedText) return true;

  const linkClassAndTitle = (link.className + ' ' + (link.title || '')).toLowerCase();
  if (linkClassAndTitle.includes('pagination') || linkClassAndTitle.includes('pager')) return true;

  return false;
}

document.addEventListener('mouseover', (e) => {
  const link = e.target.closest('a');
  
  if (link && link.href && link.href.startsWith('http')) {
    clearTimeout(leaveTimer);
    if (shouldSkipLink(link)) return;
    
    // Ha ugyanazon a linken vagyunk, DE az ikon valamiért eltűnt (nincs triggerBtn),
    // akkor engedjük, hogy újra létrejöjjön!
    if (currentLink === link && triggerBtn) return;
    
    currentLink = link;
    clearTimeout(hoverTimer);

    const mouseX = e.pageX;
    const mouseY = e.pageY;

    hoverTimer = setTimeout(() => {
      showTriggerButton(link, mouseX, mouseY);
    }, 250);
  }
});

document.addEventListener('mouseout', (e) => {
  const link = e.target.closest('a');
  if (link && link === currentLink) {
    clearTimeout(hoverTimer);
    leaveTimer = setTimeout(() => removeTriggerButton(), 300);
  }
});

function showTriggerButton(link, mouseX, mouseY) {
  removeTriggerButton();

  triggerBtn = document.createElement('button');
  triggerBtn.className = 'neo-peek-trigger-btn';
  triggerBtn.title = 'Előnézet (Peek)';
  
  triggerBtn.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <g transform="matrix(0.9,0,0,0.9,1.2,1.2)">
        <circle cx="12" cy="12" r="10" style="fill:#d1002e;"/>
    </g>
    <path d="M12,2C17.519,2 22,6.481 22,12C22,17.519 17.519,22 12,22C6.481,22 2,17.519 2,12C2,6.481 6.481,2 12,2ZM12,3C7.033,3 3,7.033 3,12C3,16.967 7.033,21 12,21C16.967,21 21,16.967 21,12C21,7.033 16.967,3 12,3Z" style="fill:#1f2937;"/>
    <g transform="matrix(5,0,0,2.5,-39,-6.5)">
        <path d="M9.4,7L9,7L9,5.4C9,5.294 9.021,5.192 9.059,5.117C9.096,5.042 9.147,5 9.2,5L10,5L10,5.8L9.8,5.8C9.694,5.8 9.592,5.884 9.517,6.034C9.442,6.184 9.4,6.388 9.4,6.6L9.4,7Z" style="fill:#9ca3af;"/>
    </g>
    <g transform="matrix(5,0,0,-2.5,-39,30.5)">
        <path d="M9.4,7L9,7L9,5.4C9,5.294 9.021,5.192 9.059,5.117C9.096,5.042 9.147,5 9.2,5L10,5L10,5.8L9.8,5.8C9.694,5.8 9.592,5.884 9.517,6.034C9.442,6.184 9.4,6.388 9.4,6.6L9.4,7Z" style="fill:#9ca3af;"/>
    </g>
    <g transform="matrix(0,5,-2.5,0,30.5,-39)">
        <path d="M9.4,7L9,7L9,5.4C9,5.294 9.021,5.192 9.059,5.117C9.096,5.042 9.147,5 9.2,5L10,5L10,5.8L9.8,5.8C9.694,5.8 9.592,5.884 9.517,6.034C9.442,6.184 9.4,6.388 9.4,6.6L9.4,7Z" style="fill:#9ca3af;"/>
    </g>
    <g transform="matrix(0,-5,-2.5,-0,30.5,63)">
        <path d="M9.4,7L9,7L9,5.4C9,5.294 9.021,5.192 9.059,5.117C9.096,5.042 9.147,5 9.2,5L10,5L10,5.8L9.8,5.8C9.694,5.8 9.592,5.884 9.517,6.034C9.442,6.184 9.4,6.388 9.4,6.6L9.4,7Z" style="fill:#9ca3af;"/>
    </g>
    <g transform="matrix(0.666667,0,0,0.666667,4,4)">
        <circle cx="12" cy="12" r="3" style="fill:#9ca3af;"/>
    </g>
</svg>
  `;
  
  triggerBtn.style.position = 'absolute';
  triggerBtn.style.top = `${mouseY - 25}px`;
  triggerBtn.style.left = `${mouseX + 15}px`;
  
  triggerBtn.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
  triggerBtn.addEventListener('mouseleave', () => {
    leaveTimer = setTimeout(() => removeTriggerButton(), 300);
  });

  triggerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPeekWindow(link.href);
    removeTriggerButton();
  });

  document.body.appendChild(triggerBtn);
}

function removeTriggerButton() {
  if (triggerBtn) {
    triggerBtn.remove();
    triggerBtn = null;
  }
}

function openPeekWindow(url) {
  closePeekWindow();

  peekOverlay = document.createElement('div');
  peekOverlay.className = 'neo-peek-overlay';
  document.body.appendChild(peekOverlay);

  peekContainer = document.createElement('div');
  peekContainer.className = 'neo-peek-container';

  // 1. Fejléc felépítése
  const header = document.createElement('div');
  header.className = 'neo-peek-header';

  // Bal oldali címtartó elem (alapértelmezetten a "Betöltés..." szöveggel)
  const titleContainer = document.createElement('div');
  titleContainer.className = 'neo-peek-title';
  titleContainer.innerText = 'Betöltés...';
  header.appendChild(titleContainer);

  // Jobb oldali gombcsoport konténer
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'neo-peek-actions';

  // "Megnyitás új lapon" gomb (w.svg)
  const openTabBtn = document.createElement('button');
  openTabBtn.className = 'neo-peek-btn';
  openTabBtn.title = 'Megnyitás új lapon';
  openTabBtn.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-miterlimit:10;">
    <path d="M22,4L22,20C22,21.104 21.104,22 20,22L4,22C2.896,22 2,21.104 2,20L2,4C2,2.896 2.896,2 4,2L20,2C21.104,2 22,2.896 22,4Z" style="fill:#9ca3af;"/>
    <g transform="matrix(-0.702826,0,0,0.702826,20.433917,3.566083)">
        <g transform="matrix(-1.422826,0,0,1.422826,29.073917,-5.073917)">
            <path d="M18.028,11.699L18.028,5.972L12.301,5.972" style="fill:none;stroke:#1f2937;stroke-width:2px;"/>
            <path d="M11.699,18.028L5.972,18.028L5.972,12.301" style="fill:none;stroke:#1f2937;stroke-width:2px;"/>
            <path d="M18.028,5.972C15.443,8.557 8.557,15.443 5.972,18.028" style="fill:none;stroke:#1f2937;stroke-width:2px;stroke-linejoin:round;stroke-miterlimit:1.5;"/>
        </g>
    </g>
    <g transform="matrix(1.986065,0,0,1.986065,-4.902454,-4.902454)">
        <path d="M7,4.972L7,5.993C6.733,5.993 6.477,6.099 6.288,6.288C6.099,6.477 5.993,6.733 5.993,7L4.972,7L4.972,4.972L7,4.972Z" style="fill:#1f2937;"/>
    </g>
    <g transform="matrix(1.986065,0,0,1.986065,5.12581,5.12581)">
        <path d="M7,4.972L7,7L4.972,7L4.972,5.979C5.239,5.979 5.495,5.873 5.684,5.684C5.873,5.495 5.979,5.239 5.979,4.972L7,4.972Z" style="fill:#1f2937;"/>
    </g>
</svg>
  `;
  openTabBtn.addEventListener('click', () => {
    window.open(url, '_blank');
    closePeekWindow();
  });

  // "Bezárás" gomb (x.svg)
  const closeBtn = document.createElement('button');
  closeBtn.className = 'neo-peek-btn neo-peek-close-btn';
  closeBtn.title = 'Bezárás';
  closeBtn.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <path d="M22,4L22,20C22,21.104 21.104,22 20,22L4,22C2.896,22 2,21.104 2,20L2,4C2,2.896 2.896,2 4,2L20,2C21.104,2 22,2.896 22,4Z" style="fill:#d1002e;"/>
    <g transform="matrix(0.651413,-0.051413,-0.051413,0.651413,4.8,4.8)">
        <path d="M2,2L22,22" style="fill:none;stroke:#1f2937;stroke-width:5px;"/>
    </g>
    <g transform="matrix(-0.651413,-0.051413,0.051413,0.651413,19.2,4.8)">
        <path d="M2,2L22,22" style="fill:none;stroke:#1f2937;stroke-width:5px;"/>
    </g>
</svg>
  `;
  closeBtn.addEventListener('click', closePeekWindow);

  actionsContainer.appendChild(openTabBtn);
  actionsContainer.appendChild(closeBtn);
  header.appendChild(actionsContainer);
  peekContainer.appendChild(header);

  // 2. Iframe felépítése és cím-kiszedés
  const iframe = document.createElement('iframe');
  iframe.className = 'neo-peek-iframe';
  iframe.src = url;

  // Amikor betölt az iframe, megpróbáljuk kiolvasni a címet
  iframe.addEventListener('load', () => {
    try {
      if (iframe.contentWindow && iframe.contentWindow.document.title) {
        titleContainer.innerText = iframe.contentWindow.document.title;
        titleContainer.title = iframe.contentWindow.document.title; // Tooltip a hosszú címekhez
      } else {
        // Ha üres a cím, az URL-t használjuk
        titleContainer.innerText = url;
      }
    } catch (e) {
      // CORS hiba esetén (ha külső domain nem engedi az olvasást), az URL-t rakjuk ki fallbackként
      titleContainer.innerText = url;
      titleContainer.title = url;
    }
  });

  peekContainer.appendChild(iframe);
  document.body.appendChild(peekContainer);
  peekOverlay.addEventListener('click', closePeekWindow);
}

function closePeekWindow() {
  if (peekContainer) {
    peekContainer.remove();
    peekContainer = null;
  }
  if (peekOverlay) {
    peekOverlay.remove();
    peekOverlay = null;
  }
}