import { FC, useEffect, useState } from "react";
import Input from "../Input";

export type NumberInputProps = {
	className?: string;
	name?: string;
	disabled?: boolean;
	required?: boolean;
	autoFocus?: boolean;
	autoComplete?: string;
	placeholder?: string;
	value?: number;
	onValueChange?(value?: number): void;
};

const NumberInput: FC<NumberInputProps> = props => {
	const { value, onValueChange, disabled, ...rest } = props;
	const [rawValue, setRawValue] = useState(value !== undefined ? String(value) : "");
	const format = /^-?\d*(\d\.\d*)?$/g;
	const parseNumber = (raw: string) => {
		return raw && raw !== "-" ? parseFloat(raw) : undefined;
	};
	const fixNumber = (raw: string) => {
		if (raw.length === 0 || raw === "-") {
			return raw;
		}
		let pos = raw[0] === "-" ? 1 : 0;
		for (; pos < raw.length; pos++) {
			if (raw[pos] !== "0") {
				break;
			}
		}
		if (pos === raw.length || raw[pos] === ".") {
			pos--;
		}
		return (raw[0] === "-" ? "-" : "") + raw.substring(pos);
	};
	useEffect(() => {
		if (parseNumber(rawValue) !== value) {
			setRawValue(String(value ?? ""));
		}
	}, [value, rawValue, setRawValue]);
	const rawValueChange = (raw: string) => {
		if (!disabled && onValueChange && raw.match(format)) {
			raw = fixNumber(raw);
			setRawValue(raw);
			onValueChange(parseNumber(raw));
		}
	};
	return <Input
		value={rawValue}
		onValueChange={rawValueChange}
		disabled={disabled}
		{...rest}
	/>
};

export default NumberInput;
