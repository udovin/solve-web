import { FC, useEffect, useState } from "react";
import Page from "../../components/Page";
import { BASE, ErrorResponse, observePost, Post } from "../../api";
import { useParams } from "react-router-dom";
import Latex from "../../ui/Latex";
import Block from "../../ui/Block";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";

const PostPage: FC = () => {
    const params = useParams();
    const { post_id } = params;
    const [post, setPost] = useState<Post>();
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observePost(Number(post_id))
            .then(setPost)
            .catch(setError);
    }, [post_id]);
    if (error) {
        return <Page title="Error" sidebar={<Sidebar />}>
            {error.message && <Alert>{error.message}</Alert>}
        </Page>;
    }
    return <Page title="Post" sidebar={<Sidebar />}>
        <Block title={post?.title}>
            <Latex content={post?.description} imageBaseUrl={`${BASE}/api/v0/posts/${post_id}/content/`} />
        </Block>
    </Page>;
};

export default PostPage;
