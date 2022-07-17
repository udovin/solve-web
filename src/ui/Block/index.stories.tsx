import React from "react";
import Block from "./index";
import "../../index.scss";

export default {
	title: "Block",
};

export const Index = () => <>
	<Block header="Header" footer="Footer">Content</Block>
	<Block header="Header">Content</Block>
	<Block footer="Footer">Content</Block>
	<Block title="Title">Content</Block>
</>;
