import { FC } from "react";

import "./index.scss";

export type CheckboxProps = {
	className?: string;
	name?: string;
	disabled?: boolean;
	value: boolean;
	onValueChange?(value: boolean): void;
};

const Checkbox: FC<CheckboxProps> = props => {
	const { value, onValueChange, className, ...rest } = props;
	return <input
		className={`ui-checkbox ${className ?? ""}`}
		type="checkbox"
		checked={value}
		onChange={onValueChange ? e => onValueChange(e.target.checked) : undefined}
		{...rest}
	/>
};

export default Checkbox;
