import { FC, useEffect, useRef } from "react";
import { parse } from "@unified-latex/unified-latex-util-parse";
import { convertToHtml } from "@unified-latex/unified-latex-to-hast";
import katex from "katex";

import "./index.scss";

export type LatexProps = {
    className?: string;
    content?: string;
};

const Latex: FC<LatexProps> = props => {
    const { className, content } = props;
    const ast = parse(content ?? "");
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
        className={className}
        ref={renderedRef}
        dangerouslySetInnerHTML={{ __html: html }}
    />;
};

export default Latex;
