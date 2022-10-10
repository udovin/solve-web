import { FC, ReactNode, useEffect, useState } from "react";

import "./index.scss";

export type TooltipProps = {
	className?: string;
	children?: ReactNode;
};

const Tooltip: FC<TooltipProps> = (props: TooltipProps) => {
	const { className, children } = props;
	return <>{children}</>;
};

export default Tooltip;
