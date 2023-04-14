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
	const blockRef = useRef<HTMLDivElement>(null);
	const [style, setStyle] = useState<CSSProperties>({});
	const [hover, setHover] = useState<boolean>(false);
	const updateStyle = () => {
		if (!ref.current || !blockRef.current) {
			return;
		}
		const element = ref.current;
		const blockElement = blockRef.current;
		setStyle({
			top: element.getBoundingClientRect().top + window.scrollY + element.clientHeight,
			left: element.getBoundingClientRect().left + window.scrollX + (element.clientWidth - blockElement.clientWidth) / 2,
			minWidth: element.scrollWidth,
		});
	};
	const onMouseOver = () => {
		updateStyle();
		setHover(true)
	};
	const onMouseOut = () => setHover(false);
	useEffect(() => {
		if (!ref.current || !blockRef.current) {
			return;
		}
		updateStyle();
		if (!hover) {
			return;
		}
		const interval = setInterval(updateStyle, 100);
		window.addEventListener("resize", updateStyle);
		window.addEventListener("scroll", updateStyle, true);
		return () => {
			clearInterval(interval);
			window.removeEventListener("resize", updateStyle);
			window.removeEventListener("scroll", updateStyle, true);
		};
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
			<div className="ui-tooltip-portal" style={style} ref={blockRef}>
				<span className="ui-tooltip-arrow"></span>
				<span className="ui-tooltip">
					<span className="ui-tooltip-content">{content}</span>
				</span>
			</div>
		</Portal>}
	</span>;
};

export default Tooltip;
