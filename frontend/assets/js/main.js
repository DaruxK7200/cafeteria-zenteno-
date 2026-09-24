/**
 * =============================================================================
 * CAFETERÍA ZENTENO - JS PRINCIPAL (main.js)
 * Efectos de navegación, scroll dinámico y utilidades globales
 * =============================================================================
 */

$(document).ready(function () {
  'use strict';

  console.log('Cafetería Zenteno UI inicializada con jQuery ' + $.fn.jquery);

  // 1. EFECTO DINÁMICO DE SCROLL EN NAVBAR
  // Al desplazarse más de 50px, se aplica la clase .navbar-scrolled con glassmorphism
  const $navbar = $('#mainNavbar');

  function handleNavbarScroll() {
    if ($(window).scrollTop() > 50) {
      $navbar.addClass('navbar-scrolled');
    } else {
      $navbar.removeClass('navbar-scrolled');
    }
  }

  // Ejecución inicial y al evento scroll
  handleNavbarScroll();
  $(window).on('scroll', handleNavbarScroll);

  // 2. DESPLAZAMIENTO SUAVE (Smooth Scroll) para enlaces con ancla
  $('a.nav-link[href^="#"], a.btn[href^="#"]').on('click', function (e) {
    const target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();

      // Cerrar menú móvil si está desplegado
      const $navbarCollapse = $('.navbar-collapse');
      if ($navbarCollapse.hasClass('show')) {
        $navbarCollapse.collapse('hide');
      }

      const offsetTop = target.offset().top - 70; // Compensación por navbar fijo
      $('html, body').stop().animate(
        {
          scrollTop: offsetTop,
        },
        700,
        'swing'
      );
    }
  });

  // 3. ACTUALIZACIÓN AUTOMÁTICA DEL AÑO EN FOOTER
  $('#currentYear').text(new Date().getFullYear());
});
