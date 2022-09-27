import { FC, useState } from "react";
import Select, { SelectProps } from ".";

export default {
	title: "Select",
};

const TestSelect: FC<SelectProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState<string>(value || "");
	return <Select value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => <>
	<p><TestSelect value="a" options={{ "a": "Option A", "b": "Option B" }} /></p>
	<p><TestSelect value="a" options={{ "a": "Option A", "b": "Option B" }} disabled /></p>
	<p><TestSelect value="invalid" options={{ "a": "Option A", "b": "Option B" }} /></p>
</>;
