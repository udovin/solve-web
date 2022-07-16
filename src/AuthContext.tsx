import React, { FC, ReactNode, useEffect, useState } from "react";
import { statusUser, Status } from "./api";

type Auth = {
	status?: Status;
	setStatus(status?: Status): void;
};

const AuthContext = React.createContext<Auth>({
	setStatus(): void { }
});

const AuthProvider: FC<{ children?: ReactNode }> = props => {
	const [status, setStatus] = useState<Status>();
	useEffect(() => {
		statusUser()
			.then(result => setStatus(result))
			.catch(error => setStatus(undefined))
	}, []);
	return <AuthContext.Provider value={{ status, setStatus }}>
		{props.children}
	</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
