// ======================================================================
// SISTEMA DE GESTIÓN DE HORARIOS ACADÉMICOS - UCLA (Módulo de Consulta)
// ======================================================================
//
// Este módulo proporciona funcionalidades para:
// - Consultar horarios por carrera y semestre
// - Visualizar electivas y autodesarrollos
// - Gestionar la presentación de información académica
//
// Estructura principal:
// 1. Base de datos de horarios por carrera/semestre
// 2. Funciones de utilidad para procesamiento de datos
// 3. Funciones de interfaz para mostrar resultados
//
// Autor: Luis Trevizon (Ayuda de Deepseek)
// Versión: 1.0
// ======================================================================

// ==========================
// BASE DE DATOS DE HORARIOS
// ==========================
/**
 * Estructura que contiene todos los códigos de horarios disponibles
 * organizados por carrera y semestre.
 * 
 * Formato:
 *   clave: [carrera]_[semestre]
 *   valor: array de códigos de horario (ej: "m01")
 * 
 * Notas:
 * - Las carreras combinadas (administracion_contaduria) se usan para semestres iniciales
 * - Economía tiene estructura especial para semestres avanzados
 */
const semestres_totales = {
    economia_1: ["m01", "m02", "t01", "t02"],
    economia_2: ["m01", "m02", "t01"],
    economia_3: ["m01", "t01"],
    administracion_contaduria_1: ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "t01", "t02", "t03", "n01", "n02"],
    administracion_contaduria_2: ["m01", "m02", "m03", "m04", "t01", "t02", "t03", "n01", "n02", "n03"],
    administracion_contaduria_3: ["m01", "m02", "m03", "t01", "t02", "n01", "n02"],
    administracion_contaduria_4: ["m01", "m02", "m03", "t01", "n01", "n02"],
    administracion_contaduria_5: ["m01", "m02", "m03", "t02", "n01", "n02", "n03"],
    administracion_contaduria_6: ["m01", "m02", "m03", "n01", "n02"],
    administracion_contaduria_7: ['m01', "m02", "t01", 'n01', 'n02'],
    administracion_contaduria_8: ['m01', "m02", "m03", 'n01', 'n02', 'n03', 'n04'],
    contaduria_9: ["m01", "m02", "m03", "n01", "n02", "n03"],
    administracion_9: ["m01", "m02", "m03", "t01", "n01", "n03"],
    desarrollo_humano_1: ["m01", "m02"],
    desarrollo_humano_2: ["m01", "t01"],
    desarrollo_humano_3: ["t01", "t02"],
    desarrollo_humano_4: ["m01"]
};

// ==========================
// FUNCIONES DE INTERFAZ
// ==========================

/**
 * Limpia los resultados mostrados y restablece los controles de formulario
 * - Borra el contenido del contenedor de resultados
 * - Restablece los selectores a su valor predeterminado ("n/a")
 * - Muestra un estado vacío con icono informativo
 */
function limpiar() {
    document.getElementById("horarios").innerHTML = `
        <div class="empty-result">
            <i class="fas fa-calendar-check" 
               style="font-size: 3rem; color: var(--success); margin-bottom: 15px;"></i>
            <p>Se han limpiado los resultados</p>
            <p class="creator-note">Utilice los controles para realizar una nueva búsqueda</p>
        </div>
    `;
    document.getElementById("carreras").value = "n/a";
    document.getElementById("semestres").value = "n/a";
    document.getElementById("electiva").value = "n/a";
}

/**
 * Genera una clave normalizada para acceder a los horarios
 * @param {string} carrera - Nombre de la carrera (economia, administracion, contaduria)
 * @param {number} nroSemestre - Número del semestre (1-9)
 * @returns {string} Clave normalizada para semestres_totales
 * 
 * Lógica de normalización:
 * - Para administración/contaduría en semestres < 9: usa clave combinada
 * - Para economía en semestre >= 3: usa semestre 3
 */
function getSemesterKey(carrera, nroSemestre) {
    let carreraAcomodada = carrera;
    let nroSemestreAcomodado = nroSemestre;

    // Normalización para administración/contaduría
    if (carrera === "administracion" || carrera === "contaduria") {
        if (nroSemestre < 9) {
            carreraAcomodada = "administracion_contaduria";
        }
    }
    // Normalización para economía
    else if (carrera === "economia") {
        if (nroSemestre >= 3) {
            nroSemestreAcomodado = 3;
        }
    }
    else if (carrera === "desarrollo_humano") {
        if (nroSemestre == 2 || nroSemestre >= 8) {
            nroSemestreAcomodado = 4
        }
        else if (nroSemestre != 2 && nroSemestre != 1 && nroSemestre != 6) {
            nroSemestreAcomodado = 2
        }
        else if (nroSemestre == 6) {
            nroSemestreAcomodado = 3
        }
    }
    console.log(`${carreraAcomodada}_${nroSemestreAcomodado}`)
    return `${carreraAcomodada}_${nroSemestreAcomodado}`;
}

