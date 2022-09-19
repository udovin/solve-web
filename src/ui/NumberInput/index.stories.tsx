import { FC, useState } from "react";
import NumberInput, { NumberInputProps } from ".";

export default {
	title: "Number input",
};

const TestInput: FC<NumberInputProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState(value);
	return <NumberInput value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => <>
	<p><TestInput value={1234} /></p>
	<p><TestInput value={5678} disabled /></p>
</>;
