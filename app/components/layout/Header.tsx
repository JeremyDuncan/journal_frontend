import React from 'react';
import Link from 'next/link';

const Header = () => {
    return (
        <header className="bg-gray-800 text-white p-4 sticky top-0 z-50">
            <nav className="container mx-auto flex justify-between items-center">
                <ul className="flex space-x-4">
                    <li><Link href={"/"} className="hover:text-gray-400">Home</Link></li>
                    <li><Link href={"/calendar"} className="hover:text-gray-400">Calendar</Link></li>
                </ul>
                <Link
                    href={"/posts/new"}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    + Post
                </Link>
            </nav>
        </header>
    );
};

export default Header;
