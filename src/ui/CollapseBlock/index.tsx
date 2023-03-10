import { BaseHTMLAttributes, FC, ReactNode, useState } from "react";
import { Collapse, CollapseContent, CollapseHeader } from "../Collapse";

import "./index.scss";

export type CollapseBlockProps = BaseHTMLAttributes<HTMLDivElement> & {
	title?: string;
	header?: ReactNode;
};

const CollapseBlock: FC<CollapseBlockProps> = props => {
	let { title, header, children, className, ...rest } = props;
	if (title) {
		header = <span className="title">{title}</span>;
	}
	const [expanded, setExpanded] = useState(false);
	return <div className={`ui-block-wrap ${className ?? ""}`.trimEnd()} {...rest}>
		<Collapse className="ui-block" expanded={expanded} onChange={() => setExpanded(!expanded)}>
			{header && <CollapseHeader className="ui-block-header">{header}</CollapseHeader>}
			<CollapseContent className="ui-block-content">{children}</CollapseContent>
		</Collapse>
	</div>;
};

export default CollapseBlock;
