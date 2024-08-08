import { FC, useEffect, useRef, useState } from "react";
import { EditorView, ViewUpdate, keymap, lineNumbers, highlightSpecialChars } from "@codemirror/view";
import { Annotation, EditorState, Extension, StateEffect } from "@codemirror/state";
import { indentWithTab, history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import { closeBrackets } from "@codemirror/autocomplete";
import { HighlightStyle, syntaxHighlighting, bracketMatching, foldGutter, indentOnInput, indentUnit } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";

import "./index.scss";

export type CodeProps = {
	className?: string;
	language?: string;
	value?: string;
	onValueChange?(value: string, vu: ViewUpdate): void;
	editable?: boolean;
	readOnly?: boolean;
};

const languages: Record<string, Extension | undefined> = {
	"c": cpp(),
	"cpp": cpp(),
	"py": python(),
	"java": java(),
	"rs": rust(),
	"go": go(),
};

const highlightStyle = HighlightStyle.define([
	{ tag: tags.comment, class: "hl-comment" },
	{ tag: tags.keyword, class: "hl-keyword" },
	{ tag: tags.processingInstruction, class: "hl-keyword" },
	{ tag: tags.typeName, class: "hl-type" },
	{ tag: tags.string, class: "hl-string" },
	{ tag: tags.number, class: "hl-number" },
]);

const External = Annotation.define<boolean>();

const Code: FC<CodeProps> = props => {
	const { className, value, onValueChange, language, editable, readOnly } = props;
	const ref = useRef<HTMLDivElement>(null);
	const [view, setView] = useState<EditorView>();
	const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
		if (vu.docChanged && onValueChange && !vu.transactions.some((tr) => tr.annotation(External))) {
			const doc = vu.state.doc;
			const value = doc.toString();
			onValueChange(value, vu);
		}
	});
	let extensions: Extension[] = [
		[
			lineNumbers(),
			foldGutter(),
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
	}, [editable, readOnly, language]); // eslint-disable-line react-hooks/exhaustive-deps
	return <div className={`ui-code ${className ?? ""}`.trimEnd()} ref={ref} />;
};

export default Code;
