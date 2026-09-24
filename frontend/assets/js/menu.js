/**
 * =============================================================================
 * CAFETERÍA ZENTENO - JS DEL MENÚ (menu.js)
 * Carga dinámica desde API REST, filtrado interactivo y modales de producto
 * =============================================================================
 */

$(document).ready(function () {
  'use strict';

  const apiBase = window.API_BASE_URL || 'http://localhost:5101';
  let currentProductSelected = '';

  // 1. CARGA DINÁMICA DE LA CARTA DESDE LA API (.NET / PostgreSQL)
  function loadMenuFromApi() {
    $.ajax({
      url: `${apiBase}/api/products`,
      type: 'GET',
      dataType: 'json',
      timeout: 3000,
    })
      .done(function (products) {
        if (Array.isArray(products) && products.length > 0) {
          console.log(`Se cargaron ${products.length} productos dinámicamente desde la API.`);
          renderProducts(products);
        }
      })
      .fail(function () {
        console.info('API de productos no disponible. Utilizando carta estática de contingencia.');
      });
  }

  // Renderiza las tarjetas dinámicas preservando clases y filtros
  function renderProducts(products) {
    const $grid = $('#menuGrid');
    let html = '';

    products.forEach(function (prod) {
      const categorySlug = prod.category ? prod.category.slug : 'cafes-calientes';
      const badgeHtml = prod.badge 
        ? `<span class="menu-badge">${escapeHtml(prod.badge)}</span>` 
        : '';
      const extractionHtml = prod.extractionMethod 
        ? `<div class="menu-extraction-tag"><i class="bi bi-gear-wide-connected"></i> ${escapeHtml(prod.extractionMethod)}</div>` 
        : '';
      const imgUrl = prod.imageUrl || 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80';
      const formattedPrice = '$' + parseFloat(prod.price).toFixed(2);

      html += `
        <div class="col-md-6 col-lg-4 menu-item-col ${escapeHtml(categorySlug)}">
          <article class="menu-card">
            <div class="menu-card-img-wrapper">
              <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(prod.name)}" loading="lazy">
              ${badgeHtml}
              <span class="menu-price">${formattedPrice}</span>
            </div>
            <div class="menu-card-body">
              ${extractionHtml}
              <h3 class="menu-card-title">${escapeHtml(prod.name)}</h3>
              <p class="menu-card-desc">${escapeHtml(prod.description || '')}</p>
              <button type="button" class="btn btn-card-detail" 
                data-notes="Perfil aromático de origen, acidez balanceada y notas selectas." 
                data-allergens="Consultar opciones vegetales o alérgenos en barra.">
                <i class="bi bi-info-circle me-1"></i> Ver Detalles y Maridaje
              </button>
            </div>
          </article>
        </div>
      `;
    });

    $grid.html(html);

    // Reaplicar filtro activo actual
    const currentFilter = $('.btn-filter.active').attr('data-filter') || 'all';
    applyMenuFilter(currentFilter);
  }

  // 2. FILTRADO DINÁMICO DE CATEGORÍAS DEL MENÚ
  function applyMenuFilter(filterValue) {
    const $menuItems = $('.menu-item-col');
    if (filterValue === 'all') {
      $menuItems.stop(true, true).fadeIn(300);
    } else {
      $menuItems.each(function () {
        const $item = $(this);
        if ($item.hasClass(filterValue)) {
          $item.stop(true, true).fadeIn(300);
        } else {
          $item.stop(true, true).fadeOut(200);
        }
      });
    }
  }

  $(document).on('click', '.btn-filter', function () {
    const $thisBtn = $(this);
    const filterValue = $thisBtn.attr('data-filter');

    $('.btn-filter').removeClass('active');
    $thisBtn.addClass('active');

    applyMenuFilter(filterValue);
  });

  // 3. MODAL INFORMATIVO DINÁMICO PARA DETALLE DE PRODUCTOS
  $(document).on('click', '.btn-card-detail', function () {
    const $btn = $(this);
    const $card = $btn.closest('.menu-card');

    const title = $card.find('.menu-card-title').text();
    const desc = $card.find('.menu-card-desc').text();
    const price = $card.find('.menu-price').text();
    const extraction = $card.find('.menu-extraction-tag').text().trim();
    const imgSrc = $card.find('.menu-card-img-wrapper img').attr('src');
    const badge = $card.find('.menu-badge').text() || 'Especialidad Zenteno';
    const notes = $btn.attr('data-notes') || 'Perfil aromático balanceado y preparación artesanal en barra.';
    const allergens = $btn.attr('data-allergens') || 'Sin alérgenos comunes.';

    currentProductSelected = title;

    const $modal = $('#productDetailModal');
    $modal.find('#modalProductTitle').text(title);
    $modal.find('#modalProductImg').attr('src', imgSrc).attr('alt', title);
    $modal.find('#modalProductPrice').text(price);
    $modal.find('#modalProductExtraction').text(extraction || 'Preparación de Especialidad');
    $modal.find('#modalProductBadge').text(badge);
    $modal.find('#modalProductDesc').text(desc);
    $modal.find('#modalProductNotes').text(notes);
    $modal.find('#modalProductAllergens').text(allergens);

    const modalInstance = new bootstrap.Modal(document.getElementById('productDetailModal'));
    modalInstance.show();
  });

  // 4. ACCIÓN DEL BOTÓN "PEDIR EN RESERVA"
  $(document).on('click', '#btnModalReserveProduct', function () {
    if (currentProductSelected) {
      const $notes = $('#resNotes');
      const currentNotes = $notes.val().trim();
      const preferenceText = `Deseo degustar en mesa: ${currentProductSelected}`;

      if (currentNotes) {
        if (!currentNotes.includes(currentProductSelected)) {
          $notes.val(`${currentNotes} | ${preferenceText}`);
        }
      } else {
        $notes.val(preferenceText);
      }
    }
  });

  // Utilidad para escape de HTML
  function escapeHtml(str) {
    if (!str) return '';
    return $('<div>').text(str).html();
  }

  // Inicializar carga de carta
  loadMenuFromApi();
});
