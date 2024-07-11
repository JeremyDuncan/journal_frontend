"use client";

import React, { useState, useEffect } from 'react';
import { fetchTags, fetchTagTypes, createTag, createTagType, deleteTag, deleteTagType } from '@/lib/api';
import { Tag, TagType } from '@/lib/types';

const TagsPage: React.FC = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [tagTypes, setTagTypes] = useState<TagType[]>([]);
    const [newTagName, setNewTagName] = useState<string>('');
    const [selectedTagType, setSelectedTagType] = useState<string>('default');
    const [newTagTypeName, setNewTagTypeName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTags() {
            try {
                const tags = await fetchTags();
                setTags(tags);
                const tagTypes = await fetchTagTypes();
                setTagTypes(tagTypes);
            } catch (error) {
                console.error('Failed to load tags or tag types:', error);
                setError('Failed to load tags or tag types.');
            }
        }
        loadTags();
    }, []);

    const handleCreateTag = async () => {
        console.log('Creating tag with name:', newTagName, 'and type:', selectedTagType);
        if (!newTagName.trim()) {
            setError('Tag name cannot be empty');
            return;
        }

        try {
            const newTag = await createTag(newTagName, selectedTagType);
            setTags([...tags, newTag]);
            setNewTagName('');
            setSelectedTagType('default');
            setError(null);
        } catch (error) {
            console.error('Failed to create tag:', error);
            setError('Failed to create tag. It might already exist.');
        }
    };

    const handleCreateTagType = async () => {
        console.log('Creating tag type with name:', newTagTypeName);
        if (!newTagTypeName.trim()) {
            setError('Tag type name cannot be empty');
            return;
        }

        try {
            const newTagType = await createTagType(newTagTypeName);
            setTagTypes([...tagTypes, newTagType]);
            setNewTagTypeName('');
            setError(null);
        } catch (error) {
            console.error('Failed to create tag type:', error);
            setError('Failed to create tag type. It might already exist.');
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        console.log('Deleting tag with ID:', tagId);
        try {
            await deleteTag(tagId);
            setTags(tags.filter(tag => tag.id !== tagId));
            setError(null);
        } catch (error) {
            console.error('Failed to delete tag:', error);
            setError('Failed to delete tag. It might be associated with other resources.');
        }
    };

    const handleDeleteTagType = async (tagTypeId: number) => {
        console.log('Deleting tag type with ID:', tagTypeId);
        try {
            await deleteTagType(tagTypeId);
            setTagTypes(tagTypes.filter(tagType => tagType.id !== tagTypeId));
            setError(null);
        } catch (error) {
            console.error('Failed to delete tag type:', error);
            setError('Failed to delete tag type. It might be associated with existing tags.');
        }
    };

    const closeModal = () => {
        setError(null);
    };

    return (
        <div className="container mx-auto p-4">
            <br/>
            <div className={"tag-box bg-gray-500"}>
                <h2 className="text-3xl font-bold mb-4 text-red">Tags</h2>
                <div className="flex flex-col space-y-4 bg-gray-400 tag-box">
                    {tags.map((tag) => (
                        <div key={tag.id} className="border-b pb-2 flex justify-between items-center no-round">
                            <div className="flex-grow flex justify-between items-center ">
                                <span className="text-xl">{tag.name}</span>
                                <span className="text-gray-500 ml-4">{tag.tag_type.name}</span>
                            </div>
                            <button
                                onClick={() => handleDeleteTag(tag.id)}
                                className="bg-red-500 text-white p-2 ml-2"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <br/>
            <div className={"tag-box bg-gray-500"}>
                <h2 className="text-3xl font-bold mb-4">Tag Types</h2>
                <div className="flex flex-col bg-gray-400 tag-box">
                    {tagTypes.map((tagType) => (
                        <div key={tagType.id} className="border-b pb-2 flex justify-between items-center no-round">
                            <span className="text-xl flex-grow">{tagType.name}</span>
                            <button
                                onClick={() => handleDeleteTagType(tagType.id)}
                                className="bg-red-500 text-white p-2 ml-2"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>


            {/*################################## CREATE TAGS AND TYPES #############################################*/}
            <div className="mt-16  border-t tag-create-box bg-gray-800">
                <p className="text-xl text-center"> Create Tags and Tag Types</p>
                <div className="flex flex-row mt-2 gap-8 justify-center">
                    <div>
                        <input
                            type="text"
                            placeholder="Tag name"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="border p-2 mr-2 text-black"
                        />
                        <select
                            value={selectedTagType}
                            onChange={(e) => setSelectedTagType(e.target.value)}
                            className="border p-2 mr-2 text-black"
                        >
                            {tagTypes.map((type) => (
                                <option key={type.id} value={type.name}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleCreateTag} className="bg-blue-500 text-white p-2">
                            Create Tag
                        </button>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Tag type name"
                            value={newTagTypeName}
                            onChange={(e) => setNewTagTypeName(e.target.value)}
                            className="border p-2 mr-2 text-black"
                        />
                        <button onClick={handleCreateTagType} className="bg-green-500 text-white p-2">
                            Create Tag Type
                        </button>
                    </div>
                </div>
            </div>


            {error && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Error</h2>
                        <p className="text-black">{error}</p>
                        <button onClick={closeModal} className="mt-4 bg-blue-500 text-white p-2 rounded">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagsPage;
