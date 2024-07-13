"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPost, deletePost } from '@/lib/api';
import { Post } from '@/lib/types';
import DOMPurify from 'dompurify';
import Link from 'next/link';

export default function PostPage() {
    const { id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [showModal, setShowModal] = useState(false);

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
            getPost().catch(error => console.error('Promise returned from getPost is ignored', error));
        }
    }, [id]);

    if (id === "new") {
        return null; // Ensure nothing is rendered for "new"
    }

    if (!post) {
        return <div>Loading...</div>;
    }

    const sanitizedContent = DOMPurify.sanitize(post.content);

    const handleDelete = async () => {
        try {
            await deletePost(id as string);
            router.push('/');
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            {post.tags && post.tags.length > 0 && (
                <div className="mb-4">
                    <span className="font-bold text-gray-700">Tags:</span>
                    <ul className="flex flex-wrap gap-2 mt-1">
                        {post.tags.map((tag) => (
                            <li
                                key={tag.id}
                                className="px-2 py-1 rounded"
                                style={{ backgroundColor: tag.tag_type.color, color: 'white' }} // Use the tag type color
                            >
                                {tag.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="mb-4 p-4 border rounded bg-gray-800 text-white">
                <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                <h1 className="text-4xl font-bold mb-4 text-stone-400">{post.title}</h1>
                <div className="prose lg:prose-xl text-white">
                    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                </div>
            </div>
            <div className="flex gap-4 mt-4">
                <Link className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" href={`/posts/${id}/edit`}>
                    Edit Post
                </Link>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Delete Post
                </button>
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <h2 className="text-xl font-bold text-black mb-4">Confirm Deletion</h2>
                        <p className="text-black">Are you sure you want to delete this post?</p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
