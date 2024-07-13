"use client";

import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { fetchPostsSearch } from '@/lib/api';
import { Post } from '@/lib/types';
import Link from 'next/link';
import { format } from 'date-fns';

const truncateHtmlContent = (html: string, maxLength: number): string => {
    const sanitizedHtml = DOMPurify.sanitize(html);
    const div = document.createElement('div');
    div.innerHTML = sanitizedHtml;
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
        const maxPagesToShow = 3;
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
        <div className="container mx-auto p-4 bg-gray-700 mt-4 mb-4 rounded">

            <div className="bg-gray-800 p-4 border rounded">
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
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="mt-4">
                {posts.map((post) => (
                    <div key={post.id} className="mb-4 p-4 border rounded bg-gray-800 text-white">
                        <p className="text-sm text-gray-500">{format(new Date(post.created_at), "MMMM do, yyyy 'at' h:mm a")}</p>
                        <p className="text-2xl font-bold text-stone-400 ">{post.title}</p>

                        <div className="text-white mb-0 pb-0">
                            {truncateHtmlContent(post.content, 300)}
                        </div>
                        <div className="mt-0">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="inline-block text-white px-2 py-1 rounded mr-2"
                                    style={{backgroundColor: tag.tag_type.color}}
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
