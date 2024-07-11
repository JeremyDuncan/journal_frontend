"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPost } from '@/lib/api';
import { Post } from '@/lib/types';
import DOMPurify from 'dompurify';

export default function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        if (id && id !== "new") {
            const getPost = async () => {
                try {
                    const post = await fetchPost(id as string);
                    setPost(post);
                } catch (error) {
                    console.error('Failed to fetch post:', error);
                }
            };
            getPost();
        }
    }, [id]);

    if (id === "new") {
        return null; // Ensure nothing is rendered for "new"
    }

    if (!post) {
        return <div>Loading...</div>;
    }

    const sanitizedContent = DOMPurify.sanitize(post.content);

    return (
        <div className="container mx-auto p-4">
            {post.tags && post.tags.length > 0 && (
                <div className="mb-4">
                    <span className="font-bold text-gray-700">Tags:</span>
                    <ul className="flex flex-wrap gap-2 mt-1">
                        {post.tags.map((tag) => (
                            <li key={tag.id} className="bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {tag.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <h1 className="text-4xl font-bold mb-4 text-white">{post.title}</h1>
            <div className="prose lg:prose-xl text-white">
                <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            </div>
            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
    );
}
