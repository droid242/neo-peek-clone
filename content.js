if (typeof hoverTimer === 'undefined') {
  var hoverTimer = null;
  var leaveTimer = null;
  var currentLink = null;
  var triggerBtn = null;
  var peekContainer = null;
  var peekOverlay = null;
  var currentMouseX = 0;
  var currentMouseY = 0;
  var currentClientX = 0;
  var currentClientY = 0;
  var lastPlacedX = 0;
  var lastPlacedY = 0;
  var isHoveringButton = false;
}

const EXCLUDED_WORDS = [/^\d+$/, /next/i, /prev/i, /page/i, /köv/i, /előző/i, /lapoz/i, /mutass/i, /show/i];
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|heic)(\?.*)?$/i;

const MENU_WORDS_REGEX = /^(home|főoldal|fooldal|about|rólunk|rolunk|bemutatkozás|bemutatkozas|contact|kapcsolat|blog|hírek|hirek|galéria|gallery)$/i;
const MENU_CLASS_REGEX = /(\b|_|-)nav(\b|_|-|bar|igation|link|item)|menu|navbar/i;

function isInsideMenu(link) {
  if (link.closest('nav')) return true;

  let el = link;
  while (el && el !== document.body) {
    const className = typeof el.className === 'string' ? el.className : '';
    const id = typeof el.id === 'string' ? el.id : '';
    if (MENU_CLASS_REGEX.test(className) || MENU_CLASS_REGEX.test(id)) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

function shouldSkipLink(link) {
  const linkText = link.innerText.trim();
  const linkHref = link.getAttribute('href');

  if (!linkHref || linkHref.startsWith('#') || linkHref.startsWith('javascript:')) return true;

  // Filter out direct image links (e.g. opening gallery images)
  if (IMAGE_EXTENSIONS.test(linkHref)) return true;

  // Excluded text patterns (e.g. page numbers, pagination keywords)
  const isExcludedText = EXCLUDED_WORDS.some(regex => regex.test(linkText));
  if (isExcludedText) return true;

  // Check menu keywords
  if (MENU_WORDS_REGEX.test(linkText)) return true;

  // Check menu structure / parent elements
  if (isInsideMenu(link)) return true;

  // Check for lightbox, gallery and pagination classes / attributes
  const linkClassAndTitle = (link.className + ' ' + (link.title || '')).toLowerCase();
  const relAttr = (link.getAttribute('rel') || '').toLowerCase();
  const hasLightboxAttribute = link.hasAttribute('data-lightbox') || 
                               link.hasAttribute('data-fancybox') || 
                               link.hasAttribute('data-gallery');

  if (
    linkClassAndTitle.includes('pagination') || 
    linkClassAndTitle.includes('pager') ||
    linkClassAndTitle.includes('lightbox') ||
    linkClassAndTitle.includes('gallery') ||
    relAttr.includes('lightbox') ||
    relAttr.includes('gallery') ||
    hasLightboxAttribute
  ) {
    return true;
  }

  return false;
}

document.addEventListener('mouseover', (e) => {
  const link = e.target.closest('a');

  if (link && link.href && link.href.startsWith('http')) {
    clearTimeout(leaveTimer);
    if (shouldSkipLink(link)) return;

    // If we're already tracking this link, don't restart the timer
    if (currentLink === link) return;

    currentLink = link;
    clearTimeout(hoverTimer);

    // We capture the current position at timer fire time (from mousemove tracking),
    // so the icon always appears where the cursor actually is
    hoverTimer = setTimeout(() => {
      showTriggerButton(link);
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

// Continuously track the cursor's current position and update the button position as needed
document.addEventListener('mousemove', (e) => {
  currentMouseX = e.pageX;
  currentMouseY = e.pageY;
  currentClientX = e.clientX;
  currentClientY = e.clientY;

  if (triggerBtn && !isHoveringButton && currentLink) {
    const link = e.target.closest('a');
    if (link === currentLink) {
      const distance = Math.hypot(currentMouseX - lastPlacedX, currentMouseY - lastPlacedY);
      if (distance > 80) {
        updateTriggerButtonPosition();
        lastPlacedX = currentMouseX;
        lastPlacedY = currentMouseY;
      }
    }
  }
});

function updateTriggerButtonPosition() {
  if (!triggerBtn) return;

  const iconSize = 24;
  const gap = 10;

  let posLeft = currentMouseX + gap;
  let posTop  = currentMouseY - iconSize - gap;

  // If it would overflow to the right → shift it to the left
  if (currentClientX + gap + iconSize > window.innerWidth) {
    posLeft = currentMouseX - iconSize - gap;
  }
  // If it would overflow upwards → shift it downwards
  if (currentClientY - iconSize - gap < 0) {
    posTop = currentMouseY + gap;
  }

  triggerBtn.style.left = `${posLeft}px`;
  triggerBtn.style.top  = `${posTop}px`;
}

function showTriggerButton(link) {
  removeTriggerButton();
  currentLink = link;
  isHoveringButton = false;
  lastPlacedX = currentMouseX;
  lastPlacedY = currentMouseY;

  triggerBtn = document.createElement('button');
  triggerBtn.className = 'neo-peek-trigger-btn';
  triggerBtn.title = 'Preview (Peek)';

  // Load from the pic/peek.svg file
  triggerBtn.innerHTML = `<img src="${chrome.runtime.getURL('pic/peek.svg')}" alt="Peek" />`;

  triggerBtn.style.position = 'absolute';
  updateTriggerButtonPosition();

  triggerBtn.addEventListener('mouseenter', () => {
    isHoveringButton = true;
    clearTimeout(leaveTimer);
  });
  triggerBtn.addEventListener('mouseleave', () => {
    isHoveringButton = false;
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
  currentLink = null;
  isHoveringButton = false;
}

function openPeekWindow(url) {
  closePeekWindow();

  peekOverlay = document.createElement('div');
  peekOverlay.className = 'neo-peek-overlay';
  document.body.appendChild(peekOverlay);

  peekContainer = document.createElement('div');
  peekContainer.className = 'neo-peek-container';

  // 1. Build the header
  const header = document.createElement('div');
  header.className = 'neo-peek-header';

  // Left-side title element (defaults to "Loading...")
  const titleContainer = document.createElement('div');
  titleContainer.className = 'neo-peek-title';
  titleContainer.innerText = 'Loading...';
  header.appendChild(titleContainer);

  // Right-side button group container
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'neo-peek-actions';

  // "Open in new tab" button (loaded from w.svg)
  const openTabBtn = document.createElement('button');
  openTabBtn.className = 'neo-peek-btn';
  openTabBtn.title = 'Open in new tab';
  openTabBtn.innerHTML = `<img src="${chrome.runtime.getURL('pic/w.svg')}" alt="Open Tab" />`;
  openTabBtn.addEventListener('click', () => {
    window.open(url, '_blank');
    closePeekWindow();
  });

  // "Close" button (loaded from x.svg)
  const closeBtn = document.createElement('button');
  closeBtn.className = 'neo-peek-btn neo-peek-close-btn';
  closeBtn.title = 'Close';
  closeBtn.innerHTML = `<img src="${chrome.runtime.getURL('pic/x.svg')}" alt="Close" />`;
  closeBtn.addEventListener('click', closePeekWindow);

  actionsContainer.appendChild(openTabBtn);
  actionsContainer.appendChild(closeBtn);
  header.appendChild(actionsContainer);
  peekContainer.appendChild(header);

  // 2. Build the iframe and extract the page title
  const iframe = document.createElement('iframe');
  iframe.className = 'neo-peek-iframe';
  iframe.src = url;

  // When the iframe loads, try to read the page title
  iframe.addEventListener('load', () => {
    try {
      if (iframe.contentWindow && iframe.contentWindow.document.title) {
        titleContainer.innerText = iframe.contentWindow.document.title;
        titleContainer.title = iframe.contentWindow.document.title; // Tooltip for long titles
      } else {
        // If the title is empty, fall back to the URL
        titleContainer.innerText = url;
      }
    } catch (e) {
      // On CORS error (cross-origin domain blocks access), use the URL as fallback
      titleContainer.innerText = url;
      titleContainer.title = url;
    }
  });

  peekContainer.appendChild(iframe);
  document.body.appendChild(peekContainer);
  
  // Set focus for immediate Escape key handling
  peekContainer.tabIndex = -1;
  peekContainer.focus();

  // Disable background scrolling
  document.body.style.overflow = 'hidden';
  
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
  // Restore background scrolling
  document.body.style.overflow = '';
}

// Global keyboard event handler for the ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePeekWindow();
  }
});