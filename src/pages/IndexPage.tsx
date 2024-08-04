import { useContext } from "react";
import Page from "../components/Page";
import Block from "../ui/Block";
import Sidebar from "../ui/Sidebar";
import { LocaleContext } from "../ui/Locale";

const IndexPage = () => {
	const { localize } = useContext(LocaleContext);
	return <Page title={localize("Index")} sidebar={<Sidebar />}>
		<Block title={localize("Index")}>
		</Block>
	</Page>;
};

export default IndexPage;
