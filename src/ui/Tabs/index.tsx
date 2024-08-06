import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";

import "./index.scss";

type TabContextProps = {
	currentTab?: string;
	setCurrentTab?(tab: string): void;
};

const TabContext = createContext<TabContextProps>({});

const TabsGroup: FC<{ children?: ReactNode }> = props => {
	const { children } = props;
	const [currentTab, setCurrentTab] = useState<string>();
	return <TabContext.Provider value={{ currentTab, setCurrentTab }}>{children}</TabContext.Provider>;
};

const Tabs: FC<{ children?: ReactNode }> = props => {
	const { children } = props;
	return <ul className="ui-tabs">{children}</ul>;
};

const Tab: FC<{ tab: string, children?: ReactNode }> = props => {
	const { tab, children } = props;
	const { currentTab } = useContext(TabContext);
	return <li className={tab === currentTab ? "active" : undefined}>{children}</li>;
};

const TabContent: FC<{ tab: string, children?: ReactNode, setCurrent?: boolean }> = props => {
	const { tab, children, setCurrent } = props;
	const { currentTab, setCurrentTab } = useContext(TabContext);
	useEffect(() => {
		setCurrent && setCurrentTab && setCurrentTab(tab);
	}, [tab, setCurrentTab, setCurrent]);
	return <>{tab === currentTab && children}</>;
};

export { TabsGroup, Tabs, Tab, TabContent };
