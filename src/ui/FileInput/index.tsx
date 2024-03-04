import { ChangeEvent, FC, useEffect, useRef } from "react";
import Button from "../Button";
import Icon from "../Icon";
import { strings } from "../../Locale";

import "./index.scss";

export type FileInputProps = {
    name?: string;
    accept?: string;
    required?: boolean;
    disabled?: boolean;
    file?: File;
    onFileChange?(file?: File): void;
};

const FileInput: FC<FileInputProps> = props => {
    const { name, accept, file, onFileChange, disabled, ...rest } = props;
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }
        if (!file) {
            element.value = "";
        }
    }, [ref, file]);
    const onClick = () => {
        const element = ref.current
        if (!element) {
            return;
        }
        element.click();
    };
    return <>
        <Button className="ui-file-input" onClick={onClick} disabled={disabled}>
            <Icon kind="document" />
            <span className="filename" title={file ? file.name : undefined}>{file ? <>{file.name}</> : <>{strings.chooseFile}</>}</span>
        </Button>
        <input
            type="file"
            name={name}
            accept={accept}
            ref={ref}
            style={{ display: "none" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFileChange && onFileChange(e.target.files?.[0])}
            disabled={disabled}
            {...rest} />
    </>;
};

export default FileInput;
