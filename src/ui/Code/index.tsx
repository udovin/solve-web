import { FC, useEffect, useRef, useState } from "react";
import { EditorView, ViewUpdate, keymap, lineNumbers, highlightSpecialChars } from "@codemirror/view";
import { Annotation, EditorState, Extension, StateEffect } from "@codemirror/state";
import { indentWithTab, history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import { closeBrackets } from "@codemirror/autocomplete";
import { HighlightStyle, syntaxHighlighting, bracketMatching, foldGutter, indentOnInput, indentUnit, StreamLanguage } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { linter, lintGutter, Diagnostic as CmDiagnostic } from "@codemirror/lint";

import "./index.scss";

export type Position = {
	line: number;
	column: number;
};

export type Span = {
	start: Position;
	end?: Position;
};

export type Diagnostic = {
	level: string;
	span?: Span;
	message: string;
	code?: string;
	details?: Diagnostic[];
};

export type CodeProps = {
	className?: string;
	language?: string;
	value?: string;
	onValueChange?(value: string, vu: ViewUpdate): void;
	editable?: boolean;
	readOnly?: boolean;
	showLineNumbers?: boolean;
	diagnostics?: Diagnostic[];
};

const languages: Record<string, Extension | undefined> = {
	"c": cpp(),
	"cpp": cpp(),
	"py": python(),
	"java": java(),
	"rs": rust(),
	"go": go(),
	"stex": StreamLanguage.define(stex),
};

const highlightStyle = HighlightStyle.define([
	{ tag: tags.comment, class: "hl-comment" },
	{ tag: tags.keyword, class: "hl-keyword" },
	{ tag: tags.processingInstruction, class: "hl-keyword" },
	{ tag: tags.typeName, class: "hl-type" },
	{ tag: tags.string, class: "hl-string" },
	{ tag: tags.number, class: "hl-number" },
]);

const levelToSeverity = (level: string): CmDiagnostic["severity"] => {
	switch (level) {
		case "error": return "error";
		case "warning": return "warning";
		default: return "info";
	}
};

const columnToOffset = (text: string, line: number, column: number): number => {
	const lines = text.split("\n");
	if (line < 0 || line >= lines.length) {
		return text.length;
	}
	let offset = 0;
	for (let i = 0; i < line; i++) {
		offset += lines[i].length + 1;
	}
	// column is in unicode code points — iterate by code points
	let col = 0;
	let pos = 0;
	const lineText = lines[line];
	while (col < column && pos < lineText.length) {
		const cp = lineText.codePointAt(pos);
		if (cp === undefined) break;
		pos += cp > 0xFFFF ? 2 : 1;
		col++;
	}
	return offset + pos;
};

const spanToRange = (span: Span, doc: string): { from: number; to: number } => {
	const from = columnToOffset(doc, span.start.line, span.start.column);
	const to = span.end
		? columnToOffset(doc, span.end.line, span.end.column)
		: from;
	return { from, to: Math.max(from, to) };
};

const formatMessage = (diag: Diagnostic): string => {
	let message = diag.message;
	if (diag.code) {
		message = `[${diag.code}] ${message}`;
	}
	return message;
};

const diagnosticsToCm = (diagnostics: Diagnostic[], doc: string): CmDiagnostic[] => {
	const result: CmDiagnostic[] = [];
	for (const diag of diagnostics) {
		const severity = levelToSeverity(diag.level);
		let message = formatMessage(diag);
		// Append details without span as text lines.
		const detailsWithoutSpan = diag.details?.filter(d => !d.span) ?? [];
		if (detailsWithoutSpan.length > 0) {
			message += "\n" + detailsWithoutSpan.map(d => `${d.level}: ${d.message}`).join("\n");
		}
		if (diag.span) {
			const { from, to } = spanToRange(diag.span, doc);
			result.push({ from, to, severity, message });
		} else {
			// Global diagnostic — attach to start of file.
			result.push({ from: 0, to: 0, severity, message });
		}
		// Details with their own span — render as separate markers.
		for (const detail of diag.details ?? []) {
			if (!detail.span) continue;
			const { from, to } = spanToRange(detail.span, doc);
			const detailMessage = `${detail.level}: ${detail.message}\n(${formatMessage(diag)})`;
			result.push({
				from,
				to,
				severity: levelToSeverity(detail.level),
				message: detailMessage,
			});
		}
	}
	return result;
};

const External = Annotation.define<boolean>();

const Code: FC<CodeProps> = props => {
	const { className, value, onValueChange, language, editable, readOnly, showLineNumbers, diagnostics } = props;
	const ref = useRef<HTMLDivElement>(null);
	const [view, setView] = useState<EditorView>();
	const diagnosticsRef = useRef<Diagnostic[] | undefined>(diagnostics);
	diagnosticsRef.current = diagnostics;
	const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
		if (vu.docChanged && onValueChange && !vu.transactions.some((tr) => tr.annotation(External))) {
			const doc = vu.state.doc;
			const value = doc.toString();
			onValueChange(value, vu);
		}
	});
	let extensions: Extension[] = [
		[
			highlightSpecialChars(),
			history(),
			indentOnInput(),
			syntaxHighlighting(highlightStyle),
			bracketMatching(),
			closeBrackets(),
			indentUnit.of("\t"),
			keymap.of([
				...defaultKeymap,
				...historyKeymap,
				indentWithTab,
			]),
		],
		updateListener,
	];
	if (!editable) {
		extensions.push(EditorView.editable.of(false));
	}
	if (readOnly) {
		extensions.push(EditorState.readOnly.of(true));
	}
	const languageImpl = language ? languages[language] : undefined;
	if (languageImpl) {
		extensions.push(languageImpl);
	}
	if (showLineNumbers) {
		extensions.push(lineNumbers(), foldGutter());
	}
	if (diagnostics && diagnostics.length > 0) {
		extensions.push(
			linter((view) => {
				const doc = view.state.doc.toString();
				return diagnosticsToCm(diagnosticsRef.current ?? [], doc);
			}),
			lintGutter(),
		);
	}
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		const currentView = new EditorView({
			state: EditorState.create({ extensions: extensions, doc: value }),
			parent: ref.current,
		});
		setView(currentView);
		return () => {
			setView(undefined);
			currentView.destroy();
		};
	}, [ref]); // eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (!view || value === undefined) {
			return;
		}
		const currentValue = view.state.doc.toString();
		if (value !== currentValue) {
			view.dispatch({
				changes: { from: 0, to: currentValue.length, insert: value },
				annotations: [External.of(true)],
			});
		}
	}, [view, value]); // eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (view) {
			view.dispatch({ effects: StateEffect.reconfigure.of(extensions) });
		}
	}, [editable, readOnly, language, showLineNumbers, diagnostics]); // eslint-disable-line react-hooks/exhaustive-deps
	return <div className={`ui-code ${className ?? ""}`.trimEnd()} ref={ref} />;
};

export default Code;
