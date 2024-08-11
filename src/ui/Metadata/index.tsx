import { createContext, FC, ReactNode, useContext } from "react";

type MetadataContextProps = {
	setTitle(title: string): void;
	setDescription(description: string): void;
	setStatusCode(statusCode: number): void;
	getServerData<T>(key: string): T | undefined;
	setServerData<T>(key: string, value: T): void;
};

const MetadataContext = createContext<MetadataContextProps>({
	setTitle: (_title: string) => { },
	setDescription: (_description: string) => { },
	setStatusCode: (_statusCode: number) => { },
	getServerData<T>(_key: string): T | undefined { return undefined; },
	setServerData<T>(_key: string, _value: T): void { },
});

export const SITE_TITLE = process.env.REACT_SITE_TITLE ?? "Solve";

type WindowExt = Window & {
	SERVER_DATA?: Record<string, any>,
};

const MetadataProvider: FC<{ children?: ReactNode }> = props => {
	const { children } = props;
	const setTitle = (title: string) => { document.title = `${title} | ${SITE_TITLE}`; };
	const setDescription = (_description: string) => { };
	const setStatusCode = (_statusCode: number) => { };
	function getServerData<T>(key: string): T | undefined {
		return ((window as WindowExt).SERVER_DATA ?? {})[key];
	};
	function setServerData<T>(key: string, value: T): void {
		throw new Error(`Cannot set server data from client for key ${key}`);
	};
	return <MetadataContext.Provider value={{ setTitle, setDescription, setStatusCode, getServerData, setServerData }}>
		{children}
	</MetadataContext.Provider>
};

export type MetadataState = {
	title?: string;
	description?: string;
	statusCode?: number;
	data: Record<string, any>,
};

const ServerMetadataProvider: FC<{ children?: ReactNode, state: MetadataState }> = props => {
	const { children, state } = props;
	const setTitle = (title: string) => { state.title = `${title} | ${SITE_TITLE}`; };
	const setDescription = (description: string) => { state.description = description; };
	const setStatusCode = (statusCode: number) => { state.statusCode = statusCode; };
	function getServerData<T>(key: string): T | undefined {
		return state.data[key];
	};
	function setServerData<T>(key: string, value: T): void {
		state.data[key] = value;
	};
	return <MetadataContext.Provider value={{ setTitle, setDescription, setStatusCode, getServerData, setServerData }}>
		{children}
	</MetadataContext.Provider>;
};

const useMetadata = () => useContext(MetadataContext);

export { MetadataProvider, ServerMetadataProvider, useMetadata };
