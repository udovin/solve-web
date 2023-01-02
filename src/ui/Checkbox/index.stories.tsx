import { FC, useState } from "react";
import Checkbox, { CheckboxProps } from ".";

export default {
	title: "Checkbox",
};

const TestCheckbox: FC<CheckboxProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState(value);
	return <Checkbox value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => <>
	<p><TestCheckbox value={false} /></p>
	<p><TestCheckbox value={false} disabled /></p>
	<p><TestCheckbox value={true} disabled /></p>
</>;
