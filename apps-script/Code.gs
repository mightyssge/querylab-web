/**
 * Query Lab — Backend de respuestas (Google Apps Script)
 * ------------------------------------------------------
 * Recibe los formularios (pre/post) y los eventos del sandbox de ejercicios,
 * y los guarda como filas en una Google Sheet. La hoja es el "ERP":
 * cuentas participantes, ves quién terminó (correo @ulima.edu.pe), comparas
 * pre vs post y revisas qué ejercicios resolvió cada quien.
 *
 * El puntaje de los tests (0–5) se calcula AQUÍ (no en el navegador) para que
 * la clave de respuestas no se filtre. Pestañas: Pre, Post, Ejercicios.
 *
 * Despliegue: ver apps-script/README.md
 */

var CAMPOS = {
	pre: ['q1', 'q2', 'q3', 'q4', 'q5'],
	post: ['q1', 'q2', 'q3', 'q4', 'q5'],
};

// Clave de respuestas correctas (índice 0-based). Mantener en sincronía con
// src/components/querylab/surveyData.ts
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

function hojaCon(tab, header) {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getSheetByName(tab);
	if (!sheet) sheet = ss.insertSheet(tab);
	if (sheet.getLastRow() === 0) sheet.appendRow(header);
	return sheet;
}

function correoNorm(c) {
	return String(c || '').trim().toLowerCase();
}

function guardarEjercicio(data) {
	var sheet = hojaCon('Ejercicios', [
		'timestamp', 'unidad', 'correo', 'ejercicio_id', 'aprobado',
	]);
	sheet.appendRow([
		new Date(),
		data.unidad || 1,
		correoNorm(data.correo),
		data.ejercicio_id || '',
		data.aprobado ? 'SI' : 'NO',
	]);
}

function guardarTest(data) {
	var tipo = data.tipo === 'post' ? 'post' : 'pre';
	var tab = tipo === 'post' ? 'Post' : 'Pre';
	var campos = CAMPOS[tipo];
	var sheet = hojaCon(
		tab,
		['timestamp', 'unidad', 'nombre', 'correo', 'puntaje']
			.concat(campos)
			.concat(['comentarios', 'recomienda', 'satisfaccion']),
	);

	var respuestas = data.respuestas || {};
	var puntaje = calcularPuntaje(tipo, data.indices);
	var fila = [
		new Date(),
		data.unidad || data.sprint || 1,
		data.nombre || '',
		correoNorm(data.correo),
		puntaje,
	];
	campos.forEach(function (k) {
		fila.push(respuestas[k] != null ? respuestas[k] : '');
	});
	fila.push(data.comentarios || '');
	fila.push(data.recomienda || '');
	fila.push(data.satisfaccion || '');
	sheet.appendRow(fila);
	return puntaje;
}

function doPost(e) {
	try {
		var data = JSON.parse(e.postData.contents);
		if (data.tipo === 'ejercicios') {
			guardarEjercicio(data);
			return ContentService
				.createTextOutput(JSON.stringify({ ok: true }))
				.setMimeType(ContentService.MimeType.JSON);
		}
		var puntaje = guardarTest(data);
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
