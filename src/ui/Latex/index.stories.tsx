import Latex from ".";
import Block from "../Block";

export default {
	title: "Latex",
};

export const Index = () => <>
	<Block>
		<Latex content={`\\section{Fermat's Last Theorem} $a^n + b^n \\ne c^n$, $a, b, c, n \\in \\N$, $n \\ge 3$`} />
		<Latex content={`a\\^{}b = $a^b$`} />
		<Latex content={`\\^a, \\^{a}, \\^{}a`} />
		<Latex content={`\\underline{Underline} {\\bfseries Bold} $\\bf{Bold2}$ {\\bf Bold3} Normal`} />
		<Latex content={`\\begin{lstlisting}let a = "Hello, World!";\\end{lstlisting}`} />
	</Block>
</>;
