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
	// !unsafe
	formatNumber?(raw: string): string;
};

const defaultFormatNumber = (raw: string) => {
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

const NumberInput: FC<NumberInputProps> = props => {
	const { value, onValueChange, disabled, formatNumber, ...rest } = props;
	const formatRawNumber = formatNumber ? formatNumber : defaultFormatNumber;
	const [rawValue, setRawValue] = useState(formatRawNumber(value !== undefined ? String(value) : ""));
	const numberPattern = /^-?\d*(\d\.\d*)?$/g;
	const parseNumber = (raw: string) => {
		return raw && raw !== "-" ? parseFloat(raw) : undefined;
	};
	useEffect(() => {
		if (parseNumber(rawValue) !== value) {
			const raw = formatRawNumber(String(value ?? ""));
			setRawValue(raw);
		}
	}, [value, rawValue, setRawValue, formatRawNumber]);
	const rawValueChange = (raw: string) => {
		if (!disabled && onValueChange && raw.match(numberPattern)) {
			raw = formatRawNumber(raw);
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
