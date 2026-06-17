// Helpers compartidos por los formularios y el sandbox de Query Lab.

export function validateUlimaEmail(email: string): boolean {
	return /^[^@\s]+@ulima\.edu\.pe$/i.test((email || "").trim());
}

/** Normaliza el correo para que sirva como llave estable (minúsculas, sin espacios). */
export function normalizeEmail(email: string): string {
	return (email || "").trim().toLowerCase();
}

export interface SurveyPayload {
	tipo: "pre" | "post";
	unidad: number;
	nombre?: string;
	correo: string;
	/** Texto de la opción elegida por pregunta (q1..q5). Para leer en la hoja. */
	respuestas: Record<string, string>;
	/** Índice de la opción elegida por pregunta. El backend calcula el puntaje con esto. */
	indices: Record<string, number>;
	comentarios?: string;
	recomienda?: string;
	satisfaccion?: number;
}

export interface EjercicioPayload {
	tipo: "ejercicios";
	unidad: number;
	correo: string;
	ejercicio_id: string;
	aprobado: boolean;
}

export interface SubmitResult {
	ok: boolean;
	demo?: boolean;
	error?: string;
}

/**
 * POST único en modo no-cors al Web App de Apps Script (Google Sheet).
 *
 * El Web App NO devuelve cabeceras CORS: con un fetch normal el doPost escribiría
 * la fila pero la lectura fallaría y un retry la duplicaría. Por eso un solo POST
 * "no-cors" (respuesta opaca, la fila se escribe una vez y asumimos éxito).
 * Content-Type text/plain => petición simple, sin preflight.
 * Sin endpoint configurado => modo demo (no guarda).
 */
async function enviar(payload: object): Promise<SubmitResult> {
	const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;

	if (!endpoint) {
		console.warn(
			"[Query Lab] PUBLIC_FORM_ENDPOINT vacío — modo demo: no se guarda.",
		);
		await new Promise((r) => setTimeout(r, 400));
		return { ok: true, demo: true };
	}

	try {
		await fetch(endpoint, {
			method: "POST",
			mode: "no-cors",
			headers: { "Content-Type": "text/plain;charset=utf-8" },
			body: JSON.stringify(payload),
		});
		return { ok: true };
	} catch (err) {
		return { ok: false, error: String(err) };
	}
}

export function submitForm(payload: SurveyPayload): Promise<SubmitResult> {
	return enviar(payload);
}

/** Registra (no bloqueante) que un ejercicio fue aprobado/intentado. */
export function enviarEjercicio(
	correo: string,
	ejercicioId: string,
	aprobado: boolean,
): Promise<SubmitResult> {
	const payload: EjercicioPayload = {
		tipo: "ejercicios",
		unidad: 1,
		correo: normalizeEmail(correo),
		ejercicio_id: ejercicioId,
		aprobado,
	};
	return enviar(payload);
}
