import { FC } from "react";
import { Link } from "react-router-dom";
import { User } from "../../api";

export type UserLinkProps = {
    user: User;
};

const UserLink: FC<UserLinkProps> = props => {
    const { user } = props;
    return <Link to={`/users/${user.login}`}>{user.login}</Link>;
};

export default UserLink;
