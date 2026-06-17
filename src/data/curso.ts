// Fuente única de verdad de la estructura del curso Query Lab.
// Una "Unidad" agrupa "Lecciones" en orden.

export type TipoLeccion = "form-pre" | "leccion" | "ejercicios" | "form-post";

export interface Leccion {
	slug: string;
	titulo: string;
	subtitulo?: string;
	tipo: TipoLeccion;
	/** Nombre de icono Material Symbols para la sidebar. */
	icon: string;
	/** ID de video de YouTube (solo tipo "leccion"). */
	yt?: string;
	/** ID de la entrada en la colección "posts" (solo tipo "leccion"). */
	post?: string;
	duracion?: string;
}

export interface Unidad {
	id: string;
	numero: number;
	titulo: string;
	descripcion: string;
	basePath: string;
	lecciones: Leccion[];
}

export const UNIDAD_1: Unidad = {
	id: "unidad-1",
	numero: 1,
	titulo: "DDL · Definición de Datos",
	descripcion:
		"Aprende a crear, modificar y eliminar la estructura de una base de datos con criterio de negocio.",
	basePath: "/unidad-1",
	lecciones: [
		{
			slug: "evaluacion-inicial",
			titulo: "Evaluación inicial",
			subtitulo: "Mide tu punto de partida",
			tipo: "form-pre",
			icon: "quiz",
		},
		{
			slug: "ddl-en-concepto",
			titulo: "DDL en concepto",
			subtitulo: "Qué es y por qué importa",
			tipo: "leccion",
			icon: "play-circle",
			yt: "mT8_HsbvxB8",
			post: "ddl/tema-1-fundamentos-ddl",
			duracion: "8 min",
		},
		{
			slug: "ddl-en-la-practica",
			titulo: "DDL en la práctica",
			subtitulo: "Un caso real: cadena de cines",
			tipo: "leccion",
			icon: "play-circle",
			yt: "AcVFCgvzXZU",
			post: "ddl/tema-2-ddl-en-la-practica",
			duracion: "8 min",
		},
		{
			slug: "practica",
			titulo: "Practica con el sandbox",
			subtitulo: "10 ejercicios ejecutables",
			tipo: "ejercicios",
			icon: "terminal",
		},
		{
			slug: "evaluacion-final",
			titulo: "Evaluación final",
			subtitulo: "Mide lo aprendido y finaliza",
			tipo: "form-post",
			icon: "task-alt",
		},
	],
};

export const UNIDADES: Unidad[] = [UNIDAD_1];

export function getLeccion(unidad: Unidad, slug: string): Leccion | undefined {
	return unidad.lecciones.find((l) => l.slug === slug);
}

/** Devuelve índice y las lecciones anterior/siguiente para la navegación. */
export function navLeccion(unidad: Unidad, slug: string) {
	const index = unidad.lecciones.findIndex((l) => l.slug === slug);
	return {
		index,
		total: unidad.lecciones.length,
		prev: index > 0 ? unidad.lecciones[index - 1] : null,
		next:
			index >= 0 && index < unidad.lecciones.length - 1
				? unidad.lecciones[index + 1]
				: null,
	};
}
