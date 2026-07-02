---
title: "Tema 2 · PL/SQL: darle lógica a la base"
published: 2026-06-23
description: "Bloques PL/SQL, procedimientos, funciones y triggers: cómo hacer que la base de datos actúe sola. Acompaña al Video 2 de la Unidad 3."
tags: ["SQL", "PLSQL", "Oracle"]
category: "DQL"
---

> Esta lectura acompaña al **Video 2** de la Unidad 3. **PL/SQL es propio de Oracle** y es *procedural*, por eso este tema es video + lectura (no se practica en el sandbox de PostgreSQL). Ejecútalo en [Oracle Live SQL](https://livesql.oracle.com).

Con SQL le **haces preguntas** a la base. Con **PL/SQL** le das **lógica**: que valide, calcule y reaccione **sola**, sin que alguien escriba el comando cada vez. PL/SQL es el lenguaje de programación que Oracle pone *dentro* de la base de datos.

## El bloque PL/SQL

Todo en PL/SQL vive dentro de un bloque con tres partes:

```sql
DECLARE
  v_total NUMBER;               -- variables (opcional)
BEGIN
  SELECT SUM(precio) INTO v_total FROM funcion;   -- lógica
  DBMS_OUTPUT.PUT_LINE('Total: ' || v_total);
END;
/
```

`DECLARE` (variables) → `BEGIN … END` (lo que se ejecuta). Dentro puedes usar SQL, variables, `IF`, bucles, etc.

## Procedimientos: encapsular una tarea

Un **procedimiento** guarda una operación con nombre para reutilizarla. En el cine, registrar una venta validando la butaca:

```sql
CREATE OR REPLACE PROCEDURE registrar_venta(
  p_id_funcion IN NUMBER,
  p_butaca     IN VARCHAR2,
  p_cliente    IN VARCHAR2
) AS
BEGIN
  INSERT INTO venta (id_funcion, butaca, cliente)
  VALUES (p_id_funcion, p_butaca, p_cliente);
  COMMIT;
END;
/

-- Se llama así:
BEGIN
  registrar_venta(1, 'F14', 'Diana');
END;
/
```

## Funciones: devuelven un valor

Una **función** es como un procedimiento pero **retorna** un resultado, así que se puede usar dentro de un `SELECT`:

```sql
CREATE OR REPLACE FUNCTION recaudacion_pelicula(p_pelicula IN VARCHAR2)
RETURN NUMBER AS
  v_total NUMBER;
BEGIN
  SELECT NVL(SUM(f.precio), 0)
  INTO v_total
  FROM venta v
  JOIN funcion f ON v.id_funcion = f.id_funcion
  WHERE f.pelicula = p_pelicula;
  RETURN v_total;
END;
/

-- Se usa como cualquier función:
SELECT recaudacion_pelicula('Duna 2') AS total FROM dual;
```

## Triggers: que la base reaccione sola

Un **trigger** (disparador) es código que se ejecuta **automáticamente** cuando ocurre un evento (`INSERT`, `UPDATE`, `DELETE`), sin que nadie lo llame. Por ejemplo, impedir vender dos veces la misma butaca:

```sql
CREATE OR REPLACE TRIGGER trg_butaca_unica
BEFORE INSERT ON venta
FOR EACH ROW
DECLARE
  v_existe NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_existe
  FROM venta
  WHERE id_funcion = :NEW.id_funcion AND butaca = :NEW.butaca;

  IF v_existe > 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'Esa butaca ya está vendida.');
  END IF;
END;
/
```

Ahora, aunque alguien intente insertar una butaca repetida, **la base lo bloquea sola**. Esa es la idea: la lógica de negocio vive dentro de la base y se cumple siempre.

## Paquetes (mención)

Un **package** agrupa procedimientos y funciones relacionados bajo un mismo nombre (por ejemplo, un paquete `taquilla` con todo lo de ventas). Ordena el código y es una práctica común en proyectos Oracle reales.

## En una frase

SQL **pregunta**; PL/SQL **automatiza**. Con procedimientos encapsulas tareas, con funciones calculas valores reutilizables, y con triggers la base **reacciona sola** para hacer cumplir las reglas del negocio. Con esto cierras el recorrido de Query Lab: diseñar (DDL), mantener (DML), consultar (DQL) y automatizar (PL/SQL).

Vuelve a la [Unidad 3](/unidad-3/) para practicar las **consultas** en el sandbox y cerrar con la evaluación final.
