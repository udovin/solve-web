import { FC, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import Alert, { AlertKind } from "../Alert";
import IconButton from "../IconButton";

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
    const [showConfirmEmail, setShowConfirmEmail] = useState(false);
    useEffect(() => {
        setShowConfirmEmail(status?.user?.status === "pending");
    }, [status]);
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
    const canObserveSettings = status?.permissions?.includes("observe_settings");
    const canObserveRoles = status?.permissions?.includes("observe_roles");
    const canObserveScopes = status?.permissions?.includes("observe_scopes");
    const canObserveAdmin = canObserveSettings || canObserveRoles || canObserveScopes;
    return <header id="header">
        <div id="header-top">
            <div id="header-logo">
                <Link to="/">Solve</Link>
                <span>Online Judge</span>
            </div>
            <div id="header-account">
                <ul>{accountLinks}</ul>
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
                {canObserveAdmin && <li className={`admin ${getActiveClass("/admin", "/admin/settings", "/admin/roles", "/admin/scopes")}`}>
                    <Link to="/admin">Admin</Link>
                </li>}
            </ul>
        </nav>
        {showConfirmEmail && <Alert kind={AlertKind.WARNING}>
            A confirmation email has been sent to your email address. To get full access, you need to follow the link provided in this email.
            <IconButton kind="delete" onClick={() => setShowConfirmEmail(false)}></IconButton>
        </Alert>}
    </header>;
};

export default Header;