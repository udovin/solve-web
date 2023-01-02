import { createContext, FC, ReactNode, useContext } from "react";

import "./index.scss";

type AccordionProps = {
    expanded?: boolean;
    onChange?(): void;
    children?: ReactNode;
};

type AccordionContextProps = {
    expanded?: boolean;
    onChange?(): void;
};

const AccordionContext = createContext<AccordionContextProps>({});

const Accordion: FC<AccordionProps> = props => {
    const { expanded, onChange, children } = props;
    return <AccordionContext.Provider value={{ expanded, onChange }}>
        <div className={`ui-accordion${expanded ? " expanded" : ""}`}>{children}</div>
    </AccordionContext.Provider>;
};

const AccordionHeader: FC<{ children?: ReactNode }> = props => {
    const { children } = props;
    const { onChange } = useContext(AccordionContext);
    return <div className="ui-accordion-header" onClick={onChange}>{children}</div>;
};

const AccordionContent: FC<{ children?: ReactNode }> = props => {
    const { children } = props;
    const { expanded } = useContext(AccordionContext);
    return expanded ? <div className="ui-accordion-content">{children}</div> : <></>;
};

export { Accordion, AccordionHeader, AccordionContent };
