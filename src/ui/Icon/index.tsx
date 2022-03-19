import { BaseHTMLAttributes, FC } from "react";

import "./index.scss";

export type IconProps = BaseHTMLAttributes<HTMLSpanElement> & {
    kind: string;
    color?: string;
};

const Icon: FC<IconProps> = props => {
    const { kind, color } = props;
    return <span className={`ui-icon i-${kind} ${color ?? ""}`}></span>;
};

export default Icon;
