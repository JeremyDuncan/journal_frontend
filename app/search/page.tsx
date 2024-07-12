"use client";

import React, { useState, useEffect } from 'react';
import { fetchPostsSearch } from '@/lib/api';
import { Post } from '@/lib/types';
import Link from 'next/link';
import { format } from 'date-fns';

const truncateHtmlContent = (html: string, maxLength: number): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const textContent = div.textContent || div.innerText || '';
    return textContent.length > maxLength
        ? textContent.substring(0, maxLength) + '...'
        : textContent;
};

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        if (query.trim() === '') {
            setPosts([]);
            return;
        }

        const fetchPosts = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await fetchPostsSearch(query, page);
                setPosts(result.posts);
                setTotalPages(result.total_pages);
            } catch (error) {
                console.error('Failed to search posts:', error);
                setError('Failed to search posts.');
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchPosts();
        }, 500); // Delay to debounce search input

        return () => clearTimeout(delayDebounceFn);
    }, [query, page]);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handlePageClick = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
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
        return pages;
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-white">Search Posts</h1>
            <input
                type="text"
                placeholder="Search by text, tags, or tag types..."
                value={query}
                onChange={(e) => {
                    setPage(1); // Reset to first page on new search
                    setQuery(e.target.value);
                }}
                className="w-full p-2 border rounded text-black"
            />
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="mt-4">
                {posts.map((post) => (
                    <div key={post.id} className="mb-4 p-4 border rounded bg-gray-800 text-white">
                        <p className="text-sm text-gray-500">{format(new Date(post.created_at), "MMMM do, yyyy 'at' h:mm a")}</p>
                        <h2 className="text-2xl font-bold">
                            <Link href={`/posts/${post.id}`} className="hover:text-gray-400">{post.title}</Link>
                        </h2>
                        <div
                            className="text-white"
                            dangerouslySetInnerHTML={{ __html: truncateHtmlContent(post.content, 300) }}
                        />
                        <div className="mt-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="inline-block text-white px-2 py-1 rounded mr-2"
                                    style={{ backgroundColor: tag.tag_type.color }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                        <Link href={`/posts/${post.id}`} className="text-blue-300 hover:underline">Read more</Link>
                    </div>
                ))}
            </div>
            {posts.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                    <button
                        onClick={handlePrevPage}
                        disabled={page <= 1}
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
};

export default SearchPage;
