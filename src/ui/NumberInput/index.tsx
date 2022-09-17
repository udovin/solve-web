import { FC, useEffect, useState } from "react";
import Input from "../Input";

export type NumberInputProps = {
	className?: string;
	name?: string;
	disabled?: boolean;
	required?: boolean;
	autoFocus?: boolean;
	autoComplete?: string;
	value?: number;
	onValueChange?(value?: number): void;
};

const NumberInput: FC<NumberInputProps> = props => {
	const { value, onValueChange, ...rest } = props;
	const [rawValue, setRawValue] = useState(value !== undefined ? String(value) : "");
	useEffect(() => {
		if (value && Number(rawValue) === value) {
			return;
		}
		setRawValue(String(value ?? ""));
	}, [value, rawValue]);
	const rawValueChange = (value: string) => {
		if (onValueChange) {
			value = value.replace(/[^\d.-]/g, '');
			setRawValue(value);
			onValueChange(value ? parseFloat(value) : undefined);
		}
	};
	return <Input
		value={rawValue}
		onValueChange={rawValueChange}
		{...rest}
	/>
};

export default NumberInput;
