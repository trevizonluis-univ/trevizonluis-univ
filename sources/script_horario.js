// ======================================================================
// SISTEMA DE GESTIÓN DE HORARIOS ACADÉMICOS - UCLA
// ======================================================================
// 
// Este código implementa un sistema completo para gestionar horarios de clases
// con tres turnos (mañana, tarde y noche). Incluye funcionalidades para:
// - Registrar materias en bloques horarios
// - Visualizar horarios en tablas interactivas
// - Detección de conflictos de horario
// - Impresión profesional del horario
// - Gestión de turnos y días de la semana
//
// Estructura principal:
// 1. Variables globales con configuración de horarios
// 2. Inicialización de eventos y UI
// 3. Funciones de gestión de horarios (registro, actualización)
// 4. Funciones de visualización (tablas dinámicas)
// 5. Utilidades (impresión, limpieza, navegación)
//
// Autor: Luis Trevizon (Ayuda de Deepseek)
// Versión: 1.0
// ======================================================================

// ==========================
// VARIABLES GLOBALES
// ==========================
// Arrays con valores y textos para los bloques horarios de cada turno:
// - value_*: Valores numéricos de bloques (1 = primer bloque)
// - texto_*: Rangos horarios reales (ej: "7:25-8:10")
const value_m = ["", "1", "2", "3", "4", "5", "6"];
const value_t = ["", "1", "2", "3", "4", "5"];
const value_n = ["", "1", "2", "3", "4", "5"];

const texto_m = ["N/A", "7:25-8:10", "8:10-8:55", "9:00-9:45", "9:45-10:35", "10:35-11:20", "11:25-12:05"];
const texto_t = ["N/A", "12:40-1:20", "1:20-2:00", "2:00-2:40", "2:45-3:25", "3:25-4:05"];
const texto_n = ["N/A", "5:00-5:40", "5:40-6:20", "6:20-7:00", "7:05-7:45", "7:45-8:25"];

// Días de la semana (lunes a sábado)
const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

// Estructura principal para almacenar todos los eventos:
// - 3 turnos (m=mañana, t=tarde, n=noche)
// - Por cada turno: matriz de [bloques x días]
// - Ej: eventos.m[3][2] = evento del bloque 3 (mañana) del miércoles
const eventos = {
    m: Array(7).fill().map(() => Array(6).fill(null)), // 7 bloques x 6 días
    t: Array(6).fill().map(() => Array(6).fill(null)), // 6 bloques x 6 días
    n: Array(6).fill().map(() => Array(6).fill(null))  // 6 bloques x 6 días
};

// ==========================
// INICIALIZACIÓN
// ==========================
// Configura los eventos iniciales al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    // Event listeners para checkboxes de turnos
    document.querySelectorAll('#check_m, #check_t, #check_n').forEach(checkbox => {
        checkbox.addEventListener('change', mostrar_turnos);
    });

    // Event listener para selector de turnos
    document.getElementById('turno').addEventListener('change', cambia_turnos);

    // Mostrar todos los turnos inicialmente (checkboxes activados por defecto)
    document.querySelectorAll('#check_m, #check_t, #check_n').forEach(checkbox => {
        checkbox.checked = true;
    });
    mostrar_turnos();

    // Inicializar selector de turnos
    cambia_turnos();
});

// ==========================
// FUNCIONES DE GESTIÓN DE HORARIOS
// ==========================

/**
 * Muestra u oculta las tablas de horarios según los checkboxes seleccionados
 * No recibe parámetros y no retorna valores (efecto lateral en el DOM)
 */
function mostrar_turnos() {
    document.getElementById('hidden_m').hidden = !document.getElementById('check_m').checked;
    document.getElementById('hidden_t').hidden = !document.getElementById('check_t').checked;
    document.getElementById('hidden_n').hidden = !document.getElementById('check_n').checked;
}

/**
 * Redirige a la página principal (index.html)
 */
function volverIndex() {
    window.location.href = "index.html";
}

/**
 * Actualiza los selectores de hora según el turno seleccionado
 * Depende de los arrays value_* y texto_* definidos globalmente
 */
function cambia_turnos() {
    const turno = document.getElementById('turno').value;
    const hora_entrada = document.getElementById('hora_entrada');
    const hora_salida = document.getElementById('hora_salida');

    // Limpiar selectores
    hora_entrada.innerHTML = '';
    hora_salida.innerHTML = '';

    if (turno) {
        let value_arr, texto_arr;

        // Seleccionar arrays según el turno
        switch (turno) {
            case 'm':
                value_arr = value_m;
                texto_arr = texto_m;
                break;
            case 't':
                value_arr = value_t;
                texto_arr = texto_t;
                break;
            case 'n':
                value_arr = value_n;
                texto_arr = texto_n;
                break;
        }

        // Llenar los selectores con las opciones del turno
        for (let i = 0; i < value_arr.length; i++) {
            const option1 = document.createElement('option');
            option1.value = value_arr[i];
            option1.text = texto_arr[i];
            hora_entrada.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = value_arr[i];
            option2.text = texto_arr[i];
            hora_salida.appendChild(option2);
        }
    } else {
        // Opción por defecto si no hay turno seleccionado
        const option1 = document.createElement('option');
        option1.value = '';
        option1.text = 'N/A';
        hora_entrada.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = '';
        option2.text = 'N/A';
        hora_salida.appendChild(option2);
    }
}

