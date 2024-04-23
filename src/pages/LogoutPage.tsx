import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { logoutUser } from "../api";
import { AuthContext } from "../ui/Auth";

const LogoutPage = () => {
	const { status, refreshStatus } = useContext(AuthContext);
	const [success, setSuccess] = useState<boolean>();
	useEffect(() => {
		if (!status) {
			return;
		}
		logoutUser()
			.then(() => {
				setSuccess(true);
				refreshStatus();
			});
	}, [status, refreshStatus]);
	if (!(status && (status.user || status.scope_user)) || success) {
		return <Navigate to={"/"} />;
	}
	return <>Loading...</>;
};

export default LogoutPage;
