import React, {FC, useState} from "react";
import Textarea, {TextareaProps} from "./index";

const config = {title: "Textarea"};

export default config;

const TestTextarea: FC<TextareaProps> = props => {
	const {value, ...rest} = props;
	const [newValue, setNewValue] = useState<string>(value || "");
	return <Textarea value={newValue} onValueChange={setNewValue} {...rest}/>
};

export const common = () => <>
	<p><TestTextarea value="Default"/></p>
	<p><TestTextarea value="Disabled" disabled/></p>
</>;
