// Tracking de eventos de aprendizaje (estilo Coursera) hacia el mismo Web App
// de Apps Script. Envío "fire-and-forget" en modo no-cors.
//
// El correo recién se pide en la evaluación final, así que cada evento lleva un
// `client_id` anónimo y persistente (localStorage). En el envío final mandamos
// correo + client_id juntos, y el backend puede unir todo el recorrido por ese ID.

import { leerProgreso } from "./progreso";

const CID_KEY = "querylab:cid";

/** ID anónimo y estable por navegador. Se crea la primera vez. */
export function clientId(): string {
	if (typeof localStorage === "undefined") return "";
	let id = localStorage.getItem(CID_KEY);
	if (!id) {
		id = `c_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
		localStorage.setItem(CID_KEY, id);
	}
	return id;
}

/**
 * Emite un evento de aprendizaje. No bloquea ni espera respuesta.
 * @param evento  nombre del evento (ver_leccion, completo_leccion, intento_ejercicio, ...)
 * @param detalle datos extra del evento (se guardan como JSON en la hoja)
 * @param unidad  número de unidad, si aplica
 */
export function track(
	evento: string,
	detalle: Record<string, unknown> = {},
	unidad?: number,
): void {
	if (typeof window === "undefined") return;
	const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;
	const payload = {
		tipo: "evento",
		client_id: clientId(),
		correo: leerProgreso().correo || "",
		unidad: unidad ?? "",
		evento,
		detalle,
		ts_cliente: new Date().toISOString(),
	};
	if (!endpoint) {
		// Modo demo: sin endpoint configurado, solo log.
		console.debug("[track demo]", evento, detalle);
		return;
	}
	try {
		fetch(endpoint, {
			method: "POST",
			mode: "no-cors",
			headers: { "Content-Type": "text/plain;charset=utf-8" },
			keepalive: true, // permite que el evento salga aunque se navegue/cierre
			body: JSON.stringify(payload),
		});
	} catch {
		/* fire-and-forget: si falla, no rompemos la experiencia */
	}
}
