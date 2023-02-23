import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { logoutUser } from "../api";
import { AuthContext } from "../AuthContext";

const LogoutPage = () => {
	const { status, updateStatus } = useContext(AuthContext);
	const [success, setSuccess] = useState<boolean>();
	useEffect(() => {
		if (!status) {
			return;
		}
		logoutUser()
			.then(() => {
				setSuccess(true);
				updateStatus();
			});
	}, [status, updateStatus]);
	if (!(status && (status.user || status.scope_user)) || success) {
		return <Navigate to={"/"} />;
	}
	return <>Loading...</>;
};

export default LogoutPage;
