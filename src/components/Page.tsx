import { FC, ReactNode, useContext } from "react";
import { MetadataContext } from "../ui/Metadata";

export type PageProps = {
	title: string;
	sidebar?: ReactNode;
	children?: ReactNode;
};

const Page: FC<PageProps> = props => {
	const { title, sidebar, children } = props;
	const { setTitle } = useContext(MetadataContext);
	setTitle(title);
	return <main id="main" className={sidebar ? undefined : "content"}>
		{sidebar && <div id="sidebar-wrap"><div id="sidebar">{sidebar}</div></div>}
		<div id="content-wrap"><div id="content">{children}</div></div>
	</main>;
};

export default Page;
