import { Boarding } from "https://unpkg.com/boarding.js/dist/main.js";
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
  const sideResults   = document.getElementById('sideResults');
  const signInBtn     = document.getElementById('signInBtn');
  const userBtn       = document.getElementById('userBtn');
  const userPopover   = document.getElementById('userPopover');
  const userPopoverClose = document.getElementById('userPopoverClose');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const signOutBtn    = document.getElementById('btnSignOut');
  const helpFab       = document.getElementById('helpFab');
  const ufprImg       = document.querySelector('.ufpr');
  const UFPR_LIGHT_SRC = 'https://i.postimg.cc/WzLsCwtW/Brasoes-UFPR.png';
  const UFPR_DARK_SRC  = 'https://i.postimg.cc/hGx5CjcV/ufpr-logo.png'; // logo clara para fundo escuro

  const hideAll = () => {
    filterPopover.classList.add('hidden');
    favsPopover.classList.add('hidden');
    userPopover.classList.add('hidden');
    if (userBtn) userBtn.setAttribute('aria-expanded', 'false');
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

  function setSignedInUI(isSignedIn) {
    if (isSignedIn) {
      signInBtn && signInBtn.classList.add('hidden');
      userBtn && userBtn.classList.remove('hidden');
    } else {
      userBtn && userBtn.classList.add('hidden');
      signInBtn && signInBtn.classList.remove('hidden');
      hideAll();
    }
    defineTourSteps(); // mantém o tutorial coerente com o estado atual
  }
  // Ação do Sign in (simulado)
  if (signInBtn) {
    signInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setSignedInUI(true);
      // abre o popover ao logar
      positionUserPopover();
    });
  }
  // Ação do Sign out
  if (signOutBtn) {
    signOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setSignedInUI(false);
    });
  }

  function positionUserPopover() {
    if (!userBtn || !userPopover) return;
    const r = userBtn.getBoundingClientRect();
    // mostra para medir
    userPopover.classList.remove('hidden');
    const width = userPopover.offsetWidth;
    // posiciona abaixo alinhado à direita do botão
    userPopover.style.top  = `${r.bottom + 8 + window.scrollY}px`;
    userPopover.style.left = `${r.right - width + window.scrollX}px`;
  }
  if (userBtn) {
    userBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = userPopover.classList.contains('hidden');
      hideAll();
      if (willOpen) {
        userBtn.setAttribute('aria-expanded', 'true');
        positionUserPopover();
      }
    });
  }
  if (userPopoverClose) {
    userPopoverClose.addEventListener('click', () => hideAll());
  }

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    const inside =
      e.target.closest('#filterPopover') ||
      e.target.closest('#favsPopover')   ||
      e.target.closest('#userPopover')   ||
      e.target.closest('#appMenuBtn')    ||
      e.target.closest('#favsBtn')       ||
      e.target.closest('#userBtn');
    if (!inside) hideAll();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideAll();
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
        const isLight = root.classList.contains('light');
        let thumbSrc = img ? img.src : '';
        try {
          if (!isLight && /Brasoes-UFPR\.png/i.test(thumbSrc)) {
            thumbSrc = UFPR_DARK_SRC; // usa logo clara no dark
          }
        } catch(_) {
          /* no-op */
        }
        li.className = 'popover-item';
        li.innerHTML = `
          <a href="${a ? a.href : '#'}" class="popover-link">
            <img src="${thumbSrc}" alt="" class="popover-thumb">
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

  // === TOUR COM OVERLAY ESCURECIDO (padrão) ===
  const boarding = new Boarding();
  function defineTourSteps() {
    const base = [
      {
        element: '#sideResults',
        popover: {
          title: 'Resultados da pesquisa',
          description: 'Aqui você encontra os resultados e atalhos para sistemas e serviços. Role a lista para ver mais.',
          prefferedPosition: 'right'
        }
      },
      {
        element: '#favsBtn',
        popover: {
          title: 'Favoritos',
          description: 'Clique na estrela para abrir seus itens marcados como favorito.',
          prefferedPosition: 'bottom'
        }
      },
      {
        element: '#appMenuBtn',
        popover: {
          title: 'Filtros / Categorias',
          description: 'Use o ícone de grade para filtrar por categoria (Transporte, RU, Biblioteca, etc.).',
          prefferedPosition: 'bottom'
        }
      }
    ];
    // Passo 4 depende do estado: Sign in (deslogado) ou Avatar (logado)
    const signedOut = !userBtn || userBtn.classList.contains('hidden');
    base.push(
      signedOut
        ? {
            element: '#signInBtn',
            popover: {
              title: 'Entrar no Portal',
              description: 'Use o botão “Sign in” para acessar seus atalhos e preferências.',
              prefferedPosition: 'left'
            }
          }
        : {
            element: '#userBtn',
            popover: {
              title: 'Conta e Tema',
              description: 'Clique no seu avatar para abrir o menu e alternar entre dark e light mode.',
              prefferedPosition: 'left'
            }
          }
    );
    boarding.defineSteps(base);
  }
  defineTourSteps();
 
  const startTour = () => {
    // fecha popovers para não “competirem” com o highlight
    hideAll();
    closeToast(toastHelp);
    boarding.start();
  };
 
  // Botão do toast inicia o tour
  if (btnTour) {
    btnTour.addEventListener('click', (e) => {
      e.preventDefault();
      startTour();
    });
  }
  // Botão flutuante de ajuda
  if (helpFab) {
    helpFab.addEventListener('click', (e) => {
      e.preventDefault();
      startTour();
    });
  }
  if (btnNoHelp) {
    btnNoHelp.addEventListener('click', () => closeToast(toastHelp));
  }

  // ===== Tema (dark/light) =====
  const root = document.documentElement; // usa .light no <html>
  // define ícone inicial (escuro = lua)
  root.style.setProperty('--button-icon', 'url(./assets/moon-stars.svg)');
  function applyLogoForTheme(){
    if (!ufprImg) return;
    const isLight = root.classList.contains('light');
    ufprImg.src = isLight ? UFPR_LIGHT_SRC : UFPR_DARK_SRC;
  }
  function toggleMode() {
    root.classList.toggle('light');
    const isLight = root.classList.contains('light');
    root.style.setProperty('--button-icon', isLight ? 'url(./assets/sun.svg)' : 'url(./assets/moon-stars.svg)');
    applyLogoForTheme();
  }
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMode();
      if (typeof window.refreshFavs === 'function') {
        window.refreshFavs();
      }
    });
  }

  setSignedInUI(false);
  applyLogoForTheme();

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
  
  // === Busca: filtrar apenas pelo TÍTULO dos resultados laterais ===
  // Observação: a busca ignora acentos e diferenciação de maiúsculas/minúsculas.
  const searchInput = document.querySelector('.searchbar');
  if (searchInput && sideResults) {
    const headerEl = sideResults.querySelector('.side-results__header');

    const normalize = (s) =>
      (s || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
        .toLowerCase();

    const applyFilter = (rawQuery) => {
      const q = normalize(rawQuery);
      let visible = 0;

      sideResults.querySelectorAll('.result-item').forEach((li) => {
        const titleEl = li.querySelector('.result-title');
        const title = normalize(titleEl ? titleEl.textContent : '');
        const match = !q || title.includes(q);
        li.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      if (headerEl) {
        headerEl.innerHTML = !q
          ? 'Resultados para: <strong>Serviços essenciais do estudante UFPR</strong>'
          : `Resultados (${visible}) para: <strong>${rawQuery}</strong>`;
      }
    };

    searchInput.addEventListener('input', (e) => applyFilter(e.target.value));
    if (searchInput.value) applyFilter(searchInput.value); // aplica se vier com valor preenchido
  }
});