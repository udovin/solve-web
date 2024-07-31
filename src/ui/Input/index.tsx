import { FocusEventHandler, forwardRef, MouseEventHandler, RefObject } from "react";

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
	ref?: RefObject<HTMLInputElement>;
	onClick?: MouseEventHandler<HTMLInputElement>;
	onFocus?: FocusEventHandler<HTMLInputElement>;
	onBlur?: FocusEventHandler<HTMLInputElement>;
};

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const { value, onValueChange, className, ...rest } = props;
	return <input
		className={`ui-input ${className ?? ""}`.trimEnd()}
		value={value || ""}
		onChange={onValueChange ? e => onValueChange(e.target.value) : undefined}
		readOnly={!onValueChange}
		ref={ref}
		{...rest}
	/>
});

export default Input;
