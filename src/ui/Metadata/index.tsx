import { createContext, FC, ReactNode, useState } from "react";

type MetadataContextProps = {
	setTitle(title: string): void;
	setDescription(description: string): void;
	setStatusCode(statusCode: number): void;
};

const MetadataContext = createContext<MetadataContextProps>({
	setTitle: (_title: string) => { },
	setDescription: (_description: string) => { },
	setStatusCode: (_statusCode: number) => { },
});

export const SITE_TITLE = process.env.REACT_SITE_TITLE ?? "Solve";

const MetadataProvider: FC<{ children?: ReactNode }> = props => {
	const { children } = props;
	const setTitle = (title: string) => { document.title = `${title} | ${SITE_TITLE}`; };
	const setDescription = (_description: string) => { };
	const setStatusCode = (_statusCode: number) => { };
	return <MetadataContext.Provider value={{ setTitle, setDescription, setStatusCode }}>
		{children}
	</MetadataContext.Provider>
};

export type ServerMetadata = {
	title?: string;
	description?: string;
	statusCode?: number;
};

const ServerMetadataProvider: FC<{ children?: ReactNode, metadata: ServerMetadata }> = props => {
	const { children, metadata } = props;
	const setTitle = (title: string) => { metadata.title = `${title} | ${SITE_TITLE}`; };
	const setDescription = (description: string) => { metadata.description = description; };
	const setStatusCode = (statusCode: number) => { metadata.statusCode = statusCode; };
	return <MetadataContext.Provider value={{ setTitle, setDescription, setStatusCode }}>
		{children}
	</MetadataContext.Provider>;
};

export { MetadataProvider, MetadataContext, ServerMetadataProvider };
