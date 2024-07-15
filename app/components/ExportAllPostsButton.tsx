"use client";

import React, { useState } from 'react';
import { fetchAllPosts } from '@/lib/api';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
// @ts-ignore
import { saveAs } from 'file-saver';
import { parse } from 'node-html-parser';
import { FaDownload } from 'react-icons/fa';
import {Tooltip} from "react-tooltip";



interface Post {
    title: string;
    tags: { name: string; tag_type: { color: string } }[];
    created_at: string;
    content: string;
}

const ExportAllPostsButton: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const generateWordDoc = async () => {
        setLoading(true);
        try {
            const posts: Post[] = await fetchAllPosts();

            // Ensure posts is an array
            if (!Array.isArray(posts)) {
                throw new Error('Fetched data is not an array');
            }

            const sections = posts.map(post => {
                const contentElements = parseContent(post.content);

                return {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: `Title: ${post.title}`, bold: true, size: 24 }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Tags: ", bold: true }),
                                ...post.tags.map(tag => new TextRun({ text: `${tag.name} `, bold: true, color: tag.tag_type.color || '000000' })),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: `Created At: ${new Date(post.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}`, bold: true }),
                            ],
                        }),
                        ...contentElements,
                        new Paragraph({ text: "", border: { bottom: { color: "000000", space: 1, size: 6, style: "single" } } }), // Spacer paragraph with border
                    ],
                };
            });

            // Merge all children into one section to avoid new pages
            const mergedChildren = sections.reduce((acc, section) => {
                acc.push(...section.children);
                return acc;
            }, [] as any[]);

            const doc = new Document({
                creator: "YourAppName",
                title: "Blog Posts",
                description: "Exported blog posts",
                sections: [
                    {
                        properties: {},
                        children: mergedChildren,
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, "blog_posts.docx");

        } catch (error) {
            console.error('Failed to generate Word document:', error);
        } finally {
            setLoading(false);
        }
    };

    const parseContent = (htmlContent: string) => {
        const root = parse(htmlContent.replace(/&nbsp;/g, ' ')); // Replace &nbsp; with space
        const elements = root.childNodes;
        const children: any[] = [];

        elements.forEach(element => {
            // Traverse child nodes to find img tags
            element.childNodes.forEach(child => {
                // @ts-ignore
                if (child.tagName === 'IMG') {
                    // @ts-ignore
                    const src = child.getAttribute('src');
                    if (src && src.startsWith('data:image/')) {
                        const base64String = src.split(',')[1];
                        const buffer = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
                        children.push(new Paragraph({
                            children: [
                                new ImageRun({
                                    data: buffer,
                                    transformation: {
                                        width: 400,
                                        height: 300,
                                    },
                                }),
                            ],
                        }));
                    }
                } else {
                    const text = child.rawText.trim();
                    if (text) {
                        children.push(new Paragraph({ text }));
                    }
                }
            });
        });

        return children;
    };

    return (
        <>
            <button
                onClick={generateWordDoc}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center icon-btn text-2xl"
                disabled={loading}
                data-tooltip-id="downloadTooltip"
                data-tooltip-content="Download All Posts in a Word Document"
            >
                <FaDownload />
            </button>
            <Tooltip id="downloadTooltip" />
        </>
    );
};

export default ExportAllPostsButton;
