// Selecciona todos los elementos con la clase "restricted-input"
const restrictedInputs = document.querySelectorAll('.restricted-input');
restrictedInputs.forEach(function (input) {
    // Añade un listener para el evento "input" en cada elemento
    input.addEventListener('input', function (event) {
        // Obtiene el valor actual del input
        let value = this.value;
        // Reemplaza todos los caracteres que no sean dígitos o el signo '-' con una cadena vacía
        value = value.replace(/[^\d-]/g, '');
        // Asigna el nuevo valor filtrado al input
        this.value = value;
    });
});

(() => {
    'use strict'

    // Selecciona todos los formularios que tienen la clase "needs-validation"
    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
        // Añade un listener para el evento "submit" en cada formulario
        form.addEventListener('submit', event => {
            // Verifica si el formulario es válido
            if (!form.checkValidity()) {
                // Si no es válido, previene el envío del formulario
                event.preventDefault()
                event.stopPropagation()

                // Encuentra el primer elemento inválido en el formulario
                const firstInvalidElement = form.querySelector(':invalid')
                if (firstInvalidElement) {
                    // Desplaza la vista al primer elemento inválido
                    firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    // Opcionalmente, enfoca el primer elemento inválido
                    firstInvalidElement.focus()
                }
            }

            // Añade la clase "was-validated" al formulario
            form.classList.add('was-validated')
        }, false)
    })
})()

// Añade un listener para el evento "submit" en el formulario con id "formulario"
document.getElementById('formulario').addEventListener('submit', function (event) {
    var showError = false;
    var errorMessage = '';

    // Valida el campo NIE
    var nieInput = document.getElementById('nombre_paquete');
    var nieValue = nieInput.value;
    if (nieValue.length < 5) {
        errorMessage = 'El nombre del paquete debe tener 5 caracteres.';
        showError = true;
    }
    // Si hay algún error, muestra el mensaje de error y previene el envío del formulario
    if (showError) {
        showErrorModal(errorMessage);
        event.preventDefault();
    }
});

// Función para mostrar el modal de error con el mensaje correspondiente
function showErrorModal(message) {
    document.getElementById('errorMessage').innerText = message;
    var errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
}