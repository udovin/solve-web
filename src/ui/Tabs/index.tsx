import { createContext, FC, ReactNode, useContext } from "react";

import "./index.scss";

type TabsContext = {
    value?: string;
    onValueChange?(value?: string): void;
};

const TabsContext = createContext<TabsProps>({});

export type TabsProps = {
    value?: string;
    onValueChange?(value?: string): void;
    children?: ReactNode;
};

const Tabs: FC<TabsProps> = props => {
    const { value, onValueChange, children } = props;
    return <ul className="ui-tabs">
        <TabsContext.Provider value={{ value, onValueChange }}>
            {children}
        </TabsContext.Provider>
    </ul>;
};

export type TabProps = {
    value?: string;
    children?: ReactNode;
};

const Tab: FC<TabProps> = props => {
    const { value, children } = props;
    const { value: currentValue, onValueChange } = useContext(TabsContext);
    return <li
        className={`ui-tab${value === currentValue ? " selected" : ""}`}
        onClick={() => onValueChange && onValueChange(value)}>
        {children}
    </li>;
};

export { Tabs, Tab };
