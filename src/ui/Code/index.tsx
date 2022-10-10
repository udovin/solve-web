import { FC } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";

import "./index.scss";

export type CodeProps = {
    className?: string;
    language?: string;
    content?: string;
};

const Code: FC<CodeProps> = props => {
    const { className, content, language } = props;
    return <SyntaxHighlighter
        className={`ui-code ${className ?? ""}`}
        children={content ?? ""}
        language={language}
        style={{ hljs: {} }}
        customStyle={{}}
        lineNumberContainerStyle={{}}
        lineNumberStyle={{
            display: undefined,
            minWidth: undefined,
            paddingRight: undefined,
            textAlign: undefined,
            userSelect: undefined
        }}
        codeTagProps={{
            className: `language-${language}`,
            style: {}
        }}
        showLineNumbers
    />
};

export default Code;
