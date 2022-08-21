import Block from ".";

export default {
	title: "Block",
};

export const Index = () => <>
	<Block header="Header" footer="Footer">Content</Block>
	<Block header="Header">Content</Block>
	<Block footer="Footer">Content</Block>
	<Block title="Title">Content</Block>
</>;
