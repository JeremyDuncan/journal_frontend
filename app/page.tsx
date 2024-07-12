"use client";

import { useEffect, useState } from 'react';
import { fetchPosts } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function getPosts() {
            try {
                const response = await fetchPosts(undefined, undefined, page, 5);
                console.log('API response => ', response);
                if (Array.isArray(response.posts)) {
                    setPosts(response.posts);
                    setTotalPages(response.total_pages);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        }
        getPosts().catch(error => console.error('Promise returned from getPost is ignored', error));
    }, [page]);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
            <Link href={"/posts/new"} className="text-blue-500 hover:underline mb-4 inline-block">
                Create New Blog Post
            </Link>
            <ul className="space-y-4">
                {posts.map((post) => (
                    <li key={post.id} className="border-b pb-2">
                        <Link href={`/posts/${post.id}`} className="text-xl text-blue-500 hover:underline">
                            {post.title}
                        </Link>
                        <p className="text-sm text-gray-500">{format(new Date(post.created_at), "MMMM do, yyyy 'at' h:mm a")}</p>
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-2">
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
                    </li>
                ))}
            </ul>
            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="text-blue-500 hover:underline disabled:text-gray-400"
                >
                    Previous
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                    className="text-blue-500 hover:underline disabled:text-gray-400"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
