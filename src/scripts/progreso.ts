// Helper de progreso del curso (localStorage). Lo usan tanto los islands React
// como el script cliente de la sidebar. Seguro en SSR (guarda con typeof).

const KEY = "querylab:unidad1";

export interface Progreso {
	completed: string[];
	correo: string;
	ejercicios: Record<string, boolean>;
}

const vacio: Progreso = { completed: [], correo: "", ejercicios: {} };

export function leerProgreso(): Progreso {
	if (typeof localStorage === "undefined") return { ...vacio };
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { ...vacio };
		const p = JSON.parse(raw);
		return {
			completed: Array.isArray(p.completed) ? p.completed : [],
			correo: typeof p.correo === "string" ? p.correo : "",
			ejercicios: p.ejercicios && typeof p.ejercicios === "object" ? p.ejercicios : {},
		};
	} catch {
		return { ...vacio };
	}
}

function guardar(p: Progreso) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(KEY, JSON.stringify(p));
	// Avisar a otros componentes/sidebar en la misma página.
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("querylab:progreso"));
	}
}

export function marcarLeccion(slug: string) {
	const p = leerProgreso();
	if (!p.completed.includes(slug)) {
		p.completed.push(slug);
		guardar(p);
	}
}

export function leccionCompletada(slug: string): boolean {
	return leerProgreso().completed.includes(slug);
}

export function setCorreo(correo: string) {
	const p = leerProgreso();
	p.correo = correo;
	guardar(p);
}

export function marcarEjercicio(id: string, aprobado: boolean) {
	const p = leerProgreso();
	p.ejercicios[id] = aprobado;
	guardar(p);
}

/** Porcentaje 0–100 de lecciones completadas sobre el total de la unidad. */
export function porcentaje(totalLecciones: number): number {
	if (totalLecciones <= 0) return 0;
	return Math.round((leerProgreso().completed.length / totalLecciones) * 100);
}
