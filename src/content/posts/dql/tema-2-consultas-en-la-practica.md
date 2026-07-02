---
title: "Tema 3.2 · Consultas en la práctica (reportes del cine)"
published: 2026-06-23
description: "Resolvemos reportes reales de la cadena de cines paso a paso: recaudación por película, películas sin ventas y las más vendidas, usando JOINs, agregados y subconsultas. Acompaña al Video 2 de la Unidad 3."
tags: ["SQL", "DQL", "Consultas", "Oracle"]
category: "DQL"
---

> Esta lectura acompaña al **Video 2** de la Unidad 3. Reproduce los mismos reportes que luego resuelves en el **sandbox**. Ejecútalos también en [Oracle Live SQL](https://livesql.oracle.com).

El cine ya tiene su cartelera (`funcion`) y sus ventas (`venta`) cargadas. Ahora el gerente pide **reportes**, y de eso se trata consultar: convertir datos en respuestas para decidir. Partimos de estos datos:

```sql
-- funcion
-- 1  Duna 2          25.00  Sala 1
-- 2  Intensamente 2  22.00  Sala 2
-- 3  Deadpool 3      28.00  Sala 1
-- 4  Avatar 3        30.00  Sala 3   ← sin ventas

-- venta
-- 100  1  F12  Alvaro     (Duna 2)
-- 101  1  F13  Sofia      (Duna 2)
-- 102  2  A1   Luis       (Intensamente 2)
-- 103  1  G5   Mara       (Duna 2)
-- 104  3  B2   Ana        (Deadpool 3)
```

## Reporte 1 · ¿Cuánto recaudó cada película?

Unimos las dos tablas, agrupamos por película y sumamos el precio de sus ventas: `JOIN` + `GROUP BY` + `SUM`.

```sql
SELECT f.pelicula, SUM(f.precio) AS recaudacion
FROM venta v
JOIN funcion f ON v.id_funcion = f.id_funcion
GROUP BY f.pelicula;
```

| pelicula | recaudacion |
|---|---|
| Duna 2 | 75.00 |
| Intensamente 2 | 22.00 |
| Deadpool 3 | 28.00 |

Duna 2 lidera con sus **tres** entradas (3 × 25).

## Reporte 2 · ¿Qué película no vendió nada?

Aquí entra la **subconsulta en el WHERE**: pedimos las películas cuyo `id_funcion` **no aparece** entre las que sí tienen ventas.

```sql
SELECT pelicula
FROM funcion
WHERE id_funcion NOT IN (SELECT id_funcion FROM venta);
```

Resultado: **Avatar 3**. (El mismo resultado se logra con un `LEFT JOIN` y filtrando las que quedan en cero.)

## Reporte 3 · ¿Qué películas sí tuvieron ventas?

Al revés, con `EXISTS`: para cada película, comprobamos que **exista** al menos una venta suya (es una subconsulta *correlacionada*: usa `f.id_funcion` de la consulta externa).

```sql
SELECT pelicula
FROM funcion f
WHERE EXISTS (
  SELECT 1 FROM venta v WHERE v.id_funcion = f.id_funcion
);
```

Resultado: **Duna 2, Intensamente 2 y Deadpool 3**.

## Reporte 4 · La película más vendida

Contamos ventas por película con `GROUP BY` + `COUNT`, y nos quedamos con la de más (aquí, filtrando las que superan una venta con `HAVING`):

```sql
SELECT f.pelicula, COUNT(*) AS ventas
FROM venta v
JOIN funcion f ON v.id_funcion = f.id_funcion
GROUP BY f.pelicula
HAVING COUNT(*) > 1;
```

Resultado: **Duna 2**, con 3 ventas.

## La lección de la unidad

Cuatro preguntas del negocio, cuatro consultas, cuatro decisiones con datos:

- **JOIN** para combinar lo que vive separado (ventas ↔ películas).
- **GROUP BY + agregados** para resumir (recaudación, conteos).
- **Subconsultas** (`NOT IN`, `EXISTS`) para preguntar por lo que aparece… o lo que falta.
- **HAVING** para filtrar grupos.

Ahora te toca a ti: resuelve estos reportes —y algunos más— en el **sandbox** de la Unidad 3, y cierra con la **evaluación final**. Vuelve a la [Unidad 3](/unidad-3/).
