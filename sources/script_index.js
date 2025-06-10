// Datos de los horarios
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
    administracion_9: ["m01", "m02", "m03", "t01", "n01", "n03"]
};

// Función para limpiar los resultados y formularios
function limpiar() {
    document.getElementById("horarios").innerHTML = `
                <div class="empty-result">
                    <i class="fas fa-calendar-check" style="font-size: 3rem; color: var(--success); margin-bottom: 15px;"></i>
                    <p>Se han limpiado los resultados</p>
                    <p class="creator-note">Utilice los controles para realizar una nueva búsqueda</p>
                </div>
            `;
    document.getElementById("carreras").value = "n/a";
    document.getElementById("semestres").value = "n/a";
    document.getElementById("electiva").value = "n/a";
}

// Función para obtener la clave del semestre
function getSemesterKey(carrera, nroSemestre) {
    let carreraAcomodada = carrera;
    let nroSemestreAcomodado = nroSemestre;

    if (carrera === "administracion" || carrera === "contaduria") {
        if (nroSemestre < 9) {
            carreraAcomodada = "administracion_contaduria";
        }
    } else if (carrera === "economia") {
        if (nroSemestre >= 3) {
            nroSemestreAcomodado = 3;
        }
    }

    return `${carreraAcomodada}_${nroSemestreAcomodado}`;
}

// Función para agregar rutas de imágenes
function agregar_src(arr, carrera, semestre, variable) {
    for (let i = 0; i < variable.length; i++) {
        arr.push("horarios/" + carrera + "/" + semestre + "/" + variable[i] + ".png");
    }
}

// Función para obtener horarios
function getHorario() {
    const carrera = document.getElementById("carreras").value;
    const nro_semestre = document.getElementById("semestres").value;
    const semestre = nro_semestre + "_semestre";
    let src = [];

    if (carrera === "n/a" || nro_semestre === "n/a") {
        alert("Por favor, seleccione una carrera y un semestre");
        return;
    }

    const key = getSemesterKey(carrera, nro_semestre);
    const especifico = semestres_totales[key];

    if (!especifico) {
        alert("No se encontraron horarios para esta combinación");
        return;
    }

    let carreraNombre = carrera;
    if ((carrera === "administracion" || carrera === "contaduria") && nro_semestre <= 5) {
        carreraNombre = "administracion_contaduria";
    }

    agregar_src(src, carreraNombre, semestre, especifico);

    let htmlContent = `<h2 class="result-title">Horarios del ${nro_semestre}° semestre - ${carrera.toUpperCase()}</h2>`;

    for (let i = 0; i < especifico.length; i++) {
        let carreraTexto = carrera;
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

    document.getElementById("horarios").innerHTML = htmlContent;
}

//Funcion para ir a horario.html

function irHorario() {
    window.location.href = "horario.html";
}

// Función para mostrar electivas
function electivas() {
    const carrera = document.getElementById("electiva").value;

    if (carrera === "n/a") {
        alert("Por favor, seleccione una carrera para ver las electivas");
        return;
    }

    let carreraTexto = "";
    if (carrera === "admin_cont") {
        carreraTexto = "administración y contaduría";
    } else {
        carreraTexto = "economía";
    }

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