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
import { getArgsContent } from "@unified-latex/unified-latex-util-arguments";
import { unified } from "unified";
import katex from "katex";

import "./index.scss";

export type LatexProps = {
	className?: string;
	content?: string;
	imageBaseUrl?: string;
	allowedMacros?: string[];
};

const parser = unified().use(unifiedLatexFromString, {
	macros: {
		"def": { signature: "m m" },
		"underline": { signature: "m", renderInfo: { inParMode: true } },
	},
});

type Context = {
	imageBaseUrl?: string;
};

const macros: Record<string, (node: Macro, info: VisitInfo, context: Context) => any> = {
	"def": () => null,
	"includegraphics": (node: Macro, info: VisitInfo, context: Context) => {
		if (!node.args || info.context.inMathMode) {
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
			style += `display:none;`
			scale = printRaw(args["scale"][0]);
		}
		const imageName = printRaw(node.args[3].content);
		const imageUrl = (context.imageBaseUrl ?? "") + imageName;
		let attributes: object = { src: imageUrl, style: style };
		if (scale) {
			attributes = { ...attributes, style: style, "data-scale": scale };
		}
		return htmlLike({ tag: "img", attributes });
	},
	"underline": (node: Macro) => {
		if (!node.args) {
			return null;
		}
		const args = node.args.map((arg) => {
			if (arg.openMark === "" && arg.content.length === 0) {
				return null;
			}
			return arg.content;
		});
		const content = args[args.length - 1] || [];
		const attributes = { className: "underline" };
		return htmlLike({ tag: "u", content, attributes });
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
	"bf": (_: Macro, info: VisitInfo) => {
		if (!info.context.hasMathModeAncestor) {
			return undefined;
		}
		return s("\\bf");
	},
	"url": (node: Macro) => {
		const args = getArgsContent(node);
		const url = printRaw(args[0] || "#");
		return htmlLike({
			tag: "a",
			attributes: {
				className: "url",
				href: url,
				target: "_blank",
				rel: "nofollow",
			},
			content: [{ type: "string", content: url }],
		});
	},
};

export const MessageMacros = ["texttt", "textbf", "underline", "^", "{", "}", "\\", "url"];

const Latex: FC<LatexProps> = props => {
	const { className, content, imageBaseUrl, allowedMacros } = props;
	const ast = parser.parse(content ?? "");
	const context = {
		imageBaseUrl: imageBaseUrl,
	};
	if (allowedMacros) {
		const allowedMacrosMap = allowedMacros.reduce((acc, item) => ({ ...acc, [item]: true }), {} as Record<string, boolean>)
		replaceNode(ast, (node, info) => {
			if (node.type === "macro") {
				if (info.context.inMathMode) {
					return undefined;
				}
				if (allowedMacrosMap[node.content]) {
					return undefined;
				}
				return null;
			}
			return undefined;
		});
	}
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
		if (!node || !html) {
			return;
		}
		node.querySelectorAll<HTMLElement>(".display-math").forEach(dm => {
			katex.render(dm.textContent ?? "", dm, {
				displayMode: true,
				throwOnError: false,
				output: "html",
			});
		});
		node.querySelectorAll<HTMLElement>(".inline-math").forEach(im => {
			katex.render(im.textContent ?? "", im, {
				displayMode: false,
				throwOnError: false,
				output: "html",
			});
		});
		node.querySelectorAll<HTMLImageElement>("img[data-scale]").forEach(img => {
			const scaleAttr = img.getAttribute("data-scale");
			if (scaleAttr) {
				const scale = parseFloat(scaleAttr);
				img.onload = () => {
					img.style.setProperty("width", `${img.naturalWidth * scale}px`);
					img.style.removeProperty("display");
				};
			}
		});
	}, [html]);
	return <div
		className={`ui-latex ${className ?? ""}`}
		ref={ref}
		dangerouslySetInnerHTML={{ __html: html }}
	/>;
};

export default Latex;
