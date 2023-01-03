import { useState } from "react";
import { Collapse, CollapseHeader, CollapseContent } from ".";

export default {
	title: "Collapse",
};

export const Index = () => {
	const [expanded, setExpanded] = useState<boolean>();
	return <Collapse expanded={expanded} onChange={() => setExpanded(!expanded)}>
		<CollapseHeader>
			Header
		</CollapseHeader>
		<CollapseContent>
			Content
		</CollapseContent>
	</Collapse>;
};
