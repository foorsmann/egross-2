// double-qty.js - Doar funcționalitate, fără injectare buton
// Autor: Saga Media / Egross
// Asigură funcționalitatea "Dublează" pe orice buton cu clasa .double-qty-btn EXISTENT în pagină

(function(){
  // Configurări
  var BUTTON_CLASS = 'double-qty-btn';
  var BUTTON_ARIA = 'Dublează cantitatea';

  // Helper: Găsește inputul de cantitate din același container cu butonul
  function findQtyInput(btn) {
    // Caută inputul înainte de buton (poți adapta dacă structura ta e alta)
    let wrapper = btn.previousElementSibling;
    if (wrapper && wrapper.classList && wrapper.classList.contains('quantity-input')) {
      // Dacă există un input în wrapper
      let input = wrapper.querySelector('input[type="number"]');
      if (input) return input;
    }
    // Dacă nu e găsit, mai încearcă direct înainte de buton
    if (btn.previousElementSibling && btn.previousElementSibling.tagName === 'INPUT') {
      return btn.previousElementSibling;
    }
    // Sau caută în tot părintele
    return btn.parentNode.querySelector('input[type="number"]');
  }

  // Aplică funcționalitatea pe toate butoanele existente la pageload + re-render
  function initDoubleQtyButtons() {
    document.querySelectorAll('.' + BUTTON_CLASS).forEach(function(btn){
      // Nu atașa de mai multe ori!
      if (btn.dataset.doubleQtyActive) return;
      btn.dataset.doubleQtyActive = '1';
      btn.setAttribute('aria-label', BUTTON_ARIA);

      // Găsește inputul asociat
      var input = findQtyInput(btn);
      if (!input) return;

      // Update vizual și stare
      function updateBtnState() {
        var max = input.max ? parseInt(input.max, 10) : 9999;
        var val = parseInt(input.value, 10) || 1;
        btn.disabled = val >= max;
      }
      updateBtnState();
      input.addEventListener('input', updateBtnState);

      // Click: dublează cantitatea
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var max = input.max ? parseInt(input.max, 10) : 9999;
        var val = parseInt(input.value, 10) || 1;
        var doubled = val * 2;
        if (doubled > max) {
          input.value = max;
          btn.disabled = true;
        } else {
          input.value = doubled;
          if (doubled === max) btn.disabled = true;
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        updateBtnState();
      });

      // Focus vizual
      btn.addEventListener('focus', function(){ btn.classList.add('focus'); });
      btn.addEventListener('blur', function(){ btn.classList.remove('focus'); });
    });
  }

  // Rulează la pageload și la re-render (dacă ai AJAX sau Shopify section load)
  document.addEventListener('DOMContentLoaded', initDoubleQtyButtons);
  window.addEventListener('shopify:section:load', initDoubleQtyButtons);
  window.addEventListener('shopify:cart:updated', initDoubleQtyButtons);
  window.addEventListener('shopify:product:updated', initDoubleQtyButtons);

  // Expune global pentru debugging manual
  window.doubleQtyInit = initDoubleQtyButtons;
})();

