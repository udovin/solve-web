import { FC, useState } from "react";
import Field from ".";
import Input, { InputProps } from "../Input";

export default {
	title: "Field",
};

const TestInput: FC<InputProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState<string>(value || "");
	return <Input value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => <>
	<Field title="Title" description="Description">
		<TestInput value="Input" />
	</Field>
	<Field
		name="invalid"
		title="Title"
		description="Description"
		errorResponse={{ message: "error", invalid_fields: { "invalid": { message: "Invalid field" } } }}
	>
		<TestInput value="Input" />
	</Field>
</>;
