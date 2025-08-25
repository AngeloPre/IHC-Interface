(function ($) {
    const blocks     = $("#rotator div").get();
    const increase   = Math.PI * 2 / blocks.length;
    let   angle      = 0;

    // lê variáveis CSS
    const rootStyles  = getComputedStyle(document.documentElement);
    const circleSize  = parseFloat(rootStyles.getPropertyValue('--circle-size'))  || 84;
    const preferOrbit = parseFloat(rootStyles.getPropertyValue('--orbit-radius')) || 140;

    // elementos de referência
    const container   = document.querySelector('.spin-container');
    const centerEl    = document.querySelector('.central-circle');

    // centro real do globo (x,y), em relação ao container
    const centerX     = centerEl.offsetLeft + centerEl.offsetWidth  / 2;
    const centerY     = centerEl.offsetTop  + centerEl.offsetHeight / 2;

    // raios dos elementos
    const smallR      = circleSize / 2;
    const globeR      = centerEl.offsetWidth / 2; // == 75px pelo seu CSS

    // limites da órbita: não colidir com o globo e nem sair do container
    const gap         = 12; // espaço mínimo entre globo e esfera
    const minOrbitR   = globeR + smallR + gap;
    const maxOrbitR   = Math.min(container.clientWidth, container.clientHeight) / 2 - smallR - 2;

    // clamp do raio pedido para caber com segurança
    const orbitRadius = Math.max(minOrbitR, Math.min(preferOrbit, maxOrbitR));

    // posiciona os centros das esferas ao longo da órbita
    for (let i = 0; i < blocks.length; i++) {
      const elem = blocks[i];
      const x = orbitRadius * Math.cos(angle) + centerX;
      const y = orbitRadius * Math.sin(angle) + centerY;
      elem.style.position = 'absolute';
      elem.style.left = (x - smallR) + 'px';
      elem.style.top  = (y - smallR) + 'px';
      angle += increase;
    }
})(jQuery);

//Click to stop/start rotation

(function ($) {

var circs = document.querySelectorAll('#rotator, .small-circle');

for ( var i = 0; i < circs.length; i++ ) {
    circs[i].addEventListener('click', function(e){
        // se clicou em um link/imagem dentro do círculo, não pausa
        if (e.target.closest('a')) return;
        toggleAnimation();
    });
    circs[i].style.webkitAnimationPlayState = 'running';  
}

function toggleAnimation() {
    var style;
    for ( var i = 0; i < circs.length; i++ ) {
        style = circs[i].style;
        if ( style.webkitAnimationPlayState === 'running' ) {
            style.webkitAnimationPlayState = 'paused';
            document.body.className = 'paused';
        } else {
            style.webkitAnimationPlayState = 'running';
            document.body.className = '';       
        }
    }      
}
})(jQuery);

// -------- Popovers (Filtros e Favoritos) + Filtros por categoria --------
document.addEventListener('DOMContentLoaded', () => {
  const filterPopover = document.getElementById('filterPopover');
  const favsPopover   = document.getElementById('favsPopover');
  const menuBtn       = document.getElementById('appMenuBtn');
  const favsBtn       = document.getElementById('favsBtn');
  const favsListEl    = document.getElementById('favsList');

  const hideAll = () => {
    filterPopover.classList.add('hidden');
    favsPopover.classList.add('hidden');
  };
  const toggle = (el) => {
    const willShow = el.classList.contains('hidden');
    hideAll();
    if (willShow) el.classList.remove('hidden');
  };

  // Abrir/fechar popover de filtros
  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggle(filterPopover);
    });
  }
  // Abrir/fechar popover de favoritos
  if (favsBtn) {
    favsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      refreshFavs();
      toggle(favsPopover);
    });
  }

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    const inside =
      e.target.closest('#filterPopover') ||
      e.target.closest('#favsPopover')   ||
      e.target.closest('#appMenuBtn')    ||
      e.target.closest('#favsBtn');
    if (!inside) hideAll();
  });

  // Filtro por categoria
  document
    .querySelectorAll('#filterPopover input[type="checkbox"]')
    .forEach((cb) => {
      cb.addEventListener('change', () => {
        const cat = cb.dataset.cat;
        document
          .querySelectorAll(`.small-circle[data-category="${cat}"]`)
          .forEach((el) => {
            el.style.display = cb.checked ? 'table' : 'none';
          });
      });
    });

  // Monta lista de favoritos (lê círculos com data-favorite="true")
  function refreshFavs() {
    if (!favsListEl) return;
    favsListEl.innerHTML = '';
    document
      .querySelectorAll('.small-circle[data-favorite="true"]')
      .forEach((el) => {
        const a   = el.querySelector('a');
        const img = el.querySelector('img');
        const li  = document.createElement('li');
        li.className = 'popover-item';
        li.innerHTML = `
          <a href="${a ? a.href : '#'}" class="popover-link">
            <img src="${img ? img.src : ''}" alt="" class="popover-thumb">
            <span>${el.dataset.label || 'Favorito'}</span>
          </a>`;
        favsListEl.appendChild(li);
      });
  }
  // expõe para uso externo (ex.: toasts)
  window.refreshFavs = refreshFavs;

  // ---------- TOASTS ----------
  const toastHelp   = document.getElementById('toast-help');
  const toastRU     = document.getElementById('toast-ru');
  const btnTour     = document.getElementById('btn-start-tour');
  const btnNoHelp   = document.getElementById('btn-dismiss-help');
  const btnRuFav    = document.getElementById('btn-add-ru');
  const btnRuClose  = document.getElementById('btn-dismiss-ru');

  const closeToast = (el) => el && (el.style.display = 'none');

  if (btnTour) {
    btnTour.addEventListener('click', () => {
      alert('Tour rápido: use filtros no ícone de grade, clique nas esferas por categoria e use a estrela para ver seus favoritos.');
      closeToast(toastHelp);
    });
  }
  if (btnNoHelp) {
    btnNoHelp.addEventListener('click', () => closeToast(toastHelp));
  }

  if (btnRuFav) {
    btnRuFav.addEventListener('click', () => {
      // marca o RU (alimentação) como favorito
      const ruCircle = document.querySelector('.small-circle[data-category="alimentacao"]');
      if (ruCircle) {
        ruCircle.setAttribute('data-favorite', 'true');
        if (typeof window.refreshFavs === 'function') window.refreshFavs();
        btnRuFav.innerHTML = '<i class="fa fa-star"></i> Adicionado!';
        btnRuFav.disabled = true;
        setTimeout(() => closeToast(toastRU), 1200);
      } else {
        alert('Não encontrei o atalho do RU nesta página.');
      }
    });
  }
  if (btnRuClose) btnRuClose.addEventListener('click', () => closeToast(toastRU));
});