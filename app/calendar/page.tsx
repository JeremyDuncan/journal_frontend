'use client';

import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import { fetchPosts, fetchTags, fetchTagTypes } from '@/lib/api';
import Link from 'next/link';
import { Post, Tag } from '@/lib/types';
import { isSameDay, parseISO, getYear, getMonth, format } from 'date-fns';
import DOMPurify from "dompurify";
import { FaCalendarAlt, FaFilter } from "react-icons/fa";
import { FiInfo } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import { AiOutlineClose } from 'react-icons/ai';

const CalendarView: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [date, setDate] = useState<Date>(new Date());
    const [tags, setTags] = useState<Tag[]>([]);
    const [tagTypes, setTagTypes] = useState<any[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const [selectedDatePosts, setSelectedDatePosts] = useState<Post[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [collapsedTags, setCollapsedTags] = useState<Record<string, boolean>>({});

    useEffect(() => {
        async function loadTags() {
            try {
                const tags = await fetchTags();
                setTags(tags);
                const initialCollapsedState = tags.reduce((acc: { [x: string]: boolean; }, tag: { tag_type: { name: string | number; }; }) => {
                    acc[tag.tag_type.name] = true; // Set all tag types to be collapsed initially
                    return acc;
                }, {} as Record<string, boolean>);
                setCollapsedTags(initialCollapsedState);
            } catch (error) {
                console.error('Failed to load tags:', error);
            }
        }

        async function loadTagTypes() {
            try {
                const tagTypes = await fetchTagTypes();
                setTagTypes(tagTypes);
            } catch (error) {
                console.error('Failed to load tag types:', error);
            }
        }

        loadTags();
        loadTagTypes();
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
        getPosts();
    }, [date]);

    useEffect(() => {
        // Filter posts based on selected tags
        if (selectedTags.length > 0) {
            const filtered = posts.filter(post =>
                post.tags.some((tag: Tag) => selectedTags.some(selectedTag => selectedTag.id === tag.id))
            );
            setFilteredPosts(filtered);
        } else {
            setFilteredPosts(posts);
        }
    }, [posts, selectedTags]);

    const getPostsForDay = (date: Date) => {
        return filteredPosts.filter(post => isSameDay(parseISO(post.created_at), date));
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
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

    const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
        if (activeStartDate) {
            setDate(activeStartDate);
        }
    };

    const handleTagSelection = (tag: Tag) => {
        setSelectedTags(prevSelectedTags =>
            prevSelectedTags.some(selectedTag => selectedTag.id === tag.id)
                ? prevSelectedTags.filter(t => t.id !== tag.id)
                : [...prevSelectedTags, tag]
        );
    };

    const handleRemoveTag = (tag: Tag) => {
        setSelectedTags(prevSelectedTags => prevSelectedTags.filter(t => t.id !== tag.id));
    };

    const handleToggleCollapse = (tagType: string) => {
        setCollapsedTags(prevState => ({
            ...prevState,
            [tagType]: !prevState[tagType]
        }));
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

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
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
        return format(date, 'EEEE - MMMM do, yyyy');
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

    const groupedTags = tags.reduce((acc, tag) => {
        if (!acc[tag.tag_type.name]) {
            acc[tag.tag_type.name] = [];
        }
        acc[tag.tag_type.name].push(tag);
        return acc;
    }, {} as Record<string, Tag[]>);

    return (
        <div className="flex-grow flex justify-center items-center relative">
            <div className="w-full h-full p-4">
                <div className="bg-gray-700 shadow-lg rounded-lg p-4 h-full relative">
                    <h1 className="text-3xl font-bold mb-4 text-white flex gap-2"><FaCalendarAlt />Journal Calendar</h1>
                    <div className="absolute top-4 right-4">
                        <FaFilter onClick={openFilterModal} className="text-white hover:text-gray-400 text-2xl cursor-pointer" />
                    </div>
                    {loadingPosts ? (
                        <div className="flex justify-center items-center mt-6">
                            <div className="loader border-t-4 border-b-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
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

            {isFilterModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                    <div className="relative">
                        <div ref={modalRef} className="modal-container bg-gray-300 text-black p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-4 text-center">Filter by Tags</h2>
                            <div className="mb-4 p-4 border rounded bg-gray-800 text-white relative">
                                <div className="block text-white text-sm font-bold mb-2">
                                    <h1>TAGS</h1>
                                    <FiInfo
                                        data-tooltip-id={`tagTooltip`}
                                        data-tooltip-content={`Select Tags to filter by on the calendar`}
                                        className="absolute top-2 right-2 text-white"
                                    />
                                    <Tooltip id={`tagTooltip`} />
                                </div>
                                {selectedTags.length > 0 && (
                                    <div className="mb-4 p-4 border rounded bg-gray-700 text-white relative">
                                        <h2 className="text-xl font-bold mb-2">Selected Tags</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTags.map((tag) => (
                                                <div className="flex gap-0">
                                                    <div key={tag.id} className="flex items-center bg-gray-600 px-2 py-1 rounded-l" style={{ backgroundColor: tag.tag_type.color }}>
                                                        <span>{tag.name}</span>
                                                    </div>
                                                    <div className="bg-gray-300 hover:bg-gray-800 cursor-pointer pl-0 pt-2 pr-2 rounded-r"
                                                         onClick={() => handleRemoveTag(tag)}
                                                    >
                                                        <AiOutlineClose
                                                            className="ml-2 text-red-500"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {Object.entries(groupedTags).map(([tagType, tags]) => (
                                    <div key={tagType} className="mb-2 p-4 pt-2 rounded bg-gray-700 text-white relative">
                                        <div
                                            className="flex items-center justify-between mb-2 border-b border-gray-600 cursor-pointer"
                                            onClick={() => handleToggleCollapse(tagType)}
                                        >
                                            <span
                                                className="mt-0 p-0"
                                                style={{ textShadow: `2px 2px 4px ${tags[0].tag_type.color}`, color: 'white' }}
                                            >
                                                {tagType}
                                            </span>
                                            <span>{collapsedTags[tagType] ? '▼' : '▲'}</span>
                                        </div>
                                        {!collapsedTags[tagType] && (
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag) => (
                                                    <div key={tag.id} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={tag.name}
                                                            value={tag.name}
                                                            checked={selectedTags.some((t) => t.id === tag.id)}
                                                            onChange={() => handleTagSelection(tag)}
                                                            className="mr-2"
                                                        />
                                                        <label
                                                            htmlFor={tag.name}
                                                            className="px-2 py-1 rounded"
                                                            style={{ backgroundColor: tag.tag_type.color, color: 'white' }}
                                                        >
                                                            {tag.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            ref={closeButtonRef}
                            onClick={closeFilterModal}
                            className="modal-close-button text-white bg-blue-500 px-4 py-2 rounded mt-4 absolute left-1/2 transform -translate-x-1/2"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

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
                                        <div style={{ marginTop: '10px' }} className="flex flex-wrap gap-2">
                                            <Link href={`/posts/${post.id}`} className="text-blue-300 hover:underline">Read
                                                more</Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col justify-center">
                                <p className="text-center mb-4">No Journal Entries for this Date.</p>
                                <Link href={`/posts/new?date=${selectedDate?.toISOString()}`}
                                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
                                      style={{ width: "323px", margin: "auto" }}
                                >
                                    + Create New Journal Entry
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
