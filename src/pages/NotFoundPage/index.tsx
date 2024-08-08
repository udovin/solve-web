import { FC, useContext } from "react";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Sidebar from "../../ui/Sidebar";
import { LocaleContext } from "../../ui/Locale";
import { MetadataContext } from "../../ui/Metadata";

const NotFoundPage: FC = () => {
	const { localize } = useContext(LocaleContext);
	const { setStatusCode } = useContext(MetadataContext);
	setStatusCode(404);
	return <Page title={localize("Page not found")} sidebar={<Sidebar />}>
		<Block title={localize("Page not found")}>
			<p>{localize("This page does not exists.")}</p>
		</Block>
	</Page>;
};

export default NotFoundPage;
