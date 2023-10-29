import { FC, useState } from "react";
import Dialog from ".";
import Block from "../Block";
import Button from "../Button";
import Tooltip from "../Tooltip";

export default {
	title: "Dialog",
};

const TestDialog: FC = () => {
	const [open, setOpen] = useState(false);
	return <>
		<Button onClick={() => setOpen(true)}>Open dialog</Button>
		<Dialog open={open} onClose={() => setOpen(false)}>
			<Block title="Some title" footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
				Some dialog content with <Tooltip content="Some content">tooltip</Tooltip>.
			</Block>
		</Dialog>
	</>;
};

export const Index = () => <>
	<TestDialog />
</>;
