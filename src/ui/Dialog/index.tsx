import { FC, ReactNode } from "react";
import Portal from "../Portal";

import "./index.scss";

type DialogProps = {
    open?: boolean;
    onClose?: () => void;
    children?: ReactNode;
};

const Dialog: FC<DialogProps> = props => {
    const { open, onClose, children } = props;
    return open ? <Portal>
        <div className="ui-dialog-portal">
            <div className="ui-dialog-backdrop" onClick={onClose}></div>
            <div className="ui-dialog-wrap">
                <div className="ui-dialog">{children}</div>
            </div>
        </div>
    </Portal> : null;
};

export default Dialog;
