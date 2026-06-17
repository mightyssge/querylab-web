import { useState } from "react";
import {
	normalizeEmail,
	type SurveyPayload,
	submitForm,
	validateUlimaEmail,
} from "./lib/submit";
import type { Question } from "./surveyData";

interface Props {
	tipo: "pre" | "post";
	questions: Question[];
	sprint?: number;
	initialCorreo?: string;
	onCompleted: (data: { correo: string; nombre?: string }) => void;
}

type Estado = "idle" | "sending" | "error";

export default function QuizForm({
	tipo,
	questions,
	sprint = 1,
	initialCorreo = "",
	onCompleted,
}: Props) {
	const [nombre, setNombre] = useState("");
	const [correo, setCorreo] = useState(initialCorreo);
	const [answers, setAnswers] = useState<Record<string, number>>({});
	const [satisfaccion, setSatisfaccion] = useState<number>(0);
	const [recomienda, setRecomienda] = useState<string>("");
	const [comentarios, setComentarios] = useState("");
	const [estado, setEstado] = useState<Estado>("idle");
	const [errorMsg, setErrorMsg] = useState("");

	const esPost = tipo === "post";

	function setAnswer(qid: string, idx: number) {
		setAnswers((prev) => ({ ...prev, [qid]: idx }));
	}

	function validar(): string | null {
		if (!esPost && !nombre.trim()) return "Ingresa tu nombre completo.";
		if (!validateUlimaEmail(correo))
			return "Usa tu correo institucional que termina en @ulima.edu.pe.";
		for (const q of questions) {
			if (answers[q.id] == null)
				return "Responde todas las preguntas antes de enviar.";
		}
		if (esPost && satisfaccion === 0)
			return "Indica tu nivel de satisfacción con el sprint.";
		return null;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const err = validar();
		if (err) {
			setErrorMsg(err);
			setEstado("error");
			return;
		}
		setEstado("sending");
		setErrorMsg("");

		const correoNorm = normalizeEmail(correo);
		const respuestas: Record<string, string> = {};
		const indices: Record<string, number> = {};
		for (const q of questions) {
			respuestas[q.id] = q.options[answers[q.id]];
			indices[q.id] = answers[q.id];
		}

		const payload: SurveyPayload = {
			tipo,
			sprint,
			correo: correoNorm,
			respuestas,
			indices,
			...(esPost
				? { satisfaccion, recomienda, comentarios: comentarios.trim() }
				: { nombre: nombre.trim() }),
		};

		const result = await submitForm(payload);
		if (result.ok) {
			onCompleted({ correo: correoNorm, nombre: nombre.trim() || undefined });
		} else {
			setErrorMsg(
				"No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.",
			);
			setEstado("error");
		}
	}

	const correoInvalido = estado === "error" && !validateUlimaEmail(correo);

	return (
		<form onSubmit={handleSubmit} className="ql-quiz" noValidate>
			<div className="ql-fields">
				{!esPost && (
					<label className="ql-field">
						<span>Nombre completo</span>
						<input
							type="text"
							value={nombre}
							onChange={(e) => setNombre(e.target.value)}
							placeholder="Ej. Ana Pérez"
							autoComplete="name"
							required
						/>
					</label>
				)}
				<label className="ql-field">
					<span>Correo institucional (@ulima.edu.pe)</span>
					<input
						type="email"
						value={correo}
						onChange={(e) => setCorreo(e.target.value)}
						placeholder="codigo@ulima.edu.pe"
						autoComplete="email"
						inputMode="email"
						required
						aria-invalid={correoInvalido}
					/>
				</label>
			</div>

			<ol className="ql-questions">
				{questions.map((q, i) => {
					const labelId = `${tipo}-${q.id}-label`;
					return (
						<li key={q.id} className="ql-question">
							<p className="ql-q-prompt" id={labelId}>
								<span className="ql-q-num">{i + 1}.</span> {q.prompt}
							</p>
							{q.code && <pre className="ql-q-code">{q.code}</pre>}
							<div
								className="ql-options"
								role="radiogroup"
								aria-labelledby={labelId}
							>
								{q.options.map((opt, idx) => (
									<label
										key={idx}
										className={`ql-option ${answers[q.id] === idx ? "is-selected" : ""}`}
									>
										<input
											type="radio"
											name={`${tipo}-${q.id}`}
											checked={answers[q.id] === idx}
											onChange={() => setAnswer(q.id, idx)}
										/>
										<span>{opt}</span>
									</label>
								))}
							</div>
						</li>
					);
				})}
			</ol>

			{esPost && (
				<div className="ql-extra">
					<fieldset className="ql-field">
						<legend>¿Qué tan satisfecho quedaste con el sprint? (1 a 5)</legend>
						<div className="ql-scale">
							{[1, 2, 3, 4, 5].map((n) => (
								<button
									type="button"
									key={n}
									className={`ql-scale-btn ${satisfaccion === n ? "is-selected" : ""}`}
									onClick={() => setSatisfaccion(n)}
									aria-pressed={satisfaccion === n}
									aria-label={`${n} de 5`}
								>
									{n}
								</button>
							))}
						</div>
					</fieldset>
					<fieldset className="ql-field">
						<legend>¿Recomendarías este curso a otro estudiante?</legend>
						<div className="ql-yesno" role="radiogroup">
							{["Sí", "No"].map((v) => (
								<label
									key={v}
									className={`ql-option ${recomienda === v ? "is-selected" : ""}`}
								>
									<input
										type="radio"
										name="recomienda"
										checked={recomienda === v}
										onChange={() => setRecomienda(v)}
									/>
									<span>{v}</span>
								</label>
							))}
						</div>
					</fieldset>
					<label className="ql-field">
						<span>Comentarios (opcional)</span>
						<textarea
							value={comentarios}
							onChange={(e) => setComentarios(e.target.value)}
							rows={3}
							placeholder="¿Qué mejorarías? ¿Qué te gustó?"
						/>
					</label>
				</div>
			)}

			{estado === "error" && (
				<p className="ql-error" role="alert">
					{errorMsg}
				</p>
			)}

			<button type="submit" className="ql-submit" disabled={estado === "sending"}>
				{estado === "sending"
					? "Enviando…"
					: esPost
						? "Enviar y finalizar el sprint"
						: "Enviar y continuar"}
			</button>
		</form>
	);
}
