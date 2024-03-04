import Page from "../components/Page";
import Block from "../ui/Block";
import Sidebar from "../ui/Sidebar";
import { strings } from "../Locale"

const IndexPage = () => {
	return <Page title={strings.index} sidebar={<Sidebar />}>
		<Block title={strings.index}>
		</Block>
	</Page>;
};

export default IndexPage;
