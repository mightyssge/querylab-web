/**
 * Query Lab — Backend de respuestas (Google Apps Script)
 * ------------------------------------------------------
 * Recibe los formularios nativos de la plataforma (encuesta pre y post)
 * y los guarda como filas en una Google Sheet. La hoja es el "ERP":
 * desde ahí cuentas participantes, ves quién terminó (correo @ulima.edu.pe)
 * y comparas pre vs post para medir el aprendizaje.
 *
 * El puntaje (0–5) se calcula AQUÍ (no en el navegador del alumno) para que
 * la clave de respuestas no se filtre y la medición sea confiable.
 *
 * Despliegue: ver apps-script/README.md
 */

// Columnas de respuestas por tipo de formulario.
var CAMPOS = {
	pre: ['q1', 'q2', 'q3', 'q4', 'q5'],
	post: ['q1', 'q2', 'q3', 'q4', 'q5'],
};

// Clave de respuestas correctas (índice de la opción correcta, 0-based).
// Mantener en sincronía con el orden de opciones en src/components/querylab/surveyData.ts
var CLAVE = {
	pre: [1, 2, 0, 1, 3],
	post: [3, 2, 2, 1, 1],
};

function calcularPuntaje(tipo, indices) {
	if (!indices) return '';
	var clave = CLAVE[tipo] || [];
	var campos = CAMPOS[tipo] || [];
	var puntaje = 0;
	for (var i = 0; i < campos.length; i++) {
		if (Number(indices[campos[i]]) === clave[i]) puntaje++;
	}
	return puntaje;
}

function doPost(e) {
	try {
		var data = JSON.parse(e.postData.contents);
		var tipo = data.tipo === 'post' ? 'post' : 'pre';
		var tab = tipo === 'post' ? 'Post' : 'Pre';

		var ss = SpreadsheetApp.getActiveSpreadsheet();
		var sheet = ss.getSheetByName(tab);
		if (!sheet) {
			sheet = ss.insertSheet(tab);
		}

		var campos = CAMPOS[tipo];

		// Cabecera (solo la primera vez)
		if (sheet.getLastRow() === 0) {
			var header = ['timestamp', 'sprint', 'nombre', 'correo', 'puntaje']
				.concat(campos)
				.concat(['comentarios', 'recomienda', 'satisfaccion']);
			sheet.appendRow(header);
		}

		var respuestas = data.respuestas || {};
		var puntaje = calcularPuntaje(tipo, data.indices);

		var fila = [
			new Date(),
			data.sprint || 1,
			data.nombre || '',
			String(data.correo || '').trim().toLowerCase(),
			puntaje,
		];
		campos.forEach(function (k) {
			fila.push(respuestas[k] != null ? respuestas[k] : '');
		});
		fila.push(data.comentarios || '');
		fila.push(data.recomienda || '');
		fila.push(data.satisfaccion || '');

		sheet.appendRow(fila);

		return ContentService
			.createTextOutput(JSON.stringify({ ok: true, puntaje: puntaje }))
			.setMimeType(ContentService.MimeType.JSON);
	} catch (err) {
		return ContentService
			.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
			.setMimeType(ContentService.MimeType.JSON);
	}
}

function doGet() {
	return ContentService.createTextOutput('Query Lab endpoint OK');
}
