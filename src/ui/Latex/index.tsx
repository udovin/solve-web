import { FC, useEffect, useRef } from "react";
import { Macro } from "@unified-latex/unified-latex-types";
import { unifiedLatexFromString } from "@unified-latex/unified-latex-util-parse";
import { convertToHtml } from "@unified-latex/unified-latex-to-hast";
import { htmlLike } from "@unified-latex/unified-latex-util-html-like";
import { replaceNode } from "@unified-latex/unified-latex-util-replace";
import { printRaw } from "@unified-latex/unified-latex-util-print-raw";
import { pgfkeysArgToObject } from "@unified-latex/unified-latex-util-pgfkeys";
import { unified } from "unified";
import katex from "katex";

import "./index.scss";

export type LatexProps = {
    className?: string;
    content?: string;
    imageBaseUrl?: string;
};

const parser = unified().use(unifiedLatexFromString, {
    macros: {
        def: { signature: "m m" },
    },
});

type Context = {
    imageBaseUrl?: string;
};

const macros: Record<string, (node: Macro, context: Context) => any> = {
    "def": () => null,
    "includegraphics": (node: Macro, context: Context) => {
        if (!node.args) {
            return null;
        }
        const args = pgfkeysArgToObject(node.args[1]);
        let style = '';
        if (args["width"] && args["width"].length) {
            style += `width:${printRaw(args["width"][0])};`;
        }
        if (args["height"] && args["height"].length) {
            style += `height:${printRaw(args["height"][0])};`;
        }
        const imageName = printRaw(node.args[3].content);
        const imageUrl = (context.imageBaseUrl ?? "") + imageName;
        return htmlLike({ tag: "img", attributes: { src: imageUrl, style: style } });
    },
};

const Latex: FC<LatexProps> = props => {
    const { className, content, imageBaseUrl } = props;
    const ast = parser.parse(content ?? "");
    const context = {
        imageBaseUrl: imageBaseUrl,
    };
    replaceNode(ast, (node) => {
        if (node.type !== "macro") {
            return undefined;
        }
        const macro = macros[node.content];
        if (!macro) {
            return undefined;
        }
        return macro(node, context);
    });
    const html = convertToHtml(ast);
    const renderedRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (renderedRef.current) {
            for (const dm of Array.from(
                renderedRef.current.querySelectorAll(".display-math")
            )) {
                if (dm.classList.contains("katex-rendered")) {
                    continue;
                }
                dm.classList.add("katex-rendered");
                katex.render(dm.textContent ?? "", dm as HTMLElement, {
                    displayMode: true,
                    throwOnError: false,
                });
            }
            for (const im of Array.from(
                renderedRef.current.querySelectorAll(".inline-math")
            )) {
                if (im.classList.contains("katex-rendered")) {
                    continue;
                }
                im.classList.add("katex-rendered");
                katex.render(im.textContent ?? "", im as HTMLElement, {
                    displayMode: false,
                    throwOnError: false,
                });
            }
        }
    }, [renderedRef, html]);
    return <div
        className={`ui-latex ${className ?? ""}`}
        ref={renderedRef}
        dangerouslySetInnerHTML={{ __html: html }}
    />;
};

export default Latex;
