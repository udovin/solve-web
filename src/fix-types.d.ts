declare module "@unified-latex/unified-latex-to-hast" {
    export function convertToHtml(tree: Ast.Node | Ast.Node[]): string;
};
