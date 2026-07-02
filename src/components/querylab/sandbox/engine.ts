// Motor del sandbox SQL: PostgreSQL real en el navegador (PGlite, WASM).
// Tolera sintaxis Oracle traduciéndola a Postgres antes de ejecutar.

import type { PGlite } from "@electric-sql/pglite";
import type { Exercise } from "./exercises";

let dbPromise: Promise<PGlite> | null = null;

async function getDb(): Promise<PGlite> {
	if (!dbPromise) {
		dbPromise = (async () => {
			const { PGlite } = await import("@electric-sql/pglite");
			return new PGlite(); // en memoria
		})();
	}
	return dbPromise;
}

/** Traduce los Oracle-ismos más comunes a su equivalente PostgreSQL. */
export function normalizeOracle(sql: string): string {
	return sql
		.replace(/\bVARCHAR2\s*\(/gi, "VARCHAR(")
		.replace(/\bNUMBER\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/gi, "NUMERIC($1,$2)")
		.replace(/\bNUMBER\s*\(\s*(\d+)\s*\)/gi, "NUMERIC($1)")
		.replace(/\bNUMBER\b/gi, "NUMERIC")
		.replace(/GENERATED\s+BY\s+DEFAULT\s+AS\s+IDENTITY/gi, "GENERATED ALWAYS AS IDENTITY")
		// Consultas (DQL): Oracle -> Postgres
		.replace(/\bMINUS\b/gi, "EXCEPT")
		.replace(/\bNVL\s*\(/gi, "COALESCE(")
		.replace(/\bSYSDATE\b/gi, "CURRENT_DATE")
		.replace(/\bFROM\s+DUAL\b/gi, "");
}

function msg(e: unknown): string {
	const m = (e as { message?: string })?.message ?? String(e);
	return m.replace(/^ERROR:\s*/i, "");
}

export interface TablaResult {
	label: string;
	columns: string[];
	rows: unknown[][];
}

export interface EvalResult {
	/** El SQL del estudiante corrió sin error de sintaxis/ejecución. */
	corrio: boolean;
	/** La validación del ejercicio pasó. */
	aprobado: boolean;
	error?: string;
	detalle?: string;
	/** Una o más vistas del resultado (p. ej. varias tablas creadas). */
	tablas?: TablaResult[];
}

/** Ejecuta el SQL del estudiante en un workspace limpio y valida el ejercicio. */
export async function evaluar(
	ex: Exercise,
	studentSQL: string,
): Promise<EvalResult> {
	const db = await getDb();

	// Workspace limpio por ejecución (aislamiento entre intentos).
	try {
		await db.exec(
			"DROP SCHEMA IF EXISTS academico CASCADE; CREATE SCHEMA academico;",
		);
		if (ex.setupSQL?.trim()) await db.exec(normalizeOracle(ex.setupSQL));
	} catch (e) {
		return { corrio: false, aprobado: false, error: `Error de preparación: ${msg(e)}` };
	}

	// Ejercicios de CONSULTA (DQL): se valida comparando el resultado del alumno
	// contra el de la solución de referencia, no el estado de la BD.
	if (ex.consulta) {
		return await evaluarConsulta(db, ex, studentSQL);
	}

	// SQL del estudiante.
	try {
		await db.exec(normalizeOracle(studentSQL));
	} catch (e) {
		return { corrio: false, aprobado: false, error: msg(e) };
	}

	// Vistas del resultado (una o más tablas/consultas).
	const tablas: TablaResult[] = [];
	for (const vista of ex.mostrar || []) {
		try {
			const r = await db.query(vista.sql);
			const fields = (r.fields ?? []) as { name: string }[];
			const columns = fields.map((f) => f.name);
			const rows = (r.rows as Record<string, unknown>[]).map((row) =>
				columns.map((c) => row[c]),
			);
			tablas.push({ label: vista.label, columns, rows });
		} catch {
			/* una vista puede fallar si el alumno no creó esa tabla */
		}
	}

	// Validación.
	try {
		const v = ex.validar ? await ex.validar(db) : { aprobado: true };
		return { corrio: true, aprobado: v.aprobado, detalle: v.detalle, tablas };
	} catch (e) {
		return { corrio: true, aprobado: false, detalle: msg(e), tablas };
	}
}

// --- Ejercicios de consulta (DQL) -----------------------------------------

async function filasDe(db: PGlite, sql: string): Promise<TablaResult> {
	const r = await db.query(sql);
	const fields = (r.fields ?? []) as { name: string }[];
	const columns = fields.map((f) => f.name);
	const rows = (r.rows as Record<string, unknown>[]).map((row) =>
		columns.map((c) => row[c]),
	);
	return { label: "", columns, rows };
}

const claveCelda = (v: unknown): string =>
	v === null || v === undefined ? "␀" : String(v);

/** Compara dos resultados como multiconjuntos de filas (ignora el orden). */
function mismosResultados(a: unknown[][], b: unknown[][]): boolean {
	if (a.length !== b.length) return false;
	const sa = a.map((r) => r.map(claveCelda).join("␟")).sort();
	const sb = b.map((r) => r.map(claveCelda).join("␟")).sort();
	return sa.every((x, i) => x === sb[i]);
}

async function evaluarConsulta(
	db: PGlite,
	ex: Exercise,
	studentSQL: string,
): Promise<EvalResult> {
	let alumno: TablaResult;
	try {
		alumno = await filasDe(db, normalizeOracle(studentSQL));
	} catch (e) {
		return { corrio: false, aprobado: false, error: msg(e) };
	}
	alumno.label = "Tu resultado";

	// Tablas de contexto (datos fuente) para mostrar junto al resultado.
	const contexto: TablaResult[] = [];
	for (const vista of ex.mostrar || []) {
		try {
			const t = await filasDe(db, vista.sql);
			t.label = vista.label;
			contexto.push(t);
		} catch {
			/* ignore */
		}
	}

	let esperado: TablaResult;
	try {
		esperado = await filasDe(db, normalizeOracle(ex.solucion));
	} catch {
		return {
			corrio: true,
			aprobado: false,
			detalle: "No se pudo validar el ejercicio.",
			tablas: [alumno, ...contexto],
		};
	}

	const ok = mismosResultados(alumno.rows, esperado.rows);
	return {
		corrio: true,
		aprobado: ok,
		detalle: ok
			? undefined
			: "El resultado no coincide con el esperado. Revisa las columnas y las filas (¿falta un JOIN, WHERE, GROUP BY o cambiar el orden/nombre de columnas?).",
		tablas: [alumno, ...contexto],
	};
}

/** Helper para validadores: devuelve las filas de una consulta. */
export async function q(
	db: PGlite,
	sql: string,
): Promise<Record<string, unknown>[]> {
	const r = await db.query(sql);
	return r.rows as Record<string, unknown>[];
}
