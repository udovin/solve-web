import { Tab, Tabs } from ".";
import { InputProps } from "../Input";
import { FC, useState } from "react";

export default {
	title: "Tabs",
};

const TestTabs: FC<InputProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState<string>(value || "");
	return <Tabs value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => {
	const [value, setValue] = useState<string>();
	return <>
		<Tabs value={value} onValueChange={setValue}>
			<Tab>Empty tab</Tab>
			<Tab value="tab1">Tab 1</Tab>
			<Tab value="tab2">Tab 2</Tab>
		</Tabs>
		{value === "tab1" && <div>Tab 1 content</div>}
		{value === "tab2" && <div>Tab 2 content</div>}
	</>;
};
