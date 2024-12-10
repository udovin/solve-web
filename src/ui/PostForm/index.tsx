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

export type BlockPostAttachment = {
    name: string,
    file?: File,
    url?: string,
};

export type BlogPostFormProps = {
    title: string,
    onTitleChange(value: string): void,
    description: string,
    onDescriptionChange(value: string): void,
    attachments: BlockPostAttachment[],
    onAttachmentsChange(attachments: BlockPostAttachment[]): void,
    error?: ErrorResponse,
};

const PostForm: FC<BlogPostFormProps> = props => {
    const {
        title, onTitleChange,
        description, onDescriptionChange,
        attachments, onAttachmentsChange,
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
        <Field title={localize("Attachments") + ":"}>
            <></>
        </Field>
        <table className={"attachments"}>
            <tbody>
                {attachments.map((attachment, index) => {
                    return <tr key={index}>
                        <td className="file">
                            <img src={attachment.url} />
                        </td>
                        <td className="name">
                            <Input value={attachment.name} onValueChange={value => onAttachmentsChange(attachments.map((item, i) => {
                                if (i === index) {
                                    return { ...item, name: value };
                                }
                                return item;
                            }))} />
                        </td>
                        <td className="action">
                            <IconButton kind="delete" onClick={() => onAttachmentsChange(attachments.filter((item, i) => {
                                return i !== index;
                            }))} />
                        </td>
                    </tr>;
                })}
            </tbody>
        </table>
        <FileInput file={file} onFileChange={setFile} />
        <Button onClick={addAttachment} disabled={!file}>Add</Button>
    </>;
};

export default PostForm;
