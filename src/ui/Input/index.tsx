import React, {FC, InputHTMLAttributes} from "react";
import "./index.scss";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	value?: string;
	onValueChange?(value: string): void;
};

const Input: FC<InputProps> = props => {
	const {value, onValueChange, onChange, className, ...rest} = props;
	return <input
		className={`ui-input ${className ?? ""}`}
		value={value || ""}
		onChange={onValueChange ? (e) => onValueChange(e.target.value) : onChange}
		{...rest}
	/>
};

export default Input;
