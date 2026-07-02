// Ejercicios de PROCESAMIENTO DE CONSULTAS (DQL) — Unidad 3.
// SELECT, WHERE, JOINs, subconsultas, agregados y HAVING sobre el caso cine.
// Son ejercicios `consulta`: el motor corre la consulta del alumno y compara su
// resultado con el de `solucion` (no valida el estado de la BD).

import type { Exercise, Vista } from "./exercises";

// --- Datos del cine (con Avatar 3 sin ventas, para LEFT JOIN / subconsultas) ---
const CINE = `CREATE TABLE academico.funcion (
  id_funcion INT PRIMARY KEY,
  pelicula   VARCHAR(100) NOT NULL,
  precio     NUMERIC(6,2) NOT NULL,
  sala       VARCHAR(20) NOT NULL
);
CREATE TABLE academico.venta (
  id_venta   INT PRIMARY KEY,
  id_funcion INT NOT NULL REFERENCES academico.funcion(id_funcion),
  butaca     VARCHAR(5) NOT NULL,
  cliente    VARCHAR(100) NOT NULL
);
INSERT INTO academico.funcion (id_funcion, pelicula, precio, sala) VALUES
 (1, 'Duna 2', 25.00, 'Sala 1'),
 (2, 'Intensamente 2', 22.00, 'Sala 2'),
 (3, 'Deadpool 3', 28.00, 'Sala 1'),
 (4, 'Avatar 3', 30.00, 'Sala 3');
INSERT INTO academico.venta (id_venta, id_funcion, butaca, cliente) VALUES
 (100, 1, 'F12', 'Alvaro'),
 (101, 1, 'F13', 'Sofia'),
 (102, 2, 'A1', 'Luis'),
 (103, 1, 'G5', 'Mara'),
 (104, 3, 'B2', 'Ana');`;

const V_FUNCION: Vista = {
	label: "Datos: academico.funcion",
	sql: "SELECT id_funcion, pelicula, precio, sala FROM academico.funcion ORDER BY id_funcion",
};
const V_VENTA: Vista = {
	label: "Datos: academico.venta",
	sql: "SELECT id_venta, id_funcion, butaca, cliente FROM academico.venta ORDER BY id_venta",
};
const FUENTE = [V_FUNCION, V_VENTA];

