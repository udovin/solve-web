import { FC, useContext } from "react";
import { Link } from "react-router-dom";
import Block from "../Block";
import { AuthContext } from "../../AuthContext";
import Icon from "../Icon";

import "./index.scss";

const Sidebar: FC = () => {
	const { status } = useContext(AuthContext);
	const accountLinks = <>
		{status?.user && <li><Link to={`/users/${status.user.login}`}><Icon kind="account" /><span className="label">Profile</span></Link></li>}
		{status?.user && <li><Link to={`/users/${status.user.login}/edit`}><Icon kind="settings" /><span className="label">Settings</span></Link></li>}
		{status?.user && <li><Link to="/logout"><Icon kind="backward" /><span className="label">Logout</span></Link></li>}
		{!status?.user && <li><Link to="/login"><Icon kind="forward" /><span className="label">Login</span></Link></li>}
		{!status?.user && <li><Link to="/register"><Icon kind="group" /><span className="label">Register</span></Link></li>}
	</>;
	return <Block className="b-sidebar">
		<ul>{accountLinks}</ul>
	</Block>;
};

export default Sidebar;
