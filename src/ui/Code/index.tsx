import { FC, useEffect, useRef } from "react";
import { EditorView, lineNumbers } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting, bracketMatching, foldGutter } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";

import "./index.scss";

export type CodeProps = {
    className?: string;
    language?: string;
    content?: string;
    editable?: boolean;
    readOnly?: boolean;
};

const languages: Record<string, Extension | undefined> = {
    "cpp": cpp(),
    "py": python(),
    "java": java(),
    "rs": rust(),
};

const highlightStyle = HighlightStyle.define([
    { tag: tags.comment, class: "hl-comment" },
    { tag: tags.keyword, class: "hl-keyword" },
    { tag: tags.processingInstruction, class: "hl-keyword" },
    { tag: tags.typeName, class: "hl-type" },
    { tag: tags.string, class: "hl-string" },
    { tag: tags.number, class: "hl-number" },
]);

const Code: FC<CodeProps> = props => {
    const { className, content, language, editable, readOnly } = props;
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) {
            return;
        }
        let extensions: Extension[] = [
            [
                lineNumbers(),
                foldGutter(),
                syntaxHighlighting(highlightStyle, { fallback: true }),
                bracketMatching(),
            ],
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
        const view = new EditorView({
            state: EditorState.create({
                doc: content,
                extensions: extensions,
            }),
            parent: ref.current,
        });
        return () => view?.destroy();
    }, [ref, content, language, editable, readOnly]);
    return <div className={`ui-code ${className ?? ""}`} ref={ref} />;
};

export default Code;
