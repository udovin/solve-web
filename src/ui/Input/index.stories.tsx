import React, { FC, useState } from "react";
import Input, { InputProps } from "./index";

export default {
	title: "Input",
};

const TestInput: FC<InputProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState<string>(value || "");
	return <Input value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => <>
	<p><TestInput value="Default" /></p>
	<p><TestInput value="Disabled" disabled /></p>
</>;
