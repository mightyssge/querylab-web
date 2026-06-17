// Helpers compartidos por los formularios nativos de Query Lab.

export function validateUlimaEmail(email: string): boolean {
	return /^[^@\s]+@ulima\.edu\.pe$/i.test((email || "").trim());
}

/** Normaliza el correo para que sirva como llave estable (minúsculas, sin espacios). */
export function normalizeEmail(email: string): string {
	return (email || "").trim().toLowerCase();
}

export interface SurveyPayload {
	tipo: "pre" | "post";
	sprint: number;
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

export interface SubmitResult {
	ok: boolean;
	demo?: boolean;
	error?: string;
}

/**
 * Envía la respuesta al Web App de Apps Script (Google Sheet).
 *
 * Diseño (sitio estático, sin servidor propio):
 * - Un Web App de Apps Script NO devuelve cabeceras CORS. Un fetch normal (mode "cors")
 *   ejecutaría el doPost (escribe la fila) y luego fallaría al leer la respuesta; un retry
 *   duplicaría la fila. Por eso usamos un único POST en modo "no-cors": la fila se escribe
 *   una sola vez y asumimos éxito (no podemos leer la respuesta cross-origin de todos modos).
 * - Content-Type text/plain => petición "simple", sin preflight.
 * - Si no hay endpoint configurado, modo demo (no guarda).
 */
export async function submitForm(payload: SurveyPayload): Promise<SubmitResult> {
	const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;

	if (!endpoint) {
		console.warn(
			"[Query Lab] PUBLIC_FORM_ENDPOINT vacío — modo demo: la respuesta NO se guarda.",
		);
		await new Promise((r) => setTimeout(r, 500));
		return { ok: true, demo: true };
	}

	try {
		await fetch(endpoint, {
			method: "POST",
			mode: "no-cors",
			headers: { "Content-Type": "text/plain;charset=utf-8" },
			body: JSON.stringify(payload),
		});
		// Respuesta opaca por no-cors: el POST se entregó y la fila se escribió una vez.
		return { ok: true };
	} catch (err) {
		return { ok: false, error: String(err) };
	}
}
