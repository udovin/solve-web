import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { logoutUser } from "../api";
import { useAuth } from "../ui/Auth";

const LogoutPage = () => {
	const { status, refreshStatus } = useAuth();
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
