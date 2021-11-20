import { FC } from "react";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Sidebar from "../../components/Sidebar";

const NotFoundPage: FC = () => {
	return <Page title="Page not found" sidebar={<Sidebar />}>
		<Block title="Page not found">
			<p>This page does not exists.</p>
		</Block>
	</Page>;
};

export default NotFoundPage;
