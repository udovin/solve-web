import { useState } from "react";
import { Accordion, AccordionHeader, AccordionContent } from ".";

export default {
	title: "Accordion",
};

export const Index = () => {
	const [expanded, setExpanded] = useState<boolean>();
	return <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
		<AccordionHeader>
			Header
		</AccordionHeader>
		<AccordionContent>
			Content
		</AccordionContent>
	</Accordion>;
};
