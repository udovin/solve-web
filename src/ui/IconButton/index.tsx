import { FC } from "react";
import Icon from "../Icon";

import "./index.scss";

export type IconButtonProps = {
	kind: string;
	color?: string;
	type?: "submit" | "reset" | "button" | undefined;
	onClick?(): void;
};

const IconButton: FC<IconButtonProps> = (props) => {
	const { kind, color, type, ...rest } = props;
	return <button
		className={`ui-icon-button ${color ?? ""}`.trimEnd()}
		type={type ?? "button"}
		{...rest}
	><Icon kind={kind} /></button>;
};

export default IconButton;
