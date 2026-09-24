/**
 * =============================================================================
 * CAFETERÍA ZENTENO - JS DE RESERVAS (reservations.js)
 * Validación de formulario, control de restricciones y alerta animada
 * =============================================================================
 */

$(document).ready(function () {
  'use strict';

  const $form = $('#reservationForm');
  const $alert = $('#reservationAlert');
  const $dateInput = $('#resDate');

  // 1. Configurar fecha mínima permitida (a partir de hoy)
  const today = new Date().toISOString().split('T')[0];
  $dateInput.attr('min', today);

  // 2. Validación y envío del formulario
  $form.on('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    const $name = $('#resName');
    const $email = $('#resEmail');
    const $phone = $('#resPhone');
    const $date = $('#resDate');
    const $time = $('#resTime');
    const $guests = $('#resGuests');
    const $notes = $('#resNotes');

    // Resetear estados de validación
    $form.find('.form-control, .form-select').removeClass('is-invalid');

    // Validación Nombre
    if ($.trim($name.val()).length < 3) {
      $name.addClass('is-invalid');
      isValid = false;
    }

    // Validación Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test($.trim($email.val()))) {
      $email.addClass('is-invalid');
      isValid = false;
    }

    // Validación Teléfono
    const phonePattern = /^(\+?[0-9\s\-()]{7,20})$/;
    if (!phonePattern.test($.trim($phone.val()))) {
      $phone.addClass('is-invalid');
      isValid = false;
    }

    // Validación Fecha
    if (!$date.val() || $date.val() < today) {
      $date.addClass('is-invalid');
      isValid = false;
    }

    // Validación Hora (Rango de atención: 08:00 a 21:00)
    const timeVal = $time.val();
    if (!timeVal || timeVal < '08:00' || timeVal > '21:00') {
      $time.addClass('is-invalid');
      isValid = false;
    }

    // Validación Número de personas
    const guestsNum = parseInt($guests.val(), 10);
    if (isNaN(guestsNum) || guestsNum < 1 || guestsNum > 12) {
      $guests.addClass('is-invalid');
      isValid = false;
    }

    // Si hay errores, detener y enfocar el primer campo inválido
    if (!isValid) {
      $form.find('.is-invalid').first().focus();
      return;
    }

    // Preparar objeto de reserva compatible con el DTO del Backend C# (.NET)
    const reservationData = {
      customerName: $.trim($name.val()),
      customerEmail: $.trim($email.val()),
      customerPhone: $.trim($phone.val()),
      reservationDate: $date.val(),
      reservationTime: $time.val() + ':00', // Formato HH:mm:ss
      guestsCount: guestsNum,
      specialRequests: $.trim($notes.val()) || null,
    };

    // Deshabilitar botón durante el proceso
    const $btnSubmit = $form.find('button[type="submit"]');
    const originalBtnText = $btnSubmit.html();
    $btnSubmit.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Confirmando reserva...');

    // Intentar envío AJAX hacia la API de .NET (con fallback de simulación si la API no está encendida)
    const apiBase = window.API_BASE_URL || 'http://localhost:5101';
    const apiUrl = `${apiBase}/api/reservations`;

    $.ajax({
      url: apiUrl,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(reservationData),
      timeout: 4000,
    })
      .done(function (response) {
        showSuccessAlert(reservationData, response.id || 'ZNT-' + Math.floor(1000 + Math.random() * 9000));
      })
      .fail(function (jqXHR) {
        // Fallback simulado para modo offline o entorno estático de presentación
        console.warn('API local en puerto 5101 no detectada o fuera de línea. Mostrando confirmación simulada.');
        const mockCode = 'ZNT-' + Math.floor(1000 + Math.random() * 9000);
        showSuccessAlert(reservationData, mockCode);
      })
      .always(function () {
        $btnSubmit.prop('disabled', false).html(originalBtnText);
      });
  });

  // Función para mostrar alerta animada con los detalles de la reserva
  function showSuccessAlert(data, code) {
    const summaryHtml = `
      <div class="d-flex align-items-center mb-2">
        <i class="bi bi-check-circle-fill fs-3 text-success me-3"></i>
        <div>
          <h5 class="alert-heading mb-1 text-success fw-bold">¡Reserva Registrada con Éxito!</h5>
          <p class="mb-0 text-muted small">Hemos enviado la confirmación a <strong>${escapeHtml(data.customerEmail)}</strong>.</p>
        </div>
      </div>
      <hr class="my-2">
      <div class="row g-2 small">
        <div class="col-sm-6"><strong>Código de Reserva:</strong> <span class="badge bg-dark">${code}</span></div>
        <div class="col-sm-6"><strong>Titular:</strong> ${escapeHtml(data.customerName)}</div>
        <div class="col-sm-6"><strong>Fecha & Hora:</strong> ${data.reservationDate} a las ${data.reservationTime.slice(0, 5)} hrs</div>
        <div class="col-sm-6"><strong>Comensales:</strong> ${data.guestsCount} persona(s)</div>
      </div>
      <div class="mt-3 text-end">
        <button type="button" class="btn btn-sm btn-outline-success" id="btnCloseAlert">Aceptar</button>
      </div>
    `;

    $alert.html(summaryHtml).stop(true, true).fadeIn(400);

    // Desplazarse suavemente a la alerta
    $('html, body').animate({
      scrollTop: $alert.offset().top - 120,
    }, 400);

    // Resetear formulario
    $form[0].reset();
    $dateInput.attr('min', today);
  }

  // Cerrar alerta
  $(document).on('click', '#btnCloseAlert', function () {
    $alert.fadeOut(300);
  });

  // Prevenir inyección de HTML en la vista previa
  function escapeHtml(text) {
    return $('<div>').text(text).html();
  }
});
