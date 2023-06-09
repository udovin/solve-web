import { FC, useCallback } from "react";
import { Macro } from "@unified-latex/unified-latex-types";
import { unifiedLatexFromString } from "@unified-latex/unified-latex-util-parse";
import { convertToHtml } from "@unified-latex/unified-latex-to-hast";
import { htmlLike } from "@unified-latex/unified-latex-util-html-like";
import { s } from "@unified-latex/unified-latex-builder";
import { replaceNode } from "@unified-latex/unified-latex-util-replace";
import { printRaw } from "@unified-latex/unified-latex-util-print-raw";
import { pgfkeysArgToObject } from "@unified-latex/unified-latex-util-pgfkeys";
import { VisitInfo } from "@unified-latex/unified-latex-util-visit";
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
        "def": { signature: "m m" },
    },
});

type Context = {
    imageBaseUrl?: string;
};

const macros: Record<string, (node: Macro, info: VisitInfo, context: Context) => any> = {
    "def": () => null,
    "includegraphics": (node: Macro, _: VisitInfo, context: Context) => {
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
        let scale: string | undefined = undefined;
        if (args["scale"] && args["scale"].length) {
            scale = printRaw(args["scale"][0]);
        }
        const imageName = printRaw(node.args[3].content);
        const imageUrl = (context.imageBaseUrl ?? "") + imageName;
        return htmlLike({ tag: "img", attributes: { src: imageUrl, style: style, "data-scale": scale } });
    },
    "^": (_: Macro, info: VisitInfo) => {
        if (info.context.inMathMode) {
            return undefined;
        }
        if (info.index === undefined || !info.containingArray) {
            return undefined;
        }
        if (info.containingArray.length <= info.index + 1) {
            return undefined;
        }
        const nextToken = info.containingArray[info.index + 1];
        const content = printRaw(nextToken);
        if (content !== "{}") {
            return undefined;
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
    replaceNode(ast, (node, info) => {
        if (node.type !== "macro") {
            return undefined;
        }
        const macro = macros[node.content];
        if (!macro) {
            return undefined;
        }
        return macro(node, info, context);
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
        node.querySelectorAll<HTMLImageElement>("img[data-scale]").forEach(img => {
            const scaleAttr = img.getAttribute("data-scale");
            const scale = scaleAttr ? parseFloat(scaleAttr) : undefined;
            if (scale) {
                img.onload = () => img.style.cssText += `width:${img.naturalWidth * (scale ?? 1)}px;height:${img.naturalHeight * (scale ?? 1)}px;`;
            }
        });
    }, []);
    return <div
        className={`ui-latex ${className ?? ""}`}
        ref={ref}
        dangerouslySetInnerHTML={{ __html: html }}
    />;
};

export default Latex;
