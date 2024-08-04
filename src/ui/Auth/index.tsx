import { FC, ReactNode, createContext, useEffect, useState } from "react";
import { Status, statusUser } from "../../api";

type Auth = {
    status?: Status;
    setStatus(status?: Status): void;
    refreshStatus(): void;
};

const AuthContext = createContext<Auth>({
    setStatus(): void { },
    refreshStatus(): void { },
});

const AuthProvider: FC<{ children?: ReactNode }> = props => {
    const [status, setStatus] = useState<Status>();
    const refreshStatus = () => {
        statusUser()
            .then(setStatus)
            .catch(error => setStatus(undefined));
    };
    useEffect(refreshStatus, []);
    return <AuthContext.Provider value={{ status, setStatus, refreshStatus }}>
        {props.children}
    </AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
