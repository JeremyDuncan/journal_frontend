"use client";

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="bg-gray-800 text-white p-4 sticky top-0 z-50">
            <nav className="container mx-auto flex justify-between items-center">
                <ul className="flex space-x-4">
                    <li><Link href={"/"} className="hover:text-gray-400">Home</Link></li>
                    {session && (
                        <>
                            <li><Link href={"/calendar"} className="hover:text-gray-400">Calendar</Link></li>
                            <li><Link href={"/search"} className="hover:text-gray-400">Search</Link></li>
                            <li><Link href={"/tags"} className="hover:text-gray-400">Tags</Link></li>
                        </>
                    )}
                </ul>
                <div className="flex items-center space-x-4">
                    {session ? (
                        <>
                            <Link
                                href={"/posts/new"}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                + Post
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            href={"/login"}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