/**
 * Registra un nuevo evento en el horario con validaciones
 * Proceso:
 * 1. Recoge datos del formulario
 * 2. Realiza validaciones básicas
 * 3. Verifica conflictos de horario
 * 4. Almacena el evento en la estructura 'eventos'
 * 5. Actualiza la visualización
 */
function registrar() {
    // 1. Recoger datos del formulario
    const materia = document.getElementById('materia').value.trim();
    const dia = parseInt(document.getElementById('dia').value);
    const profesor = document.getElementById('prof_nom').value.trim();
    const salon = document.getElementById('salon_num').value.trim();
    const turno = document.getElementById('turno').value;
    const entrada = parseInt(document.getElementById('hora_entrada').value);
    const salida = parseInt(document.getElementById('hora_salida').value);

    // 2. Validaciones básicas
    if (!turno) {
        alert('Por favor seleccione un turno');
        return;
    }

    if (isNaN(dia) || dia < 1 || dia > 6) {
        alert('Por favor seleccione un día válido');
        return;
    }

    if (isNaN(entrada) || isNaN(salida) || entrada < 1 || salida < 1) {
        alert('Por favor seleccione horas válidas');
        return;
    }

    if (entrada > salida) {
        alert('La hora de entrada no puede ser posterior a la hora de salida');
        return;
    }

    if (materia === '') {
        alert('Por favor ingrese el nombre de la materia');
        return;
    }

    // 3. Verificar disponibilidad
    const diaIndex = dia - 1; // Convertir a índice base 0

    // Verificar si hay conflicto en alguno de los bloques
    let conflicto = false;
    for (let bloque = entrada; bloque <= salida; bloque++) {
        if (eventos[turno][bloque] && eventos[turno][bloque][diaIndex]) {
            conflicto = true;
            break;
        }
    }

    if (conflicto) {
        alert('Conflicto de horario: Uno o más bloques ya están ocupados');
        return;
    }

    // 4. Crear y almacenar el evento
    const evento = {
        materia: materia,
        profesor: profesor || 'N/A',
        salon: salon || 'N/A',
        entrada,
        salida
    };

    // Guardar en todos los bloques que ocupa
    for (let bloque = entrada; bloque <= salida; bloque++) {
        if (!eventos[turno][bloque]) eventos[turno][bloque] = Array(6).fill(null);
        eventos[turno][bloque][diaIndex] = evento;
    }

    // 5. Actualizar UI y limpiar formulario
    actualizarTablaTurno(turno);
    limpiarFormulario();
}

/**
 * Actualiza la tabla HTML para un turno específico
 * @param {string} turno - Letra identificadora del turno ('m', 't' o 'n')
 */
function actualizarTablaTurno(turno) {
    const tbody = document.getElementById(`turno_${turno}`);
    tbody.innerHTML = '';

    // Configuración según turno
    let numBloques, horas;
    switch (turno) {
        case 'm':
            numBloques = 6;
            horas = texto_m.slice(1);
            break;
        case 't':
            numBloques = 5;
            horas = texto_t.slice(1);
            break;
        case 'n':
            numBloques = 5;
            horas = texto_n.slice(1);
            break;
    }

    // Construir filas de la tabla
    for (let bloque = 1; bloque <= numBloques; bloque++) {
        const tr = document.createElement('tr');
        tr.id = `${bloque}${turno}`;

        // Celda de hora (primera columna)
        const horaTd = document.createElement('td');
        horaTd.className = 'hora-col';
        horaTd.textContent = horas[bloque - 1];
        tr.appendChild(horaTd);

        // Celdas para cada día
        for (let dia = 0; dia < 6; dia++) {
            const evento = eventos[turno][bloque] ? eventos[turno][bloque][dia] : null;

            // Si hay un evento que COMIENZA en este bloque
            if (evento && evento.entrada === bloque) {
                const duracion = evento.salida - evento.entrada + 1;
                const td = document.createElement('td');

                // Configurar rowSpan si ocupa múltiples bloques
                if (duracion > 1) {
                    td.rowSpan = duracion;
                }

                td.className = 'filled-cell';

                // Contenido de la celda
                td.innerHTML = `
                    <div>
                        <div class="event-title">${evento.materia}</div>
                        <div>Prof: ${evento.profesor}</div>
                        <div>Salón: ${evento.salon}</div>
                    </div>
                `;

                tr.appendChild(td);
            }
            // Si no hay evento o el evento no comienza aquí
            else if (!evento) {
                // Celda vacía si no hay evento
                const td = document.createElement('td');
                tr.appendChild(td);
            }
            // Nota: Si hay evento pero no comienza aquí, no se añade celda
            // (ya fue cubierto por rowSpan)
        }

        tbody.appendChild(tr);
    }
}

