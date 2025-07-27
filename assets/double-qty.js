// double-qty.js - Buton "Dublează" cantitate pentru Shopify
// Autor: Saga Media / Egross
// Descriere: Inserează automat butonul "Dublează" lângă inputul de cantitate pe pagini de produs, coș, quick add. Modular, robust, fără duplicări sau buguri. Textul butonului se poate modifica rapid din variabila BUTTON_TEXT.

(function(){
  // Textul butonului - modifică aici dacă vrei alt text
  var BUTTON_TEXT = 'Dublează';
  var BUTTON_CLASS = 'double-qty-btn';
  var BUTTON_ARIA = 'Dublează cantitatea';

  // Selector pentru inputurile de cantitate (static și generate dinamic)
  var QTY_SELECTORS = [
    'input[type="number"][name*="quantity"]',
    'input[type="number"][id*="quantity"]',
    'input[type="number"][class*="quantity"]',
    'input[type="number"][name*="qty"]',
    'input[type="number"][id*="qty"]',
    'input[type="number"][class*="qty"]'
  ];

  // Detectează bundle-uri/variante complexe (exclude)
  function isBundleOrComplex(input) {
    var form = input.closest('form');
    if (!form) return false;
    var bundle = form.querySelector('[data-bundle], .bundle, .product-bundle');
    var complex = form.querySelector('.variant-complex, [data-complex]');
    return !!(bundle || complex);
  }

  // Inserează butonul "Dublează" lângă inputul de cantitate
  function insertDoubleBtn(input) {
    if (!input || input.dataset.doubleQtyAttached) return;
    if (isBundleOrComplex(input)) return;
    // Evită duplicarea
    var next = input.nextElementSibling;
    if (next && next.classList && next.classList.contains(BUTTON_CLASS)) return;
    // Creează butonul
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = BUTTON_CLASS;
    btn.textContent = BUTTON_TEXT;
    btn.setAttribute('aria-label', BUTTON_ARIA);
    btn.tabIndex = 0;
    // Eveniment click
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var max = input.max ? parseInt(input.max,10) : 9999;
      var val = parseInt(input.value,10) || 1;
      var doubled = val * 2;
      if (doubled > max) {
        input.value = max;
        btn.disabled = true;
      } else {
        input.value = doubled;
        // Dacă atinge maximul, dezactivează butonul
        if (doubled === max) btn.disabled = true;
      }
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    // Focus style
    btn.addEventListener('focus', function(){ btn.classList.add('focus'); });
    btn.addEventListener('blur', function(){ btn.classList.remove('focus'); });
    // Marchează inputul ca având buton
    input.dataset.doubleQtyAttached = '1';
    // Inserează butonul imediat după input
    input.parentNode.insertBefore(btn, input.nextSibling);
  }

  // Caută și inserează butoane pe toate zonele relevante
  function scanAndInsert() {
    QTY_SELECTORS.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(input){
        insertDoubleBtn(input);
      });
    });
  }

  // Observă modificări în DOM pentru inputuri generate dinamic
  var observer = new MutationObserver(function(){
    scanAndInsert();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Inițial, la pageload
  document.addEventListener('DOMContentLoaded', scanAndInsert);
  // Pentru AJAX/SPA, la fiecare re-render
  window.addEventListener('shopify:section:load', scanAndInsert);
  window.addEventListener('shopify:cart:updated', scanAndInsert);
  window.addEventListener('shopify:product:updated', scanAndInsert);

  // Expune funcția global pentru debug/ajustări
  window.doubleQtyScan = scanAndInsert;

  // Documentație rapidă:
  // - Modifică BUTTON_TEXT pentru alt text
  // - Stilurile sunt în double-qty.css
  // - Poți apela window.doubleQtyScan() manual dacă ai zone custom
})();
