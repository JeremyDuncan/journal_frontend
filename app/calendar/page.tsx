'use client';

import React, { useState, useEffect, useRef } from 'react';
import Calendar, { CalendarProps, OnArgs } from 'react-calendar';
import { fetchPosts, fetchTags } from '@/lib/api';
import Link from 'next/link';
import { Post, Tag } from '@/lib/types';
import { isSameDay, parseISO, getYear, getMonth, format } from 'date-fns';
import DOMPurify from "dompurify";
import TagsSection from '../components/TagSection';

const CalendarView: React.FC<CalendarProps> = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [date, setDate] = useState<Date>(new Date());
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedDatePosts, setSelectedDatePosts] = useState<Post[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        async function loadTags() {
            try {
                const tags = await fetchTags();
                setTags(tags);
            } catch (error) {
                console.error('Failed to load tags:', error);
            }
        }
        loadTags().catch(error => console.error('Promise returned from loadTags is ignored', error));
    }, []);

    useEffect(() => {
        async function getPosts() {
            try {
                const year = getYear(date);
                const month = getMonth(date) + 1; // getMonth returns 0-indexed month
                const data = await fetchPosts(year, month, 1, 500); // Fetch all posts for the month
                if (Array.isArray(data.posts)) {
                    setPosts(data.posts);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                setPosts([]);
            } finally {
                setLoadingPosts(false);
            }
        }
        getPosts().catch(error => console.error('Promise returned from getPost is ignored', error));
    }, [date]);

    useEffect(() => {
        // Filter posts based on selected tags
        if (selectedTags.length > 0) {
            const filtered = posts.filter(post =>
                post.tags.some((tag: Tag) => selectedTags.includes(tag.name))
            );
            setFilteredPosts(filtered);
        } else {
            setFilteredPosts(posts);
        }
    }, [posts, selectedTags]);

    const getPostsForDay = (date: Date) => {
        return filteredPosts.filter(post => isSameDay(parseISO(post.created_at), date));
    };

    const tileContent: CalendarProps['tileContent'] = ({ date, view }) => {
        if (view === 'month') {
            const postsForDay = getPostsForDay(date);
            return (
                <ul className="post-list">
                    {postsForDay.map(post => (
                        <li key={post.id}>
                            <Link href={`/posts/${post.id}`} className="text-blue-500 hover:underline">
                                {post.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            );
        }
        return null;
    };

    const handleActiveStartDateChange = ({ activeStartDate }: OnArgs) => {
        if (activeStartDate) {
            setDate(activeStartDate);
        }
    };

    const handleTagSelection = (tag: string) => {
        setSelectedTags((prevSelectedTags) =>
            prevSelectedTags.includes(tag)
                ? prevSelectedTags.filter((t) => t !== tag)
                : [...prevSelectedTags, tag]
        );
    };

    const handleDayClick = (date: Date) => {
        const postsForDay = getPostsForDay(date);
        setSelectedDatePosts(postsForDay);
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };

    useEffect(() => {
        if (isModalOpen && modalRef.current && closeButtonRef.current) {
            const modalHeight = modalRef.current.offsetHeight;
            const modalTop = modalRef.current.getBoundingClientRect().top;
            const buttonTop = modalTop + modalHeight + 20; // 20px below the modal

            closeButtonRef.current.style.top = `${buttonTop}px`;
        }
    }, [isModalOpen, selectedDatePosts]);

    const getFormattedDate = (date: Date | null) => {
        if (!date) return '';
        return format(date, "EEEE - MMMM do, yyyy");
    };

    const truncateHtmlContent = (html: string, maxLength: number): string => {
        const sanitizedHtml = DOMPurify.sanitize(html);
        const div = document.createElement('div');
        div.innerHTML = sanitizedHtml;
        const textContent = div.textContent || div.innerText || '';
        return textContent.length > maxLength
            ? textContent.substring(0, maxLength) + '...'
            : textContent;
    };

    return (
        <div className="flex-grow flex justify-center items-center relative">
            <div className="w-full h-full p-4">

                <div className="bg-gray-700 shadow-lg rounded-lg p-4 h-full relative">
                    <h1 className="text-3xl font-bold mb-4 text-white">Blog Post Calendar</h1>

                    <div className="absolute top-4 right-4">
                        <TagsSection
                            tags={tags}
                            selectedTags={selectedTags}
                            handleTagSelection={handleTagSelection}
                        />
                    </div>
                    {loadingPosts ? (
                        <div className="flex justify-center items-center mt-6">
                            <div
                                className="loader border-t-4 border-b-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <Calendar
                            tileContent={tileContent}
                            defaultView="month"
                            className="react-calendar custom-calendar border"
                            onClickDay={handleDayClick}
                            onActiveStartDateChange={handleActiveStartDateChange}
                        />
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                    <div ref={modalRef} className="modal-container bg-gray-300 text-black p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {getFormattedDate(selectedDate)}
                        </h2>
                        {selectedDatePosts.length > 0 ? (
                            <ul className="space-y-4">
                                {selectedDatePosts.map(post => (
                                    <li key={post.id} className="mb-4 p-4 border rounded bg-gray-800 text-white">
                                        <p className="text-sm text-gray-500">{format(new Date(post.created_at), "MMMM do, yyyy 'at' h:mm a")}</p>
                                        <p className="text-2xl font-bold text-stone-400 ">{post.title}</p>

                                        <div className="text-white">
                                            {truncateHtmlContent(post.content, 100)}
                                        </div>
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="mt-2">
                                                <ul className="flex flex-wrap gap-2 mt-1">
                                                    {post.tags.map(tag => (
                                                        <li key={tag.id} className="px-2 py-1 rounded" style={{
                                                            backgroundColor: tag.tag_type.color,
                                                            color: 'white'
                                                        }}>
                                                            {tag.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <div style={{marginTop: '10px'}} className="flex flex-wrap gap-2">
                                            <Link href={`/posts/${post.id}`} className="text-blue-300 hover:underline">Read
                                                more</Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col justify-center">
                                <p className="text-center mb-4">No Blog Posts for this Date.</p>
                                <Link href={`/posts/new?date=${selectedDate?.toISOString()}`}
                                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
                                      style={{width: "173px", margin: "auto"}}
                                >
                                    + Create Post
                                </Link>
                            </div>
                        )}
                    </div>
                    <button
                        ref={closeButtonRef}
                        onClick={closeModal}
                        className="modal-close-button text-white bg-blue-500 px-4 py-2 rounded mt-4"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
