import { FC, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Page from "../../components/Page";
import Button from "../../ui/Button";
import FormBlock from "../../components/FormBlock";
import { createPost, ErrorResponse, Post, PostFormFile } from "../../api";
import PostForm, { PostAttachment } from "../../ui/PostForm";
import { useLocale } from "../../ui/Locale";
import { useDebounce } from "../../utils/debounce";

import "./index.scss";

const CreatePostPage: FC = () => {
    const { localize } = useLocale();
    const [newPost, setNewPost] = useState<Post>();
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [attachments, setAttachments] = useState<PostAttachment[]>([]);
    const [publish, setPublish] = useState<boolean>(false);
    const [error, setError] = useState<ErrorResponse>();
    const onSubmit = (event: any) => {
        event.preventDefault();
        setError(undefined);
        createPost({
            title,
            description,
            publish,
            files: attachments.reduce((list, item) => {
                if (item.file) {
                    return [...list, { name: item.name, content: item.file }];
                }
                return list;
            }, [] as PostFormFile[]),
        })
            .then(setNewPost)
            .catch(setError);
    };
    const [localCache, setLocalCache] = useState({ ready: false, title: "", description: "" });
    useEffect(() => {
        const title = localStorage.getItem("post_create_title") ?? "";
        const description = localStorage.getItem("post_create_description") ?? "";
        setTitle(title);
        setDescription(description);
        setLocalCache({ ready: true, title, description });
    }, []);
    useEffect(() => {
        setLocalCache({ ready: true, title, description });
    }, [title, description]);
    const localCacheDebounce = useDebounce(localCache, 1000);
    useEffect(() => {
        const { ready, title, description } = localCacheDebounce;
        if (ready) {
            localStorage.setItem("post_create_title", title);
            localStorage.setItem("post_create_description", description);
        }
    }, [localCacheDebounce]);
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
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                publish={publish}
                onPublishChange={setPublish}
                error={error}
            />
        </FormBlock>
    </Page>;
};

export default CreatePostPage;
