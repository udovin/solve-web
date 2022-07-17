import { Tab, TabContent, Tabs, TabsGroup } from ".";
import { Story } from "@storybook/react";
import "../../index.scss";

export default {
	title: "Tabs",
	argTypes: {
		tab: {
			options: ["tab1", "tab2", "tab3"],
			control: { type: "radio" },
		},
	},
};

const Template: Story = args => <TabsGroup>
	<Tabs>
		<Tab tab="tab1"><a>Tab 1</a></Tab>
		<Tab tab="tab2"><a>Tab 2</a></Tab>
		<Tab tab="tab3"><a>Tab 3</a></Tab>
	</Tabs>
	<TabContent tab="tab1" setCurrent={args.tab === "tab1"}>Tab content 1</TabContent>
	<TabContent tab="tab2" setCurrent={args.tab === "tab2"}>Tab content 2</TabContent>
	<TabContent tab="tab3" setCurrent={args.tab === "tab3"}>Tab content 3</TabContent>
</TabsGroup>;

export const Index = Template.bind({});
Index.args = { tab: "tab1" };