/**
 * Limpia todos los campos del formulario
 */
function limpiarFormulario() {
    document.getElementById('materia').value = '';
    document.getElementById('prof_nom').value = '';
    document.getElementById('salon_num').value = '';
    document.getElementById('hora_entrada').value = '';
    document.getElementById('hora_salida').value = '';
    document.getElementById('dia').value = '';
    document.getElementById('turno').value = '';
}

/**
 * Genera una ventana de impresión con el horario completo
 * Incluye:
 * - Logo institucional
 * - Fecha actual
 * - Tablas de horarios visibles
 * - Estilos optimizados para impresión
 */
function PrintTable() {
    // Preparar recursos
    const currentDate = new Date().toLocaleDateString();
    const content = document.getElementById('dvContents').innerHTML;

    // Estilos CSS para impresión
    const css = ` <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                    }
                    .print-header { 
                        text-align: center; 
                        margin-bottom: 20px; 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 20px;
                    }
                    .print-logo { 
                        height: 80px; 
                        margin: 0; 
                    }
                    .print-title { 
                        font-size: 24px; 
                        font-weight: bold; 
                        margin: 10px 0; 
                    }
                    .turno-header { 
                        background-color: #1a3a6c; 
                        color: white; 
                        padding: 10px; 
                        text-align: center; 
                        font-size: 18px; 
                        margin-top: 20px; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 30px; 
                    }
                    th, td { 
                        border: 1px solid #000; 
                        padding: 8px; 
                        text-align: center; 
                    }
                    th { 
                        background-color: #f2f2f2; 
                    }
                    .hora-col { 
                        background-color: #e6f7ff; 
                        font-weight: bold; 
                        width: 100px; 
                    }
                    .filled-cell { 
                        background-color: #e0f2f1; 
                    }
                    .espacio-libre { 
                        background-color: #ffebee; 
                    }
                    .print-footer {
                        text-align: center; 
                        margin-top: 30px; 
                        font-style: italic;
                    }
                    @media print {
                        body { 
                            margin: 0.5cm; 
                        }
                        .no-print { 
                            display: none !important; 
                        }
                    }
                </style>
            `;

    // Script para auto-impresión
    const script = document.createElement('script');
    script.innerHTML = `window.onload = function() {
        setTimeout(function() {
            window.print();
            window.onafterprint = function() {
                window.close();
            };
        }, 200);
    }`;

    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank');

    // Construir documento de impresión
    printWindow.document.write(`
        <html>
            <head>
                <title>Horario Personalizado - UCLA</title>
                ${css}
            </head>
            <body>
                <div class="print-header">
                    <img src="logos/ucla.jpg" class="print-logo" alt="Logo UCLA">
                    <div>
                        <div class="print-title">Horario Personalizado - UCLA 2025-1</div>
                        <div>${currentDate}</div>
                    </div>
                    <img src="logos/dcee.jpg" class="print-logo" alt="Logo DCEE">
                </div>
                ${content}
                <div class="print-footer">
                    Generado el ${currentDate}
                </div>
            </body>
        </html>
    `);

    printWindow.document.write(script.outerHTML);
    printWindow.document.close();

    // Manejar bloqueo de popups
    if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
        alert('Por favor permite popups para esta página para poder imprimir.');
    }
}

/**
 * Limpia todos los eventos de un turno específico
 * Solicita confirmación antes de proceder
 */
function limpiar_tabla() {
    const turno = prompt("Escoja el turno para limpiar (m=mañana, t=tarde, n=noche)");

    if (turno && ['m', 't', 'n'].includes(turno)) {
        const turnoNombre =
            turno === 'm' ? 'mañana' :
                turno === 't' ? 'tarde' : 'noche';

        if (confirm(`¿Está seguro que desea limpiar todo el turno de ${turnoNombre}?`)) {
            // Reiniciar la estructura de datos
            eventos[turno] = Array(eventos[turno].length).fill().map(() => Array(6).fill(null));
            actualizarTablaTurno(turno);
            alert('Turno limpiado exitosamente');
        }
    } else {
        alert('Turno no válido. Use m, t o n');
    }
}