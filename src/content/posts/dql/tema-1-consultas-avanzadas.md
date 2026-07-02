---
title: "Tema 1 · Procesamiento de consultas (DQL)"
published: 2026-06-23
description: "SELECT, JOINs, subconsultas, operaciones de conjunto y funciones de agregado: cómo sacar respuestas de los datos. Acompaña al Video 1 de la Unidad 3."
tags: ["SQL", "DQL", "Consultas", "Oracle"]
category: "DQL"
---

> Esta lectura acompaña al **Video 1** de la Unidad 3. Aquí tienes el mismo contenido para repasar a tu ritmo, con el SQL listo para copiar y practicar en el sandbox.

Ya sabes **crear** tablas (DDL) y **llenarlas** (DML). Ahora la pregunta que de verdad importa en el trabajo: **¿cómo saco respuestas de los datos?** Eso es **DQL**, y el comando es uno solo: `SELECT`.

Trabajamos con dos tablas del cine: `funcion` (las películas en cartelera) y `venta` (cada entrada vendida).

## SELECT + WHERE: elegir columnas y filtrar filas

```sql
SELECT pelicula, precio
FROM funcion
WHERE precio > 25;
```

`SELECT` dice **qué columnas** quieres; `WHERE` dice **qué filas**. Sin `WHERE`, traes todo.

## JOIN: combinar información de varias tablas

Una venta solo guarda `id_funcion`, no el nombre de la película. Para verlo, **unes** las dos tablas por su columna común:

```sql
SELECT v.id_venta, f.pelicula, v.cliente
FROM venta v
JOIN funcion f ON v.id_funcion = f.id_funcion;
```

- `INNER JOIN` (o solo `JOIN`) → solo las filas que **coinciden** en ambas tablas.
- `LEFT JOIN` → **todas** las de la izquierda, aunque no tengan pareja a la derecha. Sirve para ver, por ejemplo, las películas **sin ninguna venta**:

```sql
SELECT f.pelicula, COUNT(v.id_venta) AS ventas
FROM funcion f
LEFT JOIN venta v ON f.id_funcion = v.id_funcion
GROUP BY f.pelicula;
```

También existen `RIGHT JOIN` y `CROSS JOIN`, pero el 90% del trabajo real es `INNER` y `LEFT`.

## Funciones de agregado: resumir muchos datos en uno

`COUNT`, `SUM`, `AVG`, `MAX`, `MIN` **resumen** un conjunto de filas en un solo valor. Casi siempre van con `GROUP BY` (agrupar) y, si hace falta filtrar los grupos, con `HAVING`:

```sql
-- Recaudación por película (suma del precio de sus ventas)
SELECT f.pelicula, SUM(f.precio) AS recaudacion
FROM venta v
JOIN funcion f ON v.id_funcion = f.id_funcion
GROUP BY f.pelicula;

-- Solo las películas con más de una venta
SELECT f.pelicula, COUNT(*) AS ventas
FROM venta v
JOIN funcion f ON v.id_funcion = f.id_funcion
GROUP BY f.pelicula
HAVING COUNT(*) > 1;
```

Regla clave: `WHERE` filtra **filas** (antes de agrupar); `HAVING` filtra **grupos** (después de agregar).

## Subconsultas: una consulta dentro de otra

A veces necesitas el resultado de una consulta **como entrada** de otra. Se usa mucho con `IN`, `NOT IN` y `EXISTS`:

```sql
-- Películas que NO tienen ninguna venta
SELECT pelicula
FROM funcion
WHERE id_funcion NOT IN (SELECT id_funcion FROM venta);

-- Películas que SÍ tienen al menos una venta
SELECT pelicula
FROM funcion f
WHERE EXISTS (SELECT 1 FROM venta v WHERE v.id_funcion = f.id_funcion);
```

## Operaciones de conjunto

Combinan los resultados de dos consultas: `UNION` (une y quita duplicados), `INTERSECT` (lo que está en ambas), `EXCEPT` (lo de la primera que no está en la segunda).

> **Oracle vs Postgres:** en Oracle la diferencia se llama `MINUS`; en PostgreSQL es `EXCEPT`. El sandbox traduce `MINUS → EXCEPT` automáticamente, así que puedes escribir en Oracle.

## En una frase

DQL es el lenguaje de las **respuestas**: eliges (`SELECT`), filtras (`WHERE`), combinas (`JOIN`), resumes (`GROUP BY` + agregados) y anidas (subconsultas). De aquí salen los reportes y las decisiones. En el [Tema 2](/unidad-3/consultas-en-la-practica/) lo llevamos al caso real: resolvemos **reportes de la cadena de cines** paso a paso.
