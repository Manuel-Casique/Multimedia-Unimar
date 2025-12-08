
document.addEventListener('DOMContentLoaded', () => {
  const activeFilters = {};
  let currentPage = 1;

  // ---- AJUSTE DE ALTURA DE SIDEBAR ----
  function ajustarAlturaSidebar() {
    const sidebar = document.querySelector('.sidebar-container');
    const tarjetas = document.querySelectorAll('.card');

    if (sidebar && tarjetas.length > 0) {
      if (tarjetas.length === 1) {
        sidebar.style.height = '600px';
      } else {
        const ultimaTarjeta = tarjetas[tarjetas.length - 1];
        const bottomTarjeta = ultimaTarjeta.getBoundingClientRect().bottom + window.scrollY;

        const topSidebar = sidebar.getBoundingClientRect().top + window.scrollY;
        const nuevaAltura = bottomTarjeta - topSidebar;

        sidebar.style.height = `${nuevaAltura}px`;
      }
    } else if (sidebar) {
      sidebar.style.height = 'auto';
    }
  }

  // ---- CARGA DE PUBLICACIONES ----
  function updatePublications(page = 1) {
    currentPage = page;

    const searchValue = document.getElementById('searchInput')?.value.trim();
    const paramsObj = {...activeFilters, page};

    if (searchValue && searchValue.length > 0) {
      paramsObj.search = searchValue;
    } else {
      delete paramsObj.search;
    }

    const params = new URLSearchParams(paramsObj).toString();

    fetch('fetch_publicaciones.php?' + params)
      .then(response => response.text())
      .then(html => {
        document.getElementById('contenedor-publicaciones').innerHTML = html;
        ajustarAlturaSidebar();
        updatePaginationLinks();
      })
      .catch(err => console.error('Error cargando publicaciones:', err));
  }

  // ---- EVENTOS DE FILTRO ----
  document.querySelectorAll('.filter-item, .collapse-sub-item').forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      const group = item.getAttribute('data-filter-group');
      const value = item.getAttribute('data-filter-value');

      if (activeFilters[group] === value) {
        delete activeFilters[group];
        item.classList.remove('active');
      } else {
        document.querySelectorAll(`[data-filter-group="${group}"]`).forEach(el => el.classList.remove('active'));
        activeFilters[group] = value;
        item.classList.add('active');
      }

      currentPage = 1;
      updatePublications(currentPage);
    });
  });

  // ---- EVENTOS DE BUSQUEDA ----
  document.getElementById('searchBtn')?.addEventListener('click', () => {
    currentPage = 1;
    updatePublications();
  });
  document.getElementById('searchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      currentPage = 1;
      updatePublications();
    }
  });

  // ---- ACTUALIZAR ENLACES DE PAGINACIÓN ----
  function updatePaginationLinks() {
    document.querySelectorAll('.pagination .page-link').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        const url = new URL(link.href);
        const page = url.searchParams.get('page') || 1;
        updatePublications(parseInt(page));
      });
    });
  }

  // ---- CARGA INICIAL ----
  updatePublications(currentPage);
});