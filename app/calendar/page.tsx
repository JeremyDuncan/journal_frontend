// app/calendar/CalendarView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import { fetchPosts } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { isSameDay, parseISO } from 'date-fns';

type Value = Date | [Date, Date] | null;

const CalendarView: React.FC<CalendarProps> = () => {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        async function getPosts() {
            try {
                const posts = await fetchPosts();
                setPosts(posts);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        }
        getPosts();
    }, []);

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

    return (
        <div className="flex-grow flex justify-center items-center">
            <div className="w-full h-full p-4">
                <h1 className="text-4xl font-bold mb-8 text-center text-white">Blog Post Calendar</h1>
                <div className="bg-gray-900 shadow-lg rounded-lg p-4 h-full">
                    <Calendar
                        tileContent={tileContent}
                        defaultView="month"
                        className="react-calendar custom-calendar"
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
