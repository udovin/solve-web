import { CSSProperties, FC, ReactNode, useEffect, useRef, useState } from "react";
import Portal from "../Portal";

import "./index.scss";

export type SelectProps = {
	className?: string;
	name?: string;
	disabled?: boolean;
	options: { [key: string]: ReactNode };
	value?: string;
	onValueChange?(value: string): void;
};

const Select: FC<SelectProps> = (props: SelectProps) => {
	const { className, name, disabled, options, value, onValueChange } = props;
	const [focused, setFocused] = useState(false);
	const [wrapFocused, setWrapFocused] = useState(false);
	const ref = useRef<HTMLSpanElement>(null);
	const [style, setStyle] = useState<CSSProperties>({});
	const toggleFocus = () => {
		updateStyle();
		setFocused(!focused);
	};
	const resetFocus = (event: Event) => {
		if (event.target instanceof Element && ref.current?.contains(event.target)) {
			return;
		}
		setFocused(false);
	};
	useEffect(() => {
		setWrapFocused(focused);
		if (!focused) {
			return;
		}
		document.addEventListener("click", resetFocus);
		return () => document.removeEventListener("click", resetFocus);
	}, [focused]);
	const updateStyle = () => {
		if (!ref.current) {
			return;
		}
		const element = ref.current;
		setStyle({
			top: element.getBoundingClientRect().top + window.scrollY,
			left: element.getBoundingClientRect().left + window.scrollX,
			minWidth: element.scrollWidth,
		});
	};
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		updateStyle();
		if (!focused) {
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
	}, [ref, focused]);
	return <span
		className={`ui-select${focused ? " focused" : ""}${disabled ? " disabled" : ""} ${className ?? ""}`.trimEnd()}
		onClick={!disabled ? toggleFocus : undefined}
		ref={ref}
	>
		<button type="button" disabled={disabled}>
			<span className="arrow"></span>{value && (options[value] === undefined ? value : options[value])}
		</button>
		{focused && <Portal>
			<div className="ui-select-portal" style={style}>
				<span
					className={`ui-select${wrapFocused ? " focused" : ""}${disabled ? " disabled" : ""} ${className ?? ""}`.trimEnd()}
					onClick={!disabled ? toggleFocus : undefined}
				>
					<button type="button" disabled={disabled}>
						<span className="arrow"></span>{value && (options[value] === undefined ? value : options[value])}
					</button>
				</span>
				<span className="ui-select-options">
					{Object.entries(options).map(([key, option], index) => {
						return <button
							type="button"
							className={`option${key === value ? " selected" : ""}`}
							key={index}
							onClick={() => onValueChange && onValueChange(key)}
							disabled={disabled}
						>{option}</button>;
					})}
				</span>
			</div>
		</Portal>}
		<input type="hidden" name={name} value={value} disabled={disabled} />
	</span>;
};

export default Select;
