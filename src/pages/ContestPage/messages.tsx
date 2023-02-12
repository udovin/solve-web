import { FC } from "react";
import { Contest } from "../../api";
import Block from "../../ui/Block";

type ContestMessagesBlockProps = {
    contest: Contest;
};

export const ContestMessagesBlock: FC<ContestMessagesBlockProps> = props => {
    const { contest } = props;
    return <Block title="Messages" className="b-contest-messages">
    </Block >;
};
