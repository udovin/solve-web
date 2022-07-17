import React, { FC, useState } from "react";
import Textarea, { TextareaProps } from "./index";

export default {
	title: "Textarea",
};

const TestTextarea: FC<TextareaProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState<string>(value || "");
	return <Textarea value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => <>
	<p><TestTextarea value="Default" /></p>
	<p><TestTextarea value="Disabled" disabled /></p>
</>;
