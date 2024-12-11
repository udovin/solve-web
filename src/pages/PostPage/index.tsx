import { FC, useEffect, useState } from "react";
import Page from "../../components/Page";
import { BASE, observePost, Post } from "../../api";
import { useParams } from "react-router-dom";
import Latex from "../../ui/Latex";
import Block from "../../ui/Block";

const PostPage: FC = () => {
    const params = useParams();
    const { post_id } = params;
    const [post, setPost] = useState<Post>();
    useEffect(() => {
        observePost(Number(post_id))
            .then(setPost);
    }, [post_id]);
    return <Page title="Post">
        <Block title={post?.title}>
            <Latex content={post?.description} imageBaseUrl={`${BASE}/api/v0/posts/${post_id}/content/`} />
        </Block>
    </Page>;
};

export default PostPage;
