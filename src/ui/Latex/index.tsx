import { FC, useCallback } from "react";
import { Macro } from "@unified-latex/unified-latex-types";
import { unifiedLatexFromString } from "@unified-latex/unified-latex-util-parse";
import { convertToHtml } from "@unified-latex/unified-latex-to-hast";
import { htmlLike } from "@unified-latex/unified-latex-util-html-like";
import { s } from "@unified-latex/unified-latex-builder";
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
        if (args["scale"] && args["scale"].length) {
            const scale = parseFloat(printRaw(args["scale"][0]));
            if (scale > 0) {
                style += `width:${scale * 100}%;`;
            }
        }
        const imageName = printRaw(node.args[3].content);
        const imageUrl = (context.imageBaseUrl ?? "") + imageName;
        return htmlLike({ tag: "img", attributes: { src: imageUrl, style: style } });
    },
    "^": (node: Macro) => {
        if (node.escapeToken !== undefined) {
            return node;
        }
        return s("^");
    },
};

const Latex: FC<LatexProps> = props => {
    const { className, content, imageBaseUrl } = props;
    const ast = parser.parse(content ?? "");
    const context = {
        imageBaseUrl: imageBaseUrl,
    };
    replaceNode(ast, node => {
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
    const ref = useCallback((node: HTMLDivElement) => {
        if (!node) {
            return;
        }
        for (const dm of Array.from(node.querySelectorAll(".display-math"))) {
            katex.render(dm.textContent ?? "", dm as HTMLElement, {
                displayMode: true,
                throwOnError: false,
            });
        }
        for (const im of Array.from(node.querySelectorAll(".inline-math"))) {
            katex.render(im.textContent ?? "", im as HTMLElement, {
                displayMode: false,
                throwOnError: false,
            });
        }
    }, []);
    return <div
        className={`ui-latex ${className ?? ""}`}
        ref={ref}
        dangerouslySetInnerHTML={{ __html: html }}
    />;
};

export default Latex;
