"use client";

import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import { fetchPosts } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { isSameDay, parseISO, getYear, getMonth } from 'date-fns';

type Value = Date | [Date, Date] | null;

const CalendarView: React.FC<CalendarProps> = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [date, setDate] = useState<Date>(new Date());

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

    const getPostsForDay = (date: Date) => {
        return posts.filter(post => isSameDay(parseISO(post.created_at), date));
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

    return (
        <div className="flex-grow flex justify-center items-center">
            <div className="w-full h-full p-4">
                <h1 className="text-3xl font-bold mb-4 text-center text-white">Blog Post Calendar</h1>
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
