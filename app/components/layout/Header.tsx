"use client";

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ExportWordButton from '../../components/ExportAllPostsButton';
import {Tooltip} from "react-tooltip";
import { FaPenSquare, FaHome, FaCalendarAlt, FaSearch, FaTags } from "react-icons/fa";


const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="bg-gray-800 text-white p-4 sticky top-0 z-50">
            <nav className="container mx-auto flex justify-between items-center">
                <ul className="flex space-x-4">
                    {session ? (
                        <>
                            <li>
                                <Link
                                    href={"/"}
                                    className="hover:text-gray-400 flex gap-1">
                                    <div className="icon-margin">
                                        <FaHome />
                                    </div>
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href={"/calendar"}
                                    className="hover:text-gray-400 flex gap-1">
                                    <div className="icon-margin">
                                        <FaCalendarAlt/>
                                    </div>
                                    Calendar
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href={"/search"}
                                    className="hover:text-gray-400 flex gap-1">
                                    <div className="icon-margin">
                                        <FaSearch/>
                                    </div>
                                    Search
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href={"/tags"}
                                    className="hover:text-gray-400 flex gap-1">
                                    <div className="icon-margin">
                                        <FaTags/>
                                    </div>
                                    Tags
                                </Link>
                            </li>

                        </>
                    ) : (
                        <h1 className="text-2xl">Kasey's Journal</h1>
                    )}
                </ul>
                <div className="flex items-center space-x-4">
                    {session ? (
                        <>
                            <Link
                                href={"/posts/new"}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded icon-btn text-2xl"
                                data-tooltip-id="downloadTooltip"
                                data-tooltip-content="Create a New Journal Entry"
                            >
                                <FaPenSquare />
                            </Link>
                            <Tooltip id="newPostTooltip"/>
                            <ExportWordButton/>

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
