"use client";

import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import { fetchPosts, fetchTags } from '@/lib/api';
import Link from 'next/link';
import { Post, Tag } from '@/lib/types';
import { isSameDay, parseISO, getYear, getMonth } from 'date-fns';

type Value = Date | [Date, Date] | null;

const CalendarView: React.FC<CalendarProps> = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [date, setDate] = useState<Date>(new Date());
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

    useEffect(() => {
        async function loadTags() {
            try {
                const tags = await fetchTags();
                setTags(tags);
            } catch (error) {
                console.error('Failed to load tags:', error);
            }
        }
        loadTags();
    }, []);

    useEffect(() => {
        async function getPosts() {
            try {
                const year = getYear(date);
                const month = getMonth(date) + 1; // getMonth returns 0-indexed month
                const data = await fetchPosts(year, month, 1, 100); // Fetch all posts for the month
                if (Array.isArray(data.posts)) {
                    setPosts(data.posts);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                setPosts([]);
            }
        }
        getPosts();
    }, [date]);

    useEffect(() => {
        // Filter posts based on selected tags
        if (selectedTags.length > 0) {
            const filtered = posts.filter(post =>
                post.tags.some(tag => selectedTags.includes(tag.name))
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

    const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date }) => {
        setDate(activeStartDate);
    };

    const handleTagSelection = (tag: string) => {
        setSelectedTags((prevSelectedTags) =>
            prevSelectedTags.includes(tag)
                ? prevSelectedTags.filter((t) => t !== tag)
                : [...prevSelectedTags, tag]
        );
    };

    return (
        <div className="flex-grow flex justify-center items-center">
            <div className="w-full h-full p-4">
                <h1 className="text-3xl font-bold mb-4 text-center text-white">Blog Post Calendar</h1>
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2 text-white">Filter by Tags</h2>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <div key={tag.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={tag.name}
                                    value={tag.name}
                                    checked={selectedTags.includes(tag.name)}
                                    onChange={() => handleTagSelection(tag.name)}
                                    className="mr-2"
                                />
                                <label htmlFor={tag.name} className="px-2 py-1 rounded" style={{ backgroundColor: tag.tag_type.color, color: 'white' }}>
                                    {tag.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-900 shadow-lg rounded-lg p-4 h-full">
                    <Calendar
                        tileContent={tileContent}
                        defaultView="month"
                        className="react-calendar custom-calendar"
                        // @ts-ignore
                        onActiveStartDateChange={handleActiveStartDateChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
