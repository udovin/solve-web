import React, { FC, ReactNode, useEffect, useState } from "react";

import "./index.scss";

type TabContext = {
    currentTab?: string;
    setCurrentTab?(tab: string): void;
};

const { Consumer, Provider } = React.createContext<TabContext>({});

const TabsGroup: FC<{ children?: ReactNode }> = props => {
    const { children } = props;
    const [currentTab, setCurrentTab] = useState<string>();
    return <Provider value={{ currentTab, setCurrentTab }}>{children}</Provider>;
};

const Tabs: FC<{ children?: ReactNode }> = props => {
    const { children } = props;
    return <ul className="ui-tabs">{children}</ul>;
};

const Tab: FC<{ tab: string, children?: ReactNode }> = props => {
    const { tab, children } = props;
    return <Consumer>{({ currentTab }) => {
        return <li className={tab === currentTab ? "active" : undefined}>{children}</li>;
    }}</Consumer>;
};

const Content: FC<TabContext & { tab: string, children?: ReactNode }> = props => {
    const { currentTab, setCurrentTab, tab, children } = props;
    useEffect(() => {
        setCurrentTab && setCurrentTab(tab);
    }, [tab, setCurrentTab]);
    return <>{tab === currentTab && children}</>;
};

const TabContent: FC<{ tab: string, children?: ReactNode, setCurrent?: boolean }> = props => {
    const { tab, children, setCurrent } = props;
    return <Consumer>{
        ({ currentTab, setCurrentTab }) =>
            <Content currentTab={currentTab} setCurrentTab={setCurrent === true ? setCurrentTab : undefined} tab={tab} children={children} />
    }</Consumer>;
};

export { TabsGroup, Tabs, Tab, TabContent };
