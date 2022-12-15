import { Component, FC, ReactNode, useEffect, useState } from "react";

import "./index.scss";

export type TooltipProps = {
	id?: string;
	className?: string;
	children?: ReactNode;
	content?: ReactNode;
};

const Tooltip: FC<TooltipProps> = (props: TooltipProps) => {
	const { id, className, children, content } = props;
	const [hover, setHover] = useState<boolean>(false);
	const onMouseOver = () => setHover(true);
	const onMouseOut = () => setHover(false);
	return <span
		id={id}
		className={`ui-tooltip-label ${className ?? ""}`}
		onMouseOver={onMouseOver}
		onMouseOut={onMouseOut}
	>
		{children}
		<span className={`ui-tooltip-wrap${hover ? " hover" : ""}`}>
			<span className="ui-tooltip-arrow"></span>
			<span className="ui-tooltip">
				<span className="ui-tooltip-content">{content}</span>
			</span>
		</span>
	</span>;
};

export default Tooltip;
