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
	className?: string;
};

const Collapse: FC<CollapseProps> = props => {
	const { expanded, onChange, children, className } = props;
	return <CollapseContext.Provider value={{ expanded, onChange }}>
		<div className={`ui-collapse${expanded ? " expanded" : ""} ${className ?? ""}`}>{children}</div>
	</CollapseContext.Provider>;
};

const CollapseHeader: FC<{ children?: ReactNode, className?: string }> = props => {
	const { children, className } = props;
	const { onChange } = useContext(CollapseContext);
	return <div className={`ui-collapse-header ${className ?? ""}`} onClick={onChange}><span className="arrow"></span>{children}</div>;
};

const CollapseContent: FC<{ children?: ReactNode, className?: string }> = props => {
	const { children, className } = props;
	const { expanded } = useContext(CollapseContext);
	return expanded ? <div className={`ui-collapse-content ${className ?? ""}`}>{children}</div> : <></>;
};

export { Collapse, CollapseHeader, CollapseContent };
