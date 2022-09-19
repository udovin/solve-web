import { FC } from "react";

import "./index.scss";

export type InputProps = {
	className?: string;
	name?: string;
	disabled?: boolean;
	required?: boolean;
	autoFocus?: boolean;
	autoComplete?: string;
	type?: string;
	placeholder?: string;
	value?: string;
	onValueChange?(value: string): void;
};

const Input: FC<InputProps> = props => {
	const { value, onValueChange, className, ...rest } = props;
	return <input
		className={`ui-input ${className ?? ""}`}
		value={value || ""}
		onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
		{...rest}
	/>
};

export default Input;
