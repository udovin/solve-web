import { FC, useContext } from "react";
import { Link } from "react-router-dom";
import Block from "../Block";
import { AuthContext } from "../Auth";
import Icon from "../Icon";
import { LocaleContext } from "../Locale";

import "./index.scss";

const Sidebar: FC = () => {
	const { status } = useContext(AuthContext);
	const { localize } = useContext(LocaleContext);
	const user = status?.user || status?.scope_user;
	const accountLinks = <>
		{status?.user && <li><Link to={`/users/${status.user.login}`}><Icon kind="account" /><span className="label">{localize("Profile")}</span></Link></li>}
		{status?.user && <li><Link to={`/users/${status.user.login}/edit`}><Icon kind="settings" /><span className="label">{localize("Settings")}</span></Link></li>}
		{user && <li><Link to="/logout"><Icon kind="backward" /><span className="label">{localize("Logout")}</span></Link></li>}
		{!user && <li><Link to="/login"><Icon kind="forward" /><span className="label">{localize("Login")}</span></Link></li>}
		{!user && <li><Link to="/register"><Icon kind="group" /><span className="label">{localize("Register")}</span></Link></li>}
	</>;
	return <Block className="b-sidebar">
		<ul>{accountLinks}</ul>
	</Block>;
};

export default Sidebar;
