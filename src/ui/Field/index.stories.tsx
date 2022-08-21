import Field from ".";
import Input from "../Input";

export default {
	title: "Field",
};

export const Index = () => <>
	<Field title="Title" description="Description">
		<Input defaultValue="Input" />
	</Field>
</>;
