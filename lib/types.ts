// lib/types.ts
export interface Post {
    id: string;
    title: string;
    content: string;
    tags: Tag[];
    created_at: string;
}

export interface Tag {
    id: string;
    name: string;
    tag_type: {
        color: string;
    };
}