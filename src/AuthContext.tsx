import React, { FC, ReactNode, useEffect, useState } from "react";
import { statusUser, Status } from "./api";
import { strings } from "./Locale";

type Auth = {
	status?: Status;
	setStatus(status?: Status): void;
	updateStatus(): void;
};

const AuthContext = React.createContext<Auth>({
	setStatus(): void { },
	updateStatus(): void { },
});

const AuthProvider: FC<{ children?: ReactNode }> = props => {
	const [status, setStatus] = useState<Status>();
	const updateStatus = () => {
		statusUser()
			.then(result => {
				setStatus(result);
				if (result.locale) {
					// TODO: Possibly we need update this only when localStorage "locale" is undefined.
					strings.setLanguage(result.locale);
				}
			})
			.catch(error => setStatus(undefined));
	};
	useEffect(updateStatus, []);
	return <AuthContext.Provider value={{ status, setStatus, updateStatus }}>
		{props.children}
	</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
