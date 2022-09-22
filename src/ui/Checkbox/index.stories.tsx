import { FC, useState } from "react";
import Checkbox, { CheckboxProps } from ".";

export default {
	title: "Checkbox",
};

const TestInput: FC<CheckboxProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState(value);
	return <Checkbox value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => <>
	<p><TestInput value={false} /></p>
	<p><TestInput value={false} disabled /></p>
	<p><TestInput value={true} disabled /></p>
</>;
