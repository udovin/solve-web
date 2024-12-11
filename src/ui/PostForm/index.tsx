import { FC, useState } from "react";
import { ErrorResponse } from "../../api";
import { useLocale } from "../Locale";
import Alert from "../Alert";
import Input from "../Input";
import Field from "../Field";
import Code from "../Code";
import Latex from "../Latex";
import FileInput from "../FileInput";
import Button from "../Button";
import IconButton from "../IconButton";
import { Tab, Tabs } from "../Tabs";
import ByteSize from "../ByteSize";
import Checkbox from "../Checkbox";

export type PostAttachment = {
    name: string,
    file?: File,
    url?: string,
    id?: number,
    deleted?: boolean,
};

export type PostFormProps = {
    title: string,
    onTitleChange(value: string): void,
    description: string,
    onDescriptionChange(value: string): void,
    attachments: PostAttachment[],
    onAttachmentsChange(attachments: PostAttachment[]): void,
    publish: boolean,
    onPublishChange(value: boolean): void;
    error?: ErrorResponse,
};

const PostForm: FC<PostFormProps> = props => {
    const {
        title, onTitleChange,
        description, onDescriptionChange,
        attachments, onAttachmentsChange,
        publish, onPublishChange,
        error,
    } = props;
    const { localize, localizeKey } = useLocale();
    const [descriptionTab, setDescriptionTab] = useState<string>();
    const [file, setFile] = useState<File>();
    const addAttachment = () => {
        if (!file) {
            return;
        }
        onAttachmentsChange([...attachments, {
            name: file.name,
            url: URL.createObjectURL(file),
            file,
        }]);
        setFile(undefined);
    };
    const attachmentMap = attachments.reduce(
        (map, item) => (item.url ? { ...map, [item.name]: item.url } : map),
        {} as Record<string, string | undefined>
    );
    const resolveImageUrl = (name: string) => {
        return attachmentMap[name] ?? name;
    };
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
            <Tabs value={descriptionTab} onValueChange={setDescriptionTab}>
                <Tab>{localize("Editor")}</Tab>
                <Tab value="preview">{localize("Preview")}</Tab>
            </Tabs>
            {descriptionTab === undefined && <Code
                value={description}
                onValueChange={onDescriptionChange}
                language="stex"
                editable
            />}
            {descriptionTab === "preview" && <div className="preview"><Latex content={description} resolveImageUrl={resolveImageUrl} /></div>}
        </Field>
        <div className="ui-field">
            <span className="label">{localize("Attachments") + ":"}</span>
            <table className="attachments">
                <tbody>
                    {attachments.map((attachment, index) => {
                        return <tr key={index} className={`attachment${attachment.deleted ? " deleted" : ""}`}>
                            <td className="file">
                                <img src={attachment.url} />
                            </td>
                            <td className="name">
                                {attachment.id ? <>
                                    <span className="title">{attachment.name}</span>
                                </> : <>
                                    <Input value={attachment.name} onValueChange={value =>
                                        onAttachmentsChange(attachments.map((item, i) => {
                                            if (i === index) {
                                                return { ...item, name: value };
                                            }
                                            return item;
                                        }))
                                    } />
                                    {attachment.file && <div><ByteSize value={attachment.file?.size} /></div>}
                                </>}
                            </td>
                            <td className="action">
                                {!attachment.deleted && <IconButton kind="delete" onClick={() =>
                                    onAttachmentsChange(attachment.id ?
                                        attachments.map((item, i) => {
                                            if (i === index) {
                                                return { ...item, deleted: true };
                                            }
                                            return item;
                                        }) :
                                        attachments.filter((item, i) => {
                                            return i !== index;
                                        }))
                                } />}
                            </td>
                        </tr>;
                    })}
                    <tr className="attachment">
                        <td colSpan={2}>
                            <FileInput file={file} onFileChange={setFile} />
                        </td>
                        <td className="action">
                            <Button onClick={addAttachment} disabled={!file}>Add</Button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <Field name="publish" errorResponse={error} description="Enables public access to post.">
            <Checkbox
                value={publish}
                onValueChange={onPublishChange} />
            <span className="label">{localize("Publish")}</span>
        </Field>
    </>;
};

export default PostForm;
