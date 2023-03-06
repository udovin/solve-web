import { FC, useEffect, useRef } from "react";
import { EditorView, lineNumbers } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { defaultHighlightStyle, syntaxHighlighting, bracketMatching, foldGutter } from "@codemirror/language";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";

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
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
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
    return <div className={className} ref={ref} />;
};

export default Code;
