"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { fetchTags, fetchTagTypes, createTag } from '@/lib/api';
import { Tag } from '@/lib/types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiInfo } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_KEY) {
    throw new Error('API_KEY is not defined in environment variables');
}
if (!API_URL) {
    throw new Error('API_URL is not defined in environment variables');
}

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        ['clean']
    ],
    clipboard: {
        matchVisual: false,
    }
};

const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline',
    'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
];

export default function NewPost() {
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [existingTags, setExistingTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newTags, setNewTags] = useState<{ name: string; tagType?: string }[]>([]);
    const [newTagName, setNewTagName] = useState<string>('');
    const [newTagType, setNewTagType] = useState<string>('');
    const [tagTypes, setTagTypes] = useState<{ id: string; name: string }[]>([]);
    const [selectedTagType, setSelectedTagType] = useState<string>('');
    const [createdAt, setCreatedAt] = useState<Date | null>(new Date());
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        async function fetchTagsData() {
            try {
                const tags: Tag[] = await fetchTags();
                setExistingTags(tags);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        }

        async function fetchTagTypesData() {
            try {
                const tagTypes = await fetchTagTypes();
                setTagTypes(tagTypes);
            } catch (error) {
                console.error('Failed to fetch tag types:', error);
            }
        }

        fetchTagsData().then(r => console.log("Tag Data Fetched", r));
        fetchTagTypesData().then(r => console.log("Tag Types Fetched", r));
    }, []);

    useEffect(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            setCreatedAt(new Date(dateParam));
            setShowDatePicker(true); // Automatically show the date picker if a date is passed
        }
    }, [searchParams]);

    const handleTagSelection = (tag: string) => {
        setSelectedTags((prevSelectedTags) =>
            prevSelectedTags.includes(tag)
                ? prevSelectedTags.filter((t) => t !== tag)
                : [...prevSelectedTags, tag]
        );
    };

    const handleAddNewTag = () => {
        if (newTagName.trim()) {
            setNewTags([...newTags, { name: newTagName, tagType: selectedTagType || newTagType }]);
            setNewTagName('');
            setNewTagType('');
            setSelectedTagType('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Create new tags if any
            for (const newTag of newTags) {
                await createTag(newTag.name, newTag.tagType || ''); // Ensure tagType is a string
            }

            // Fetch updated tags to ensure they are associated with the post
            const updatedTags: Tag[] = await fetchTags();

            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': API_KEY as string,
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags: [
                        ...selectedTags,
                        ...newTags.map((tag) => tag.name)
                    ].filter(tag => updatedTags.some((t: Tag) => t.name === tag)),
                    created_at: createdAt?.toISOString() || new Date().toISOString() // Save the created_at time
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to create post');
            }

            const post = await res.json();
            router.push(`/posts/${post.id}`);
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    return (
        <div className="container mx-auto p-4 bg-gray-700 mt-4 mb-4 rounded">
            <h1 className="text-4xl font-bold mb-8 text-white">Create New Journal Entry</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4 p-4 border rounded bg-gray-800 text-white relative">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="title">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                    <FiInfo
                        data-tooltip-id="titleTooltip"
                        data-tooltip-content="Enter the title of your journal entry"
                        className="absolute top-2 right-2 text-white"
                    />
                    <Tooltip id="titleTooltip" />
                </div>
                <div className="mb-4 p-4 border rounded bg-gray-800 text-white relative">
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="content">
                        Content
                    </label>
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        className="bg-white text-black"
                    />
                    <FiInfo
                        data-tooltip-id="contentTooltip"
                        data-tooltip-content="Write your content here"
                        className="absolute top-2 right-2 text-white"
                    />
                    <Tooltip id="contentTooltip" />
                </div>
                <div className="mb-4 p-4 border rounded bg-gray-800 text-white relative">
                    <label className="block text-white text-sm font-bold mb-2">
                        Select Existing Tags
                        <FiInfo
                            data-tooltip-id="existingTagsTooltip"
                            data-tooltip-content="Select tags to associate with your journal entry"
                            className="inline-block ml-2 text-white"
                        />
                    </label>
                    <Tooltip id="existingTagsTooltip" />
                    <div className="flex flex-wrap gap-2">
                        {existingTags.map((tag) => (
                            <div key={tag.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={tag.name}
                                    value={tag.name}
                                    checked={selectedTags.includes(tag.name)}
                                    onChange={() => handleTagSelection(tag.name)}
                                    className="mr-2"
                                />
                                <label
                                    htmlFor={tag.name}
                                    className="px-2 py-1 rounded"
                                    style={{ backgroundColor: tag.tag_type.color, color: 'white' }}>
                                    {tag.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mb-4 p-4 border rounded bg-gray-800 text-white relative flex flex-wrap gap-2">
                    <div className="flex flex-col">
                        <label className="block text-white text-sm font-bold mb-2" htmlFor="newTagName">
                            New Tag Name
                            <FiInfo
                                data-tooltip-id="newTagNameTooltip"
                                data-tooltip-content="*Optional* Create new tags and add to existing tags"
                                className="inline-block ml-2 text-white"
                            />
                        </label>
                        <Tooltip id="newTagNameTooltip"/>
                        <input
                            id="newTagName"
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="block text-white text-sm font-bold mb-2" htmlFor="tagTypeDropdown">
                            Select Tag Type
                        </label>
                        <select
                            id="tagTypeDropdown"
                            value={selectedTagType}
                            onChange={(e) => setSelectedTagType(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="default">Select Tag Type</option>
                            {tagTypes.map((type) => (
                                <option key={type.id} value={type.name}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-white text-sm font-bold mb-2 opacity-0" htmlFor="tagTypeDropdown">
                            Select Tag Type
                        </label>
                        <button
                            type="button"
                            onClick={handleAddNewTag}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline custom-btn-height"
                        >
                            Add Tag
                        </button>
                    </div>

                    </div>
                    {newTags.length > 0 && (
                        <div className="mt-4 bg-gray-800 border p-2">
                            <h2 className="text-2xl font-bold text-white mb-4">New Tags</h2>
                            <div className="bg-gray-700 rounded p-4">
                                <ul className="list-disc font-bold list-inside text-stone-400">
                                    {newTags.map((tag, index) => (
                                        <li key={index}>{tag.name} {tag.tagType && `(${tag.tagType})`}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <div className="mb-4 p-4 border rounded bg-gray-800 text-white relative">
                        <label className="block text-white text-sm font-bold mb-2">
                            <input
                                type="checkbox"
                                checked={showDatePicker}
                                onChange={() => setShowDatePicker(!showDatePicker)}
                                className="mr-2"
                            />
                            Use different date other than today
                            <FiInfo
                                data-tooltip-id="dateTooltip"
                                data-tooltip-content="Change date of journal entry from today to different date"
                                className="inline-block ml-2 text-white"
                            />
                        </label>
                        <Tooltip id="dateTooltip"/>
                        {showDatePicker && (
                            <DatePicker
                                selected={createdAt}
                                onChange={(date: Date | null) => setCreatedAt(date)}
                                className="text-black p-2 rounded"
                                showTimeSelect
                                dateFormat="Pp"
                            />
                        )}
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                    >
                        Create Journal Entry
                    </button>
            </form>
        </div>
    );
}
