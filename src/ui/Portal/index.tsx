import { FC, ReactNode } from "react";
import ReactDOM from "react-dom";

type PortalProps = {
    children?: ReactNode;
};

const Portal: FC<PortalProps> = props => {
    const { children } = props;
    return ReactDOM.createPortal(children, document.body);
};

export default Portal;
