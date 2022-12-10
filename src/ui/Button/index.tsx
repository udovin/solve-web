import { ButtonHTMLAttributes, FC } from "react";
import "./index.scss";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Button: FC<ButtonProps> = (props) => {
	const { color, type, ...rest } = props;
	return <button
		className={`ui-button ${color ?? ""}`.trimEnd()}
		type={type ?? "button"}
		{...rest}
	/>;
};

export default Button;
