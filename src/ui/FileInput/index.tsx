import { ChangeEvent, FC, useEffect, useRef } from "react";
import Button from "../Button";
import Icon from "../Icon";

import "./index.scss";

export type FileInputProps = {
    name?: string;
    accept?: string;
    required?: boolean;
    file?: File;
    onFileChange?(file?: File): void;
};

const FileInput: FC<FileInputProps> = props => {
    const { name, accept, file, onFileChange, ...rest } = props;
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
        <Button className="ui-file-input" onClick={onClick}>
            <Icon kind="document" />
            <span className="filename">{file ? <>{file.name}</> : <>Choose file</>}</span>
        </Button>
        <input
            type="file"
            name={name}
            accept={accept}
            ref={ref}
            style={{ display: "none" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFileChange && onFileChange(e.target.files?.[0])}
            {...rest} />
    </>;
};

export default FileInput;
