import { FC, ReactNode } from "react";
import Alert from "../Alert";
import { ErrorResponse } from "../../api";

import "./index.scss";

export type FieldProps = {
	name?: string;
	title?: string;
	description?: string | ReactNode;
	errorResponse?: ErrorResponse;
	children: ReactNode;
};

const Field: FC<FieldProps> = props => {
	const { name, title, description, children, errorResponse, ...rest } = props;
	const invalidFields = errorResponse?.invalid_fields;
	const invalidField = name && invalidFields ? invalidFields[name] : undefined;
	return <div className="ui-field" {...rest}>
		<label>
			{title && <span className="label">{title}</span>}
			{children}
			{invalidField && <Alert>{invalidField.message}</Alert>}
		</label>
		{description && <span className="text">{description}</span>}
	</div>;
};

export default Field;
