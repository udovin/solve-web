import React, { FC, ReactNode, useContext, useEffect, useState } from "react";

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
	return <span className={`ui-select${focused ? " focused" : ""}${disabled ? " disabled" : ""} ${className ?? ""}`} onClickCapture={!disabled ? toggleFocus : undefined}>
		<button type="button">
			<span className="arrow"></span>{value && (options[value] === undefined ? value : options[value])}
		</button>
		<span className="options-wrap">
			<span className="options">
				{Object.entries(options).map(([key, option], index) => {
					return <span className={`option ${key === value ? "selected" : ""}`} key={index} onClick={e => onValueChange && onValueChange(key)}>{option}</span>;
				})}
			</span>
		</span>
		<input type="hidden" name={name} value={value} disabled={disabled} />
	</span>;
};

export default Select;
