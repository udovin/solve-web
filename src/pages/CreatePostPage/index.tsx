import { FC, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Page from "../../components/Page";
import Button from "../../ui/Button";
import FormBlock from "../../components/FormBlock";
import { Contest, ErrorResponse } from "../../api";
import PostForm from "../../ui/PostForm";
import { useLocale } from "../../ui/Locale";
import { useDebounce } from "../../utils/debounce";

import "./index.scss";

const CreatePostPage: FC = () => {
    const { localize } = useLocale();
    const [newPost, setNewPost] = useState<Contest>();
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [error, setError] = useState<ErrorResponse>();
    const onSubmit = (event: any) => {
        event.preventDefault();
        setError(undefined);
    };
    const [localReady, setLocalReady] = useState(false);
    useEffect(() => {
        const localTitle = localStorage.getItem("post_create_title");
        const localDescription = localStorage.getItem("post_create_description");
        if (localTitle) {
            setTitle(localTitle);
        }
        if (localDescription) {
            setDescription(localDescription);
        }
        setLocalReady(true);
    }, []);
    const debouncedCache = useDebounce({ title, description, localReady }, 1000);
    useEffect(() => {
        const { title, description, localReady } = debouncedCache;
        if (localReady) {
            console.log(localReady, title, description);
            localStorage.setItem("post_create_title", title);
            localStorage.setItem("post_create_description", description);
        }
    }, [debouncedCache]);
    if (newPost) {
        return <Navigate to={"/posts/" + newPost.id} />
    }
    return <Page title={localize("Create post")}>
        <FormBlock
            className="b-post-create"
            onSubmit={onSubmit}
            title={localize("Create post")}
            footer={
                <Button type="submit" color="primary">{localize("Create")}</Button>
            }
        >
            <PostForm
                title={title}
                onTitleChange={setTitle}
                description={description}
                onDescriptionChange={setDescription}
                error={error}
            />
        </FormBlock>
    </Page>;
};

export default CreatePostPage;
