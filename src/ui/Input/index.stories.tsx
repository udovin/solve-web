import React, {FC, useState} from "react";
import Input, {InputProps} from "./index";

const config = {title: "Input"};

export default config;

const TestInput: FC<InputProps> = props => {
	const {value, ...rest} = props;
	const [newValue, setNewValue] = useState<string>(value || "");
	return <Input value={newValue} onValueChange={setNewValue} {...rest}/>
};

export const common = () => <>
	<p><TestInput value="Default"/></p>
	<p><TestInput value="Disabled" disabled/></p>
</>;
