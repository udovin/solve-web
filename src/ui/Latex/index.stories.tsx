import { FC, useState } from "react";
import Latex, { LatexProps } from ".";

export default {
	title: "Latex",
};

export const Index = () => <>
	<Latex content={`\\section{Fermat's Last Theorem} $a^n + b^n \\ne c^n$, $a, b, c, n \\in \\N$, $n \\ge 3$`} />
</>;
