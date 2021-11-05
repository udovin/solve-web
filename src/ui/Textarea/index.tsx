import React, {FC, TextareaHTMLAttributes, useEffect, useRef} from "react";
import "./index.scss";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	value?: string;
	onValueChange?(value: string): void;
};

const Textarea: FC<TextareaProps> = props => {
	const {value, onValueChange, onChange, className, ...rest} = props;
	const textRef = useRef<HTMLTextAreaElement>(null);
	const updateSize = () => {
		if (!textRef.current) {
			return;
		}
		const element = textRef.current;
		element.style.height = "auto";
		element.style.height = `${element.scrollHeight+2}px`;
	};
	useEffect(() => {
		window.addEventListener("resize", updateSize);
		return () => {
			window.removeEventListener("resize", updateSize);
		};
	});
	useEffect(updateSize, [value]);
	return <textarea
		ref={textRef}
		className={`ui-textarea ${className ?? ""}`}
		value={value || ""}
		onChange={onValueChange ? (e) => onValueChange(e.target.value) : onChange}
		{...rest}
	/>
};

export default Textarea;
