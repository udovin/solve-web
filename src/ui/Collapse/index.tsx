import { createContext, FC, ReactNode, useContext } from "react";

import "./index.scss";

type CollapseContextProps = {
    expanded?: boolean;
    onChange?(): void;
};

const CollapseContext = createContext<CollapseContextProps>({});

type CollapseProps = {
    expanded?: boolean;
    onChange?(): void;
    children?: ReactNode;
};

const Collapse: FC<CollapseProps> = props => {
    const { expanded, onChange, children } = props;
    return <CollapseContext.Provider value={{ expanded, onChange }}>
        <div className={`ui-collapse${expanded ? " expanded" : ""}`}>{children}</div>
    </CollapseContext.Provider>;
};

const CollapseHeader: FC<{ children?: ReactNode }> = props => {
    const { children } = props;
    const { onChange } = useContext(CollapseContext);
    return <div className="ui-collapse-header" onClick={onChange}><span className="arrow"></span>{children}</div>;
};

const CollapseContent: FC<{ children?: ReactNode }> = props => {
    const { children } = props;
    const { expanded } = useContext(CollapseContext);
    return expanded ? <div className="ui-collapse-content">{children}</div> : <></>;
};

export { Collapse, CollapseHeader, CollapseContent };
