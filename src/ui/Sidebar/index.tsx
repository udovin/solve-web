import { FC, useContext } from "react";
import { Link } from "react-router-dom";
import Block from "../Block";
import { AuthContext } from "../../AuthContext";
import Icon from "../Icon";
import { strings } from "../../Locale";

import "./index.scss";

const Sidebar: FC = () => {
	const { status } = useContext(AuthContext);
	const user = status?.user || status?.scope_user;
	const accountLinks = <>
		{status?.user && <li><Link to={`/users/${status.user.login}`}><Icon kind="account" /><span className="label">{strings.profile}</span></Link></li>}
		{status?.user && <li><Link to={`/users/${status.user.login}/edit`}><Icon kind="settings" /><span className="label">{strings.settings}</span></Link></li>}
		{user && <li><Link to="/logout"><Icon kind="backward" /><span className="label">{strings.logout}</span></Link></li>}
		{!user && <li><Link to="/login"><Icon kind="forward" /><span className="label">{strings.login}</span></Link></li>}
		{!user && <li><Link to="/register"><Icon kind="group" /><span className="label">{strings.register}</span></Link></li>}
	</>;
	return <Block className="b-sidebar">
		<ul>{accountLinks}</ul>
	</Block>;
};

export default Sidebar;
