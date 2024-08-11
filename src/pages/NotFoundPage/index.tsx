import { FC } from "react";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Sidebar from "../../ui/Sidebar";
import { useLocale } from "../../ui/Locale";
import { useMetadata } from "../../ui/Metadata";

const NotFoundPage: FC = () => {
	const { localize } = useLocale();
	const { setStatusCode } = useMetadata();
	setStatusCode(404);
	return <Page title={localize("Page not found")} sidebar={<Sidebar />}>
		<Block title={localize("Page not found")}>
			<p>{localize("This page does not exists.")}</p>
		</Block>
	</Page>;
};

export default NotFoundPage;
