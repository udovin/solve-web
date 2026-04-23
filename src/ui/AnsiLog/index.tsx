import { FC, useMemo } from "react";
import Convert from "ansi-to-html";

import "./index.scss";

export type AnsiLogProps = {
	className?: string;
	value: string;
};

const AnsiLog: FC<AnsiLogProps> = props => {
	const { className, value } = props;
	const html = useMemo(() => {
		const convert = new Convert({
			newline: false,
			escapeXML: true,
		});
		return convert.toHtml(value);
	}, [value]);
	return <pre
		className={`ui-ansi-log ${className ?? ""}`.trimEnd()}
		dangerouslySetInnerHTML={{ __html: html }}
	/>;
};

export default AnsiLog;
