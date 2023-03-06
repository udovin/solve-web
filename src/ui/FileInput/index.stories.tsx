import { FC, useState } from "react";
import FileInput, { FileInputProps } from ".";

export default {
	title: "File input",
};

const TestFileInput: FC<FileInputProps> = props => {
	const { ...rest } = props;
	const [newFile, setNewFile] = useState<File>();
	return <FileInput file={newFile} onFileChange={setNewFile} {...rest} />
};


export const Index = () => <>
	<p><TestFileInput /></p>
</>;
