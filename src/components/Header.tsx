import { FC, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { VERSION, getSolveVersion } from "../api";
import { AuthContext } from "../AuthContext";
import Tooltip from "../ui/Tooltip";

import "./index.scss";

const Header: FC = () => {
	const location = useLocation();
	const getActiveClass = (...names: string[]): string => {
		const { pathname } = location;
		for (let name of names) {
			if (name === pathname) {
				return "active";
			}
		}
		return "";
	};
	const { status } = useContext(AuthContext);
	const accountLinks = <>
		{status?.user && <li>
			Hello, <Link to={`/users/${status.user.login}`}>{status.user.login}</Link>!
		</li>}
		{status?.scope_user && <li>
			Hello, {status.scope_user.login}!
		</li>}
		{(!status || (!status.session && status.permissions?.includes("login"))) && <li>
			<Link to="/login">Login</Link>
		</li>}
		{(!status || (!status.session && status.permissions?.includes("register"))) && <li>
			<Link to="/register">Register</Link>
		</li>}
		{status?.session && status.permissions?.includes("logout") && <li>
			<Link to="/logout">Logout</Link>
		</li>}
	</>;
	return <header id="header">
		<div id="header-top">
			<div id="header-logo">
				<Link to="/">Solve</Link>
				<span>Online Judge</span>
			</div>
			<div id="header-account">
				<ul>
					{accountLinks}
				</ul>
			</div>
		</div>
		<nav id="header-nav">
			<ul>
				<li className={getActiveClass("/")}>
					<Link to="/">Index</Link>
				</li>
				{status?.permissions?.includes("observe_contests") && <li className={getActiveClass("/contests")}>
					<Link to="/contests">Contests</Link>
				</li>}
				{status?.permissions?.includes("observe_problems") && <li className={getActiveClass("/problems")}>
					<Link to="/problems">Problems</Link>
				</li>}
				{status?.permissions?.includes("observe_solutions") && <li className={getActiveClass("/solutions")}>
					<Link to="/solutions">Solutions</Link>
				</li>}
			</ul>
		</nav>
		<div id="header-version" title="Version"><Tooltip content={<span className="ui-version-tooltip">
			<span>Web: {VERSION}</span>
			<span>API: {getSolveVersion()}</span>
		</span>}>{VERSION}</Tooltip></div>
	</header>;
};

export default Header;
