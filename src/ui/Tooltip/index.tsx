import { CSSProperties, FC, ReactNode, useEffect, useRef, useState } from "react";
import Portal from "../Portal";

import "./index.scss";

export type TooltipProps = {
	id?: string;
	className?: string;
	children?: ReactNode;
	content?: ReactNode;
};

const Tooltip: FC<TooltipProps> = (props: TooltipProps) => {
	const { id, className, children, content } = props;
	const ref = useRef<HTMLSpanElement>(null);
	const [style, setStyle] = useState<CSSProperties>({});
	const [hover, setHover] = useState<boolean>(false);
	const onMouseOver = () => setHover(true);
	const onMouseOut = () => setHover(false);
	const updateStyle = () => {
		if (!ref.current) {
			return;
		}
		setStyle({
			top: ref.current.getBoundingClientRect().top + window.scrollY + ref.current.clientHeight,
			left: ref.current.getBoundingClientRect().left + window.scrollX + ref.current.clientWidth / 2,
			minWidth: ref.current?.scrollWidth,
		});
	};
	useEffect(() => {
		updateStyle();
		window.addEventListener("resize", updateStyle);
		return () => window.removeEventListener("resize", updateStyle);
	}, [ref, hover]);
	return <span
		id={id}
		className={`ui-tooltip ${className ?? ""}`}
		onMouseOver={onMouseOver}
		onMouseOut={onMouseOut}
		ref={ref}
	>
		{children}
		{hover && <Portal>
			<div className="ui-tooltip-block" style={style}>
				<span className="ui-tooltip-arrow"></span>
				<span className="ui-tooltip">
					<span className="ui-tooltip-content">{content}</span>
				</span>
			</div>
		</Portal>}
	</span>;
};

export default Tooltip;
