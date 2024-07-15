import React, { useState } from 'react';
import { Tag } from '@/lib/types';
import { FiFilter } from 'react-icons/fi';

interface TagsSectionProps {
    tags: Tag[];
    selectedTags: string[];
    handleTagSelection: (tag: string) => void;
}

const TagsSection: React.FC<TagsSectionProps> = ({ tags, selectedTags, handleTagSelection }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    // Group tags by their tag type
    const groupedTags = tags.reduce((acc, tag) => {
        const { tag_type } = tag;
        if (!acc[tag_type.name]) {
            acc[tag_type.name] = [];
        }
        acc[tag_type.name].push(tag);
        return acc;
    }, {} as { [key: string]: Tag[] });

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div>
            <div
                className="relative inline-block"
                onMouseEnter={() => setIsTooltipVisible(true)}
                onMouseLeave={() => setIsTooltipVisible(false)}
            >
                <button
                    onClick={toggleModal}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    aria-label="Filter calendar by tags"
                >
                    <FiFilter size={24} />
                </button>
                {isTooltipVisible && (
                    <span className="tooltip-text bg-gray-800 text-white rounded p-2 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-90 transition-opacity duration-300 pointer-events-none">
                        Filter by tags
                    </span>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 overflow-y-auto z-50">
                    <div className="tag-modal-container bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 my-8 relative">
                        <h2 className="text-2xl text-white font-bold mb-4 text-center">
                            Tag Filter
                        </h2>
                        <div className="flex flex-col space-y-4">
                            {Object.keys(groupedTags).map((tagTypeName) => (
                                <div key={tagTypeName} className="mb-4">
                                    <div className="flex flex-col flex-wrap">
                                        <div style={{ width: '100%' }}>
                                            <h2 className="text-l font-bold mb-2 text-stone-100"
                                                style={{
                                                    textShadow: `2px 2px 0 ${groupedTags[tagTypeName][0].tag_type.color}, 2px -2px 0 ${groupedTags[tagTypeName][0].tag_type.color}, -2px 2px 0 ${groupedTags[tagTypeName][0].tag_type.color}, -2px -2px 0 ${groupedTags[tagTypeName][0].tag_type.color}, 2px 0px 0 ${groupedTags[tagTypeName][0].tag_type.color}, 0px 2px 0 ${groupedTags[tagTypeName][0].tag_type.color}, -2px 0px 0 ${groupedTags[tagTypeName][0].tag_type.color}, 0px -2px 0 ${groupedTags[tagTypeName][0].tag_type.color}, 2px 2px 2px rgba(52,206,106,0.66)`
                                                }}>
                                                {tagTypeName}
                                            </h2>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {groupedTags[tagTypeName].map((tag) => (
                                                <div key={tag.id} className="flex items-center mb-2">
                                                    <input
                                                        type="checkbox"
                                                        id={tag.name}
                                                        value={tag.name}
                                                        checked={selectedTags.includes(tag.name)}
                                                        onChange={() => handleTagSelection(tag.name)}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor={tag.name} className="px-2 py-1 rounded text-sm"
                                                           style={{ backgroundColor: tag.tag_type.color, color: 'white' }}>
                                                        {tag.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={toggleModal}
                            className="modal-close-button absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagsSection;
