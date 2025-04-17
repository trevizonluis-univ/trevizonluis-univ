// ==========================
// VARIABLES GLOBALES
// ==========================

var datosnum = [];
var numero = 0;

var value_m = ["", "1", "2", "3", "4", "5", "6"];
var value_t = ["", "1", "2", "3", "4", "5"];
var value_n = ["", "1", "2", "3", "4", "5"];

var texto_m = ["N/A", "7:25-8:10", "8:10-8:55", "9:00-9:45", "9:45-10:35", "10:35-11:20", "11:25-12:05"];
var texto_t = ["N/A", "12:40-1:20", "1:20-2:00", "2:00-2:40", "2:45-3:25", "3:25-4:05"];
var texto_n = ["N/A", "5:00-5:40", "5:40-6:20", "6:20-7:00", "7:05-7:45", "7:45-8:25"];

const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];


// =========================
// CLASES
// =========================

class HorarioEntrada {
    constructor(nombre, prof_nom = "N/A", salon_num = "N/A", hora_entrada, hora_salida) {
        this.prof_nombr = prof_nom.length === 0 ? "N/A" : prof_nom;
        this.salon_numer = salon_num.length === 0 ? "N/A" : salon_num;
        this.nombre = `${nombre}\nProf ${this.prof_nombr}\nSalon ${this.salon_numer}`;;
        this.hora_entrada = hora_entrada;
        this.hora_salida = hora_salida;
    }
}

// ==========================
// FUNCIONES DE UTILIDAD DE CELDAS
// ==========================

// Obtener una celda específica, creándola si no existe
function getCell(y, x, t) {
    const rowId = `${y}${t}`;
    const row = document.getElementById(rowId);
    if (!row) return null;

    while (row.cells.length <= x) {
        const newCell = row.insertCell(-1);
        newCell.classList.add("empty-cell");
    }

    return row.cells[x];
}

// Establecer contenido de celda con rowspan
function setCell(yInicio, x, contenido, yFin = yInicio, t) {
    const duracion = yFin - yInicio + 1;

    const row = document.getElementById(`${yInicio}${t}`);
    if (!row) return;

    while (row.cells.length <= x) {
        const filler = row.insertCell(-1);
        filler.classList.add("empty-cell");
    }

    const cell = row.cells[x];

    cell.innerText = contenido;
    if (duracion > 1) {
        cell.rowSpan = duracion;
    }

    cell.classList.add("white-space-pre");
    cell.classList.remove("empty-cell");
    cell.classList.add("filled-cell");

    for (let y = yInicio + 1; y <= yFin; y++) {
        const siguienteFila = document.getElementById(`${y}${t}`);
        if (siguienteFila && siguienteFila.cells.length > x) {
            siguienteFila.deleteCell(x);
        }
    }
}


// ==========================
// FUNCIONES DE GESTIÓN DE HORARIOS
// ==========================

// Registrar una nueva clase o espacio libre
function registrar() {
    var materias = $("#materia").val();
    var dia = $("#dia").val();
    dia = parseInt(dia);
    var prof_nom = $("#prof_nom").val();
    var salon_num = $("#salon_num").val();
    var hora_entrada = parseInt($("#hora_entrada").val());
    var hora_salida = parseInt($("#hora_salida").val());
    var turno = $("#turno").val();

    if (turno != "") {
        if ($("#espacio").is(":checked") && hora_entrada <= hora_salida) {
            setCell(hora_entrada, turno, "  ", hora_salida, turno);
        } else {
            if (materias.length == 0 || hora_entrada.length == 0 || hora_salida.length == 0 || hora_entrada > hora_salida || dia.length == 0) {
                alert("No hay datos.");
                return false;
            } else {
                datosnum.push(new HorarioEntrada(materias, prof_nom, salon_num, hora_entrada, hora_salida))
                console.log(datosnum);
            }
            setCell(hora_entrada, dia, datosnum[numero].nombre, hora_salida, turno);
            numero++;

            // Resetear campos
            $("#materia").val("");
            $("#prof_nom").val("");
            $("#salon_num").val("");
            $("#hora_entrada").val("");
            $("#hora_salida").val("");
            $("dia").val("");
        }
    } else {
        alert("No hay datos.");
        return false;
    }
    $("#espacio").prop("checked", false);
}

