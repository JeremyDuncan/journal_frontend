// app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { fetchPosts } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        async function getPosts() {
            try {
                const posts = await fetchPosts();
                console.log('API posts => ', posts);
                setPosts(posts);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        }
        getPosts();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
            <Link href="/posts/new" className="text-blue-500 hover:underline mb-4 inline-block">
                Create New Blog Post
            </Link>
            <ul className="space-y-4">
                {posts.map((post) => (
                    <li key={post.id} className="border-b pb-2">
                        <Link href={`/posts/${post.id}`} className="text-xl text-blue-500 hover:underline">
                            {post.title}
                        </Link>
                        <p className="text-sm text-gray-500">{format(new Date(post.created_at), "MMMM do, yyyy 'at' h:mm a")}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
