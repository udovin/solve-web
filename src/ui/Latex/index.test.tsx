import { render } from "@testing-library/react";

import Latex from ".";

test("renders correctly", () => {
	render(<Latex content={`\\section{Fermat's Last Theorem} $a^n + b^n \\ne c^n$, $a, b, c, n \\in \\N$, $n \\ge 3$`} />);
	expect(document.body).toMatchSnapshot();
});

test("renders correctly", () => {
	render(<Latex content={`a\\^{}b = $a^b$`} />);
	expect(document.body).toMatchSnapshot();
});

test("renders correctly", () => {
	render(<Latex content={`\\^a, \\^{a}, \\^{}a`} />);
	expect(document.body).toMatchSnapshot();
});

test("renders correctly", () => {
	render(<Latex content={`\\underline{Underline} {\\bfseries Bold} $\\bf{Bold2}$ {\\bf Bold3} Normal`} />);
	expect(document.body).toMatchSnapshot();
});
