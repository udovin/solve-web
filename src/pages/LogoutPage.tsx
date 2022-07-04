import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const LogoutPage = () => {
	const { status, setStatus } = useContext(AuthContext);
	const [success, setSuccess] = useState<boolean>();
	useEffect(() => {
		if (status) {
			fetch("/api/v0/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json; charset=UTF-8",
				},
			})
				.then(() => {
					setSuccess(true);
					setStatus();
				});
		}
	}, [status, setStatus]);
	if (!(status && status.user) || success) {
		return <Navigate to={"/"} />;
	}
	return <>Loading...</>;
};

export default LogoutPage;
