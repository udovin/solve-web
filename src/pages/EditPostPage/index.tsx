import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "../../components/Page";
import Button from "../../ui/Button";
import FormBlock from "../../components/FormBlock";
import { BASE, ErrorResponse, observePost, Post, PostFormFile, updatePost } from "../../api";
import PostForm, { PostAttachment } from "../../ui/PostForm";
import { useLocale } from "../../ui/Locale";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";


import "../CreatePostPage/index.scss";

const EditPostPage: FC = () => {
    const params = useParams();
    const { post_id } = params;
    const { localize } = useLocale();
    const [post, setPost] = useState<Post>();
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [attachments, setAttachments] = useState<PostAttachment[]>([]);
    const [publish, setPublish] = useState<boolean>(false);
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        setPost(undefined);
        observePost(Number(post_id), true)
            .then(setPost)
            .catch(setError);
    }, [post_id]);
    useEffect(() => {
        if (!post) {
            return;
        }
        setTitle(post.title ?? "");
        setDescription(post.description ?? "");
        setAttachments(post.files?.map(item => ({
            id: item.id,
            name: item.name,
            url: `${BASE}/api/v0/posts/${post_id}/content/${item.name}`,
        })) ?? []);
        setPublish(!!post.publish_time);
    }, [post]);
    const onSubmit = (event: any) => {
        event.preventDefault();
        if (!post) {
            return;
        }
        setError(undefined);
        updatePost({
            id: post?.id,
            title,
            description,
            publish,
            files: attachments.reduce((list, item) => {
                if (item.file) {
                    return [...list, { name: item.name, content: item.file }];
                }
                return list;
            }, [] as PostFormFile[]),
            delete_files: attachments.reduce((list, item) => {
                if (item.id && item.deleted) {
                    return [...list, item.id];
                }
                return list;
            }, [] as number[]),
        })
            .then(() => {
                /* TODO: Redirect post */
            })
            .catch(setError);
    };
    if (!post) {
        if (error) {
            return <Page title="Error" sidebar={<Sidebar />}>
                {error.message && <Alert>{error.message}</Alert>}
            </Page>;
        }
        return <Page title={localize("Edit post")}>
            <>Loading...</>
        </Page>;
    }
    return <Page title={localize("Edit post")}>
        <FormBlock
            className="b-post-create"
            onSubmit={onSubmit}
            title={localize("Edit post")}
            footer={
                <Button type="submit" color="primary">{localize("Update")}</Button>
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

export default EditPostPage;