/**
 * Construye las rutas de imágenes para los horarios
 * @param {string[]} arr - Array donde se almacenarán las rutas
 * @param {string} carrera - Nombre de la carrera
 * @param {string} semestre - Semestre en formato "X_semestre"
 * @param {string[]} variable - Array de códigos de horario
 */
function agregar_src(arr, carrera, semestre, variable) {
    for (let i = 0; i < variable.length; i++) {
        // Formato: horarios/[carrera]/[semestre]/[codigo].png
        arr.push("horarios/" + carrera + "/" + semestre + "/" + variable[i] + ".png");
    }
}

/**
 * Obtiene y muestra los horarios según la selección del usuario
 * Flujo principal:
 * 1. Valida selecciones
 * 2. Normaliza clave de búsqueda
 * 3. Recupera códigos de horario
 * 4. Construye rutas de imágenes
 * 5. Genera y muestra HTML con resultados
 */
function getHorario() {
    // 1. Obtener selecciones del usuario
    const carrera = document.getElementById("carreras").value;
    const nro_semestre = document.getElementById("semestres").value;
    const semestre = nro_semestre + "_semestre";
    let src = [];

    // Validación básica
    if (carrera === "n/a" || nro_semestre === "n/a") {
        alert("Por favor, seleccione una carrera y un semestre");
        return;
    }

    // 2. Generar clave normalizada
    const key = getSemesterKey(carrera, nro_semestre);
    console.log(key)
    // 3. Recuperar códigos de horario
    const especifico = semestres_totales[key];
    console.log(especifico)

    if (!especifico) {
        alert("No se encontraron horarios para esta combinación");
        return;
    }

    // 4. Construir rutas de imágenes
    let carreraNombre = carrera;
    // Normalizar nombre para rutas de archivo
    if ((carrera === "administracion" || carrera === "contaduria") && nro_semestre <= 5) {
        carreraNombre = "administracion_contaduria";
    }
    agregar_src(src, carreraNombre, semestre, especifico);

    // 5. Construir HTML de resultados
    let htmlContent = `<h2 class="result-title">Horarios del ${nro_semestre}° semestre - ${carrera.toUpperCase()}</h2>`;

    for (let i = 0; i < especifico.length; i++) {
        let carreraTexto = carrera;
        // Ajustar texto para mostrar al usuario
        if (carreraNombre === "administracion_contaduria") {
            carreraTexto = "administración o contaduría";
        }

        htmlContent += `
            <div class="result-item">
                <p>${especifico[i].toUpperCase()} del ${nro_semestre}° semestre en la carrera de ${carreraTexto.toUpperCase()}</p>
                <img src="${src[i]}" alt="Horario ${especifico[i]}">
            </div>
            <hr class="hr-divider">
        `;
    }

    // Mostrar resultados
    document.getElementById("horarios").innerHTML = htmlContent;
}

/**
 * Redirige a la página de creación de horarios personalizados
 */
function irHorario() {
    window.location.href = "horario.html";
}

/**
 * Muestra las electivas disponibles para una carrera específica
 * - Valida selección de carrera
 * - Construye ruta de imagen según carrera seleccionada
 * - Genera y muestra HTML con resultados
 */
function electivas() {
    const carrera = document.getElementById("electiva").value;

    // Validación
    if (carrera === "n/a") {
        alert("Por favor, seleccione una carrera para ver las electivas");
        return;
    }

    // Mapear valor interno a nombre legible
    let carreraTexto = "";
    if (carrera === "admin_cont") {
        carreraTexto = "administración y contaduría";
    } else {
        carreraTexto = "economía";
    }

    // Construir HTML
    const htmlContent = `
        <h2 class="result-title">Electivas de ${carreraTexto.toUpperCase()}</h2>
                <div class="result-item">
                    <p>Electivas para la carrera de ${carreraTexto.toUpperCase()}</p>
                    <img src="horarios/electivas/${carrera}.png" alt="Electivas ${carreraTexto}">
                </div>
            `;

    document.getElementById("horarios").innerHTML = htmlContent;
}

// Función para mostrar autodesarrollos
function autodesarrollos() {
    const htmlContent = `
                <h2 class="result-title">Autodesarrollos</h2>
                <div class="result-item">
                    <p>Horarios de autodesarrollos</p>
                    <img src="horarios/autodesarrollo/autodesarrollos.png" alt="Autodesarrollos">
                </div>
            `;

    document.getElementById("horarios").innerHTML = htmlContent;
}