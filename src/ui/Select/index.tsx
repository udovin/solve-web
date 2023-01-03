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
	const [updating, setUpdating] = useState(false);
	const ref = useRef<HTMLSpanElement>(null);
	const [style, setStyle] = useState<CSSProperties>({});
	const toggleFocus = () => {
		setUpdating(true);
		setFocused(!focused);
	};
	const resetFocus = () => {
		setUpdating(false);
		setFocused(false);
	};
	useEffect(() => {
		if (!focused || updating) {
			setUpdating(false);
			return;
		}
		document.addEventListener("click", resetFocus);
		return () => document.removeEventListener("click", resetFocus);
	}, [updating, setUpdating, focused, setFocused]);
	const updateStyle = () => {
		if (!ref.current) {
			return;
		}
		const element = ref.current;
		setStyle({
			top: element.getBoundingClientRect().top + window.scrollY + element.scrollHeight,
			left: element.getBoundingClientRect().left + window.scrollX,
			minWidth: element.scrollWidth,
		});
	};
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		updateStyle();
		window.addEventListener("resize", updateStyle);
		window.addEventListener("scroll", updateStyle, true);
		return () => {
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
			<div className="ui-select-options" style={style}>
				<span className="options">
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
