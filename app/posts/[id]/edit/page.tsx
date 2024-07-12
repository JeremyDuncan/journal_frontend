"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { fetchPost, fetchTags, fetchTagTypes, updatePost, createTag } from '@/lib/api';

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

export default function EditPost() {
    const { id } = useParams();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [existingTags, setExistingTags] = useState<any[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newTags, setNewTags] = useState<{ name: string; tagType?: string }[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [newTagType, setNewTagType] = useState('');
    const [tagTypes, setTagTypes] = useState<any[]>([]);
    const [selectedTagType, setSelectedTagType] = useState('');

    useEffect(() => {
        async function fetchPostData() {
            try {
                const post = await fetchPost(id as string);
                setTitle(post.title);
                setContent(post.content);
                setSelectedTags(post.tags.map((tag: any) => tag.name));
            } catch (error) {
                console.error('Failed to fetch post:', error);
            }
        }

        async function fetchTagsData() {
            try {
                const tags = await fetchTags();
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

        fetchPostData();
        fetchTagsData();
        fetchTagTypesData();
    }, [id]);

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
                await createTag(newTag.name, newTag.tagType);
            }

            // Fetch updated tags to ensure they are associated with the post
            const updatedTags = await fetchTags();

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags: [
                        ...selectedTags,
                        ...newTags.map((tag) => tag.name)
                    ].filter(tag => updatedTags.some(t => t.name === tag))
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update post');
            }

            const post = await res.json();
            router.push(`/posts/${post.id}`);
        } catch (error) {
            console.error('Failed to update post:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-white">Edit Blog Post</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
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
                </div>
                <div className="mb-4">
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
                </div>
                <div className="mb-4">
                    <label className="block text-white text-sm font-bold mb-2">
                        Select Existing Tags
                    </label>
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
                                <label htmlFor={tag.name} className="px-2 py-1 rounded" style={{ backgroundColor: tag.tag_type.color, color: 'white' }}>
                                    {tag.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 ">
                    <div className="mb-4 w-fifty-percent">
                        <label className="block text-white text-sm font-bold mb-2" htmlFor="newTagName">
                            New Tag Name
                        </label>
                        <input
                            id="newTagName"
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <div className="mb-4 w-fifty-percent">
                        <label className="block text-white text-sm font-bold mb-2" htmlFor="tagTypeDropdown">
                            Select Tag Type
                        </label>
                        <select
                            id="tagTypeDropdown"
                            value={selectedTagType}
                            onChange={(e) => setSelectedTagType(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                        >
                            {tagTypes.map((type) => (
                                <option key={type.id} value={type.name}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-col vert-center mt-3">
                        <button
                            type="button"
                            onClick={handleAddNewTag}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline h-auto"
                        >
                            Add Tag
                        </button>
                    </div>

                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                >
                    Update Post
                </button>
            </form>
            <div className="mt-4">
                <h2 className="text-2xl font-bold text-white mb-4">New Tags</h2>
                <ul className="list-disc list-inside text-white">
                    {newTags.map((tag, index) => (
                        <li key={index}>{tag.name} {tag.tagType && `(${tag.tagType})`}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
