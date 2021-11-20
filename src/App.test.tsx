import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

test("renders app", () => {
	render(<BrowserRouter><App /></BrowserRouter>);
	const linkElement = screen.getByText(/Online Judge/i);
	expect(linkElement).toBeInTheDocument();
});