// Cambiar las opciones de hora según turno
function cambia_turnos() {
    var hora_entrada = document.getElementById("hora_entrada");
    var hora_salida = document.getElementById("hora_salida");
    var turno = document.getElementById("turno").value;

    if (turno != "") {
        var value = eval("value_" + turno);
        var texto = eval("texto_" + turno);
        var num_turno = value.length;

        hora_entrada.length = num_turno;
        hora_salida.length = num_turno;

        for (var i = 0; i < num_turno; i++) {
            hora_entrada.options[i].value = value[i];
            hora_entrada.options[i].text = texto[i];
            hora_salida.options[i].value = value[i];
            hora_salida.options[i].text = texto[i];
        }
    } else {
        hora_entrada.length = 1;
        hora_entrada.options[0].value = "";
        hora_entrada.options[0].text = "N/A";
        hora_salida.length = 1;
        hora_salida.options[0].value = "";
        hora_salida.options[0].text = "N/A";
    }
}

// Mostrar/ocultar turnos según checkboxes
function mostrar_turnos() {
    $("#hidden_m").toggle($("#check_m").is(":checked"));
    $("#hidden_t").toggle($("#check_t").is(":checked"));
    $("#hidden_n").toggle($("#check_n").is(":checked"));
}


// ==========================
// FUNCIONES DE UTILIDAD GENERAL
// ==========================

// Imprimir el contenido del horario
function PrintTable() {
    var printWindow = window.open('', '', 'height=200,width=400');
    printWindow.document.write('<html><head><title>HORARIO</title>');

    var table_style = document.getElementById("table_style").innerHTML;
    printWindow.document.write('<style type = "text/css">');
    printWindow.document.write(table_style);
    printWindow.document.write('</style>');
    printWindow.document.write('</head>');

    printWindow.document.write('<body>');
    var divContents = document.getElementById("dvContents").innerHTML;
    printWindow.document.write(divContents);
    printWindow.document.write('</body>');
    printWindow.document.write('</html>');
    printWindow.document.close();
    printWindow.print();
}

// Limpiar todas las filas de una tabla por turno
function limpiar_tabla() {
    var turno = prompt("Escoja el turno para limpiar (m=mañana, t=tarde, n=noche)");
    if (turno != "") {
        if (turno == "m") {
            $("#turno_m").html(`
                <tr id='1m'><td>7:25-8:10</td></tr>
                <tr id='2m'><td>8:10-8:55</td></tr>
                <tr id='3m'><td>9:00-9:45</td></tr>
                <tr id='4m'><td>9:45-10:35</td></tr>
                <tr id='5m'><td>10:35-11:20</td></tr>
                <tr id='6m'><td>11:25-12:05</td></tr>`);
        } else if (turno == "t") {
            $("#turno_t").html(`
                <tr id='1t'><td>12:40-1:20</td></tr>
                <tr id='2t'><td>1:20-2:00</td></tr>
                <tr id='3t'><td>2:00-2:40</td></tr>
                <tr id='4t'><td>2:45-3:25</td></tr>
                <tr id='5t'><td>3:25-4:05</td></tr>`);
        } else if (turno == "n") {
            $("#turno_n").html(`
                <tr id='1n'><td>5:00-5:40</td></tr>
                <tr id='2n'><td>5:40-6:20</td></tr>
                <tr id='3n'><td>6:20-7:00</td></tr>
                <tr id='4n'><td>7:05-7:45</td></tr>
                <tr id='5n'><td>7:45-8:25</td></tr>`);
        }
    } else {
        alert("No hay tabla seleccionada.");
        return false;
    }
}