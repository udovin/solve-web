import Field from ".";
import Input from "../Input";

export default {
	title: "Field",
};

export const Index = () => <>
	<Field title="Title" description="Description">
		<Input value="Input" />
	</Field>
	<Field
		name="invalid"
		title="Title"
		description="Description"
		errorResponse={{ message: "error", invalid_fields: { "invalid": { message: "Invalid field" } } }}
	>
		<Input value="Input" />
	</Field>
</>;
