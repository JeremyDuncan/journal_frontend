// app/posts/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPost } from '@/lib/api';
// @ts-ignore
import { Post } from '@/lib/types';

export default function Post() {
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        if (id) {
            const getPost = async () => {
                try {
                    const post = await fetchPost(id as string); // Ensure `id` is treated as a string
                    setPost(post);
                } catch (error) {
                    console.error('Failed to fetch post:', error);
                }
            };
            getPost().then(r => console.log("GET POST"));
        }
    }, [id]);

    if (!post) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-lg">{post.content}</p>
            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
    );
}
