import { FC, useState } from "react";
import { ErrorResponse } from "../../api";
import { useLocale } from "../Locale";
import Alert from "../Alert";
import Input from "../Input";
import Field from "../Field";
import Code from "../Code";
import Latex from "../Latex";

export type BlogPostFormProps = {
    title: string,
    onTitleChange(value: string): void,
    description: string,
    onDescriptionChange(value: string): void,
    error?: ErrorResponse,
};

const PostForm: FC<BlogPostFormProps> = props => {
    const {
        title, onTitleChange,
        description, onDescriptionChange,
        error,
    } = props;
    const { localize, localizeKey } = useLocale();
    const [descriptionTab, setDescriptionTab] = useState("editor");
    return <>
        {error && error.message && <Alert>{error.message}</Alert>}
        <Field title={localize("Title") + ":"} name="title" errorResponse={error}>
            <Input
                type="text" name="title" placeholder={localize("Title")}
                value={title}
                onValueChange={onTitleChange}
                required />
        </Field>
        <Field title={localize("Description") + ":"} name="description" errorResponse={error}>
            <ul className="tabs">
                <li className={descriptionTab === "editor" ? "selected" : undefined} onClick={() => setDescriptionTab("editor")}>{localize("Editor")}</li>
                {description && <li className={descriptionTab === "preview" ? "selected" : undefined} onClick={() => setDescriptionTab("preview")}>{localize("Preview")}</li>}
            </ul>
            {descriptionTab === "editor" && <Code
                value={description}
                onValueChange={onDescriptionChange}
                language="stex"
                editable
            />}
            {descriptionTab === "preview" && <div className="preview"><Latex content={description} /></div>}
        </Field>
        <Field title={localize("Attachments") + ":"}>
            <></>
        </Field>
    </>;
};

export default PostForm;
