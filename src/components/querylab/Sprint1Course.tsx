import { useEffect, useState } from "react";
import QuizForm from "./QuizForm";
import "./querylab.css";
import { POST_QUESTIONS, PRE_QUESTIONS } from "./surveyData";

const STORAGE_KEY = "querylab:sprint1";

interface Step {
	id: string;
	label: string;
	kind: "pre" | "video" | "post";
	desc: string;
	yt?: string;
	lessonHref?: string;
	lessonTitle?: string;
}

const STEPS: Step[] = [
	{
		id: "pre",
		label: "Encuesta de evaluación (Pre)",
		kind: "pre",
		desc: "Mide tu punto de partida. Tus respuestas se comparan con el post para ver cuánto aprendiste.",
	},
	{
		id: "video1",
		label: "Video 1 · DDL en concepto",
		kind: "video",
		yt: "mT8_HsbvxB8",
		lessonHref: "/posts/tema-1-fundamentos-ddl/",
		lessonTitle: "Tema 1 · Fundamentos de DDL",
		desc: "Qué es el DDL y cómo CREATE, ALTER y DROP moldean la estructura de una base de datos.",
	},
	{
		id: "video2",
		label: "Video 2 · DDL en la práctica",
		kind: "video",
		yt: "AcVFCgvzXZU",
		lessonHref: "/posts/tema-2-ddl-en-la-practica/",
		lessonTitle: "Tema 2 · DDL en la práctica",
		desc: "Un caso real: una cadena de cines en Oracle, con constraints, ALTER en caliente y DROP con criterio.",
	},
	{
		id: "post",
		label: "Formulario de evaluación (Post)",
		kind: "post",
		desc: "Cierra el sprint. Al enviarlo con tu correo @ulima.edu.pe quedas registrado como participante que terminó.",
	},
];

interface SavedState {
	completed: string[];
	correo: string;
}

export default function Sprint1Course() {
	const [completed, setCompleted] = useState<string[]>([]);
	const [correo, setCorreo] = useState("");
	const [active, setActive] = useState(0);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const s: SavedState = JSON.parse(raw);
				const done = s.completed || [];
				setCompleted(done);
				setCorreo(s.correo || "");
				const firstIncomplete = STEPS.findIndex((st) => !done.includes(st.id));
				setActive(firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete);
			}
		} catch {
			/* noop */
		}
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, correo }));
	}, [completed, correo, hydrated]);

	const isDone = (id: string) => completed.includes(id);
	const isUnlocked = (i: number) => i === 0 || isDone(STEPS[i - 1].id);
	const allDone = STEPS.every((s) => isDone(s.id));

	function markComplete(id: string) {
		setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
		const idx = STEPS.findIndex((s) => s.id === id);
		if (idx < STEPS.length - 1) setActive(idx + 1);
	}

	function reset() {
		setCompleted([]);
		setCorreo("");
		setActive(0);
	}

	const progress = Math.round((completed.length / STEPS.length) * 100);

	return (
		<div className="ql-course">
			<div className="ql-progress">
				<div className="ql-progress-head">
					<span>Progreso del Sprint 1</span>
					<span>
						{completed.length} / {STEPS.length}
					</span>
				</div>
				<div className="ql-progress-bar">
					<div className="ql-progress-fill" style={{ width: `${progress}%` }} />
				</div>
			</div>

			{allDone && (
				<div className="ql-done-banner">
					<strong>¡Completaste el Sprint 1! 🎉</strong>
					<p>
						Quedaste registrado como participante que terminó. Gracias por recorrer
						toda la unidad de DDL.
					</p>
				</div>
			)}

			<ol className="ql-steps">
				{STEPS.map((step, i) => {
					const done = isDone(step.id);
					const unlocked = isUnlocked(i);
					const open = active === i && unlocked;
					return (
						<li
							key={step.id}
							className={`ql-step ${done ? "is-done" : ""} ${unlocked ? "" : "is-locked"} ${open ? "is-open" : ""}`}
						>
							<button
								type="button"
								className="ql-step-head"
								onClick={() => unlocked && setActive(open ? -1 : i)}
								disabled={!unlocked}
							>
								<span className="ql-step-marker">
									{done ? "✓" : unlocked ? i + 1 : "🔒"}
								</span>
								<span className="ql-step-titles">
									<span className="ql-step-label">{step.label}</span>
									<span className="ql-step-desc">{step.desc}</span>
								</span>
								<span className="ql-step-status">
									{done ? "Completado" : unlocked ? "" : "Bloqueado"}
								</span>
							</button>

							{open && (
								<div className="ql-step-body">
									{step.kind === "video" && (
										<>
											<div className="ql-video">
												<iframe
													src={`https://www.youtube-nocookie.com/embed/${step.yt}`}
													title={step.label}
													loading="lazy"
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowFullScreen
												/>
											</div>
											{step.lessonHref && (
												<a className="ql-lesson-link" href={step.lessonHref}>
													📖 Leer el tema completo: {step.lessonTitle}
												</a>
											)}
											{!done ? (
												<button
													type="button"
													className="ql-submit"
													onClick={() => markComplete(step.id)}
												>
													Ya vi el video — continuar
												</button>
											) : (
												<p className="ql-step-ok">Video marcado como visto ✓</p>
											)}
										</>
									)}

									{step.kind === "pre" &&
										(done ? (
											<p className="ql-step-ok">
												Encuesta pre enviada ✓ — ya podemos medir tu avance.
											</p>
										) : (
											<QuizForm
												tipo="pre"
												questions={PRE_QUESTIONS}
												onCompleted={({ correo }) => {
													setCorreo(correo);
													markComplete("pre");
												}}
											/>
										))}

									{step.kind === "post" &&
										(done ? (
											<p className="ql-step-ok">
												Formulario post enviado ✓ — sprint finalizado.
											</p>
										) : (
											<QuizForm
												tipo="post"
												questions={POST_QUESTIONS}
												initialCorreo={correo}
												onCompleted={() => markComplete("post")}
											/>
										))}
								</div>
							)}
						</li>
					);
				})}
			</ol>

			{completed.length > 0 && (
				<button type="button" className="ql-reset" onClick={reset}>
					Reiniciar mi progreso
				</button>
			)}
		</div>
	);
}
