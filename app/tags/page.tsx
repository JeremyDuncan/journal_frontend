"use client";

import React, { useState, useEffect } from 'react';
import { fetchTags, fetchTagTypes, createTag, createTagType, deleteTag, deleteTagType, updateTagTypeColor } from '@/lib/api';
import { Tag, TagType } from '@/lib/types';
import { HexColorPicker } from 'react-colorful';
import { FaPalette } from 'react-icons/fa';

const TagsPage: React.FC = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [tagTypes, setTagTypes] = useState<TagType[]>([]);
    const [newTagName, setNewTagName] = useState<string>('');
    const [selectedTagType, setSelectedTagType] = useState<string>('default');
    const [newTagTypeName, setNewTagTypeName] = useState<string>('');
    const [newTagTypeColor, setNewTagTypeColor] = useState<string>('#0000ff'); // Default to blue color
    const [error, setError] = useState<string | null>(null);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);
    const [editingTagType, setEditingTagType] = useState<TagType | null>(null);
    const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
    const [tagTypeToDelete, setTagTypeToDelete] = useState<TagType | null>(null);

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
        loadTags().catch(error => console.error('Promise returned from loadTags is ignored', error));
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
        console.log('Creating tag type with name:', newTagTypeName, 'and color:', newTagTypeColor);
        if (!newTagTypeName.trim()) {
            setError('Tag type name cannot be empty');
            return;
        }

        try {
            const newTagType = await createTagType(newTagTypeName, newTagTypeColor);
            setTagTypes([...tagTypes, newTagType]);
            setNewTagTypeName('');
            setNewTagTypeColor('#0000ff'); // Reset to default blue color
            setError(null);
        } catch (error) {
            console.error('Failed to create tag type:', error);
            setError('Failed to create tag type. It might already exist.');
        }
    };

    const confirmDeleteTag = (tag: Tag) => {
        setTagToDelete(tag);
    };

    const handleDeleteTag = async () => {
        if (!tagToDelete) return;
        console.log('Deleting tag with ID:', tagToDelete.id);
        try {
            await deleteTag(tagToDelete.id);
            setTags(tags.filter(tag => tag.id !== tagToDelete.id));
            setTagToDelete(null);
            setError(null);
        } catch (error) {
            console.error('Failed to delete tag:', error);
            setError('Failed to delete tag. It might be associated with other resources.');
        }
    };

    const confirmDeleteTagType = (tagType: TagType) => {
        setTagTypeToDelete(tagType);
    };

    const handleDeleteTagType = async () => {
        if (!tagTypeToDelete) return;
        console.log('Deleting tag type with ID:', tagTypeToDelete.id);
        try {
            await deleteTagType(tagTypeToDelete.id);
            setTagTypes(tagTypes.filter(tagType => tagType.id !== tagTypeToDelete.id));
            setTagTypeToDelete(null);
            setError(null);
        } catch (error) {
            console.error('Failed to delete tag type:', error);
            setError('Failed to delete tag type. It might be associated with existing tags.');
        }
    };

    const openColorPickerModalForExistingTagType = (tagType: TagType) => {
        setEditingTagType(tagType);
        setNewTagTypeColor(tagType.color);
        setIsColorPickerOpen(true);
    };

    const openColorPickerModalForNewTagType = () => {
        setEditingTagType(null);
        setNewTagTypeColor('#0000ff'); // Reset to default blue color
        setIsColorPickerOpen(true);
    };

    const handleColorSelection = async () => {
        if (editingTagType) {
            try {
                await updateTagTypeColor(editingTagType.id, newTagTypeColor);
                setTagTypes(tagTypes.map(tagType => tagType.id === editingTagType.id ? { ...tagType, color: newTagTypeColor } : tagType));
                closeColorPickerModal();
            } catch (error) {
                console.error('Failed to update tag type color:', error);
                setError('Failed to update tag type color.');
            }
        } else {
            // Handle color selection for new tag type creation
            closeColorPickerModal();
        }
    };

    const closeModal = () => {
        setError(null);
    };

    const closeColorPickerModal = () => {
        setIsColorPickerOpen(false);
        setEditingTagType(null);
    };

    const closeDeleteTagModal = () => {
        setTagToDelete(null);
    };

    const closeDeleteTagTypeModal = () => {
        setTagTypeToDelete(null);
    };

    return (
        <div className="container mx-auto p-4">
            <br />
            <div className={"border tag-box bg-gray-800"}>
                <h2 className="text-3xl font-bold mb-4 text-red">Tags</h2>
                <div className="flex flex-col space-y-4 bg-gray-700 tag-box">

                    {tagTypes.filter(tagType => tags.some(tag => tag.tag_type.id === tagType.id)).map(tagType => (
                        <div key={tagType.id} className="bg-gray-600 p-2 rounded mb-2">
                            <h3 className="text-xl font-bold mb-2" style={{ color: tagType.color }}>{tagType.name}</h3>
                            {tags.filter(tag => tag.tag_type.id === tagType.id).map(tag => (
                                <div key={tag.id} className=" border-b pb-2 flex justify-between items-center mb-2">
                                    <div className="flex items-center">
                                        <span className="text-xl">{tag.name}</span>
                                    </div>
                                    <button
                                        onClick={() => confirmDeleteTag(tag)}
                                        className="bg-red-500 text-white p-2 ml-2 mr-2"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <br />

            <div className={"border tag-box bg-gray-800"}>
                <h2 className="text-3xl font-bold mb-4">Tag Types</h2>
                <div className="flex flex-col bg-gray-600 tag-box">
                    {tagTypes.map((tagType) => (
                        <div key={tagType.id} className="border-b pb-2 flex justify-between items-center no-round">
                            <span
                                className="inline-block w-6 h-6 rounded cursor-pointer mr-4"
                                style={{backgroundColor: tagType.color}}
                                onClick={() => openColorPickerModalForExistingTagType(tagType)}
                            ></span>
                            <span className="text-xl flex-grow">{tagType.name}</span>
                            <button
                                onClick={() => confirmDeleteTagType(tagType)}
                                className="bg-red-500 text-white p-2 ml-2"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>


            {/*################################## CREATE TAGS AND TYPES #############################################*/}
            <div className="mt-16 border tag-create-box bg-gray-800 p-4 rounded">
                <h2 className="text-xl font-bold mb-4 text-white">Create Tags and Tag Types</h2>
                <div className="flex flex-col bg-gray-600 tag-box ">
                    <div className="flex flex-wrap items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Tag type name"
                            value={newTagTypeName}
                            onChange={(e) => setNewTagTypeName(e.target.value)}
                            className="border p-2 rounded text-black flex-grow"
                        />
                        <div className="border p-2 rounded bg-gray-100 flex items-center">
                            <FaPalette
                                size={24}
                                className="cursor-pointer"
                                onClick={openColorPickerModalForNewTagType}
                                style={{ color: newTagTypeColor }}
                            />
                        </div>
                        <button onClick={handleCreateTagType} className="bg-green-500 text-white p-2 rounded">
                            Create Tag Type
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Tag name"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="border p-2 rounded text-black flex-grow"
                        />
                        <select
                            value={selectedTagType}
                            onChange={(e) => setSelectedTagType(e.target.value)}
                            className="border p-2 rounded text-black flex-grow"
                        >
                            <option value="default">Select Tag Type</option>
                            {tagTypes.map((type) => (
                                <option key={type.id} value={type.name}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleCreateTag} className="bg-blue-500 text-white p-2 rounded">
                            Create Tag
                        </button>
                    </div>
                </div>
            </div>

            {isColorPickerOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Select Color</h2>
                        <HexColorPicker color={newTagTypeColor} onChange={setNewTagTypeColor} />
                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                onClick={handleColorSelection}
                                className="bg-blue-500 text-white p-2 rounded"
                            >
                                OK
                            </button>
                            <button
                                onClick={closeColorPickerModal}
                                className="bg-gray-500 text-white p-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {tagToDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-black">Confirm Delete</h2>
                        <p className="text-black">Are you sure you want to delete the tag <strong>{tagToDelete.name}</strong>?</p>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                onClick={handleDeleteTag}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                Delete
                            </button>
                            <button
                                onClick={closeDeleteTagModal}
                                className="bg-gray-500 text-white p-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {tagTypeToDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-black">Confirm Delete</h2>
                        <p className="text-black">Are you sure you want to delete the tag type <strong>{tagTypeToDelete.name}</strong>?</p>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                onClick={handleDeleteTagType}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                Delete
                            </button>
                            <button
                                onClick={closeDeleteTagTypeModal}
                                className="bg-gray-500 text-white p-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-black">Error</h2>
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
