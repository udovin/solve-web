import { FC, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Status, statusUser } from "../../api";
import { useMetadata } from "../Metadata";

type Auth = {
	status?: Status;
	setStatus(status?: Status): void;
	refreshStatus(): void;
};

const AuthContext = createContext<Auth>({
	setStatus(): void { },
	refreshStatus(): void { },
});

const STATUS_KEY = "status";

const AuthProvider: FC<{ children?: ReactNode }> = props => {
	const { children } = props;
	const { getServerData } = useMetadata();
	const [status, setStatus] = useState(getServerData<Status>(STATUS_KEY));
	const refreshStatus = () => {
		statusUser()
			.then(setStatus)
			.catch(error => setStatus(undefined));
	};
	useEffect(() => {
		if (status !== undefined) {
			return;
		}
		refreshStatus();
	}, [status, setStatus]);
	return <AuthContext.Provider value={{ status, setStatus, refreshStatus }}>
		{children}
	</AuthContext.Provider>;
};

const ServerAuthProvider: FC<{ children?: ReactNode, status?: Status }> = props => {
	const { children, status } = props;
	const { setServerData } = useMetadata();
	setServerData(STATUS_KEY, status);
	const setStatus = (_status: Status | undefined) => console.error(`Cannot set status`);
	const refreshStatus = () => console.error(`Cannot refresh status`);
	return <AuthContext.Provider value={{ status, setStatus, refreshStatus }}>
		{children}
	</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, ServerAuthProvider, useAuth };
