"use client";

import React, { useEffect, useState } from 'react';
import { fetchPosts } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { format } from 'date-fns';
import DOMPurify from "dompurify";

const truncateHtmlContent = (html: string, maxLength: number): string => {
    const sanitizedHtml = DOMPurify.sanitize(html);
    const div = document.createElement('div');
    div.innerHTML = sanitizedHtml;
    const textContent = div.textContent || div.innerText || '';
    return textContent.length > maxLength
        ? textContent.substring(0, maxLength) + '...'
        : textContent;
};

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function getPosts() {
            try {
                const response = await fetchPosts(undefined, undefined, page, 5);
                if (Array.isArray(response.posts)) {
                    setPosts(response.posts);
                    setTotalPages(response.total_pages);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        }
        getPosts().catch(error => console.error('Promise returned from getPosts is ignored', error));
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

    const handlePageClick = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const renderPagination = () => {
        const pages = [];
        const maxPagesToShow = 6;
        let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pages.push(
                <button
                    key="start"
                    onClick={() => handlePageClick(1)}
                    className="px-3 py-1 rounded bg-gray-200 text-black"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="start-ellipsis" className="px-3 py-1">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageClick(i)}
                    className={`px-3 py-1 rounded ${i === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="end-ellipsis" className="px-3 py-1">...</span>);
            }
            pages.push(
                <button
                    key="end"
                    onClick={() => handlePageClick(totalPages)}
                    className="px-3 py-1 rounded bg-gray-200 text-black"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-white">Blog Post Home</h1>
            <Link href={"/posts/new"} className="text-blue-500 hover:underline mb-4 inline-block">
                Create New Blog Post
            </Link>
            <ul className="space-y-4">
                {posts.map((post) => (
                    <li key={post.id} className="mb-4 p-4 border rounded bg-gray-800 text-white">
                        <p className="text-sm text-gray-500">{format(new Date(post.created_at), "MMMM do, yyyy 'at' h:mm a")}</p>
                        <p className="text-2xl font-bold text-stone-400 ">{post.title}</p>
                        <div className="text-white">
                            {truncateHtmlContent(post.content, 300)}
                        </div>
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-2">
                                <ul className="flex flex-wrap gap-2 mt-1">
                                    {post.tags.map((tag) => (
                                        <li
                                            key={tag.id}
                                            className="px-2 py-1 rounded"
                                            style={{backgroundColor: tag.tag_type.color, color: 'white'}}
                                        >
                                            {tag.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div style={{marginTop: '10px'}} className="flex flex-wrap gap-2">
                            <Link href={`/posts/${post.id}`} className="text-blue-300 hover:underline">Read more</Link>
                        </div>
                    </li>

                ))}
            </ul>
            {posts.length > 0 && (
                <div className="flex justify-between mt-4 items-center">
                <button
                        onClick={handlePreviousPage}
                        disabled={page === 1}
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <div className="flex space-x-2">
                        {renderPagination()}
                    </div>
                    <button
                        onClick={handleNextPage}
                        disabled={page >= totalPages}
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