export const EJERCICIOS_CONSULTAS: Exercise[] = [
	{
		id: "dql-01-where",
		titulo: "1 · Filtrar filas (SELECT + WHERE)",
		enunciado:
			"Muestra **`pelicula`** y **`precio`** de las funciones cuyo precio sea **mayor a 25** (en ese orden de columnas).",
		consulta: true,
		setupSQL: CINE,
		starter: "SELECT pelicula, precio\nFROM academico.funcion\nWHERE /* completa */ ;",
		solucion: "SELECT pelicula, precio FROM academico.funcion WHERE precio > 25",
		mostrar: FUENTE,
	},
	{
		id: "dql-02-inner-join",
		titulo: "2 · Combinar tablas (INNER JOIN)",
		enunciado:
			"Cada venta con el nombre de su película. Muestra **`id_venta`**, **`pelicula`** y **`cliente`** uniendo `venta` con `funcion`.",
		consulta: true,
		setupSQL: CINE,
		starter:
			"SELECT v.id_venta, f.pelicula, v.cliente\nFROM academico.venta v\nJOIN academico.funcion f ON /* completa */ ;",
		solucion:
			"SELECT v.id_venta, f.pelicula, v.cliente FROM academico.venta v JOIN academico.funcion f ON v.id_funcion = f.id_funcion",
		mostrar: FUENTE,
	},
	{
		id: "dql-03-left-join",
		titulo: "3 · Incluir las que no tienen (LEFT JOIN)",
		enunciado:
			"Cuántas ventas tiene **cada** película, **incluyendo las que no vendieron ninguna**. Muestra **`pelicula`** y el conteo (columna **`ventas`**). Pista: `LEFT JOIN` + `COUNT(v.id_venta)`.",
		consulta: true,
		setupSQL: CINE,
		starter:
			"SELECT f.pelicula, COUNT(v.id_venta) AS ventas\nFROM academico.funcion f\nLEFT JOIN academico.venta v ON f.id_funcion = v.id_funcion\nGROUP BY /* completa */ ;",
		solucion:
			"SELECT f.pelicula, COUNT(v.id_venta) AS ventas FROM academico.funcion f LEFT JOIN academico.venta v ON f.id_funcion = v.id_funcion GROUP BY f.pelicula",
		mostrar: FUENTE,
	},
	{
		id: "dql-04-group-count",
		titulo: "4 · Contar por grupo (GROUP BY + COUNT)",
		enunciado:
			"Número de ventas por película, **solo de las que vendieron al menos una**. Muestra **`pelicula`** y el conteo (columna **`ventas`**).",
		consulta: true,
		setupSQL: CINE,
		starter:
			"SELECT f.pelicula, COUNT(*) AS ventas\nFROM academico.venta v\nJOIN academico.funcion f ON v.id_funcion = f.id_funcion\nGROUP BY /* completa */ ;",
		solucion:
			"SELECT f.pelicula, COUNT(*) AS ventas FROM academico.venta v JOIN academico.funcion f ON v.id_funcion = f.id_funcion GROUP BY f.pelicula",
		mostrar: FUENTE,
	},
	{
		id: "dql-05-group-sum",
		titulo: "5 · Recaudación por película (GROUP BY + SUM)",
		enunciado:
			"Cuánto recaudó cada película (suma del precio de sus ventas). Muestra **`pelicula`** y la suma (columna **`recaudacion`**). Solo las que tuvieron ventas.",
		consulta: true,
		setupSQL: CINE,
		starter:
			"SELECT f.pelicula, SUM(f.precio) AS recaudacion\nFROM academico.venta v\nJOIN academico.funcion f ON v.id_funcion = f.id_funcion\nGROUP BY /* completa */ ;",
		solucion:
			"SELECT f.pelicula, SUM(f.precio) AS recaudacion FROM academico.venta v JOIN academico.funcion f ON v.id_funcion = f.id_funcion GROUP BY f.pelicula",
		mostrar: FUENTE,
	},
	{
		id: "dql-06-having",
		titulo: "6 · Filtrar grupos (HAVING)",
		enunciado:
			"Películas con **más de una** venta. Muestra **`pelicula`** y el conteo (columna **`ventas`**). Pista: `GROUP BY ... HAVING COUNT(*) > 1`.",
		consulta: true,
		setupSQL: CINE,
		starter:
			"SELECT f.pelicula, COUNT(*) AS ventas\nFROM academico.venta v\nJOIN academico.funcion f ON v.id_funcion = f.id_funcion\nGROUP BY f.pelicula\nHAVING /* completa */ ;",
		solucion:
			"SELECT f.pelicula, COUNT(*) AS ventas FROM academico.venta v JOIN academico.funcion f ON v.id_funcion = f.id_funcion GROUP BY f.pelicula HAVING COUNT(*) > 1",
		mostrar: FUENTE,
	},
	{
		id: "dql-07-subquery-notin",
		titulo: "7 · Subconsulta: las que NO aparecen (NOT IN)",
		enunciado:
			"Películas que **no tienen ninguna venta**. Muestra solo **`pelicula`**. Pista: `WHERE id_funcion NOT IN (SELECT id_funcion FROM venta)`.",
		consulta: true,
		setupSQL: CINE,
		starter:
			"SELECT pelicula\nFROM academico.funcion\nWHERE id_funcion NOT IN (\n  /* completa: los id_funcion que sí vendieron */\n);",
		solucion:
			"SELECT pelicula FROM academico.funcion WHERE id_funcion NOT IN (SELECT id_funcion FROM academico.venta)",
		mostrar: FUENTE,
	},
	{
		id: "dql-08-subquery-exists",
		titulo: "8 · Subconsulta: las que SÍ aparecen (EXISTS)",
		enunciado:
			"Películas que tienen **al menos una venta**. Muestra solo **`pelicula`**. Pista: `EXISTS` o `IN` con una subconsulta a `venta`.",
		consulta: true,
		setupSQL: CINE,
		starter:
			"SELECT pelicula\nFROM academico.funcion f\nWHERE EXISTS (\n  /* completa: que exista una venta de f.id_funcion */\n);",
		solucion:
			"SELECT pelicula FROM academico.funcion f WHERE EXISTS (SELECT 1 FROM academico.venta v WHERE v.id_funcion = f.id_funcion)",
		mostrar: FUENTE,
	},
];
