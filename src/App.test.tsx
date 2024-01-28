import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

test("renders app", () => {
	render(<BrowserRouter><App /></BrowserRouter>);
	const linkElement = screen.getByText(/Online Judge/i);
	expect(linkElement).toBeInTheDocument();
});
