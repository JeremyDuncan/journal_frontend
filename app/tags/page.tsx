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

    useEffect(() => {
        async function loadTags() {
            try {
                const tags = await fetchTags();
                setTags(tags);
                const tagTypes = await fetchTagTypes();
                setTagTypes(tagTypes);
            } catch (error) {
                console.error('Failed to load tags or tag types:', error);
            }
        }
        loadTags();
    }, []);

    const handleCreateTag = async () => {
        console.log('Creating tag with name:', newTagName, 'and type:', selectedTagType);
        if (!newTagName.trim()) {
            console.error('Tag name cannot be empty');
            return;
        }

        try {
            const newTag = await createTag(newTagName, selectedTagType);
            setTags([...tags, newTag]);
            setNewTagName('');
            setSelectedTagType('default');
        } catch (error) {
            console.error('Failed to create tag:', error);
        }
    };

    const handleCreateTagType = async () => {
        console.log('Creating tag type with name:', newTagTypeName);
        if (!newTagTypeName.trim()) {
            console.error('Tag type name cannot be empty');
            return;
        }

        try {
            const newTagType = await createTagType(newTagTypeName);
            setTagTypes([...tagTypes, newTagType]);
            setNewTagTypeName('');
        } catch (error) {
            console.error('Failed to create tag type:', error);
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        console.log('Deleting tag with ID:', tagId);
        try {
            await deleteTag(tagId);
            setTags(tags.filter(tag => tag.id !== tagId));
        } catch (error) {
            console.error('Failed to delete tag:', error);
        }
    };

    const handleDeleteTagType = async (tagTypeId: number) => {
        console.log('Deleting tag type with ID:', tagTypeId);
        try {
            await deleteTagType(tagTypeId);
            setTagTypes(tagTypes.filter(tagType => tagType.id !== tagTypeId));
        } catch (error) {
            console.error('Failed to delete tag type:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8">Tags</h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="border p-2 mr-2"
                />
                <select
                    value={selectedTagType}
                    onChange={(e) => setSelectedTagType(e.target.value)}
                    className="border p-2 mr-2"
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
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Tag type name"
                    value={newTagTypeName}
                    onChange={(e) => setNewTagTypeName(e.target.value)}
                    className="border p-2 mr-2"
                />
                <button onClick={handleCreateTagType} className="bg-green-500 text-white p-2">
                    Create Tag Type
                </button>
            </div>
            <ul className="space-y-4">
                {tags.map((tag) => (
                    <li key={tag.id} className="border-b pb-2 flex justify-between items-center">
                        <span className="text-xl">{tag.name}</span>
                        <span className="text-gray-500">{tag.tag_type.name}</span>
                        <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="bg-red-500 text-white p-2 ml-2"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            <h2 className="text-3xl font-bold mt-8 mb-4">Tag Types</h2>
            <ul className="space-y-4">
                {tagTypes.map((tagType) => (
                    <li key={tagType.id} className="border-b pb-2 flex justify-between items-center">
                        <span className="text-xl">{tagType.name}</span>
                        <button
                            onClick={() => handleDeleteTagType(tagType.id)}
                            className="bg-red-500 text-white p-2 ml-2"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TagsPage;
