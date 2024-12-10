import { FC } from "react";
import Block, { BlockProps } from "../Block";
import { Tabs, TabsProps } from "../Tabs";

import "./index.scss";

const TabsBlock: FC<BlockProps & TabsProps> = props => {
    let { children, className, ...rest } = props;
    return <Block className={`ui-tabs-block ${className ?? ""}`}>
        <Tabs {...rest}>{children}</Tabs>
    </Block>;
};

export default TabsBlock;
