import Page from "../components/Page";
import Block from "../ui/Block";
import Sidebar from "../ui/Sidebar";
import { useLocale } from "../ui/Locale";

const IndexPage = () => {
	const { localize } = useLocale();
	return <Page title={localize("Index")} sidebar={<Sidebar />}>
		<Block title={localize("Index")}>
		</Block>
	</Page>;
};

export default IndexPage;
