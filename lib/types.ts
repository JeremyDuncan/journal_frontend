// lib/types.ts
export interface Post {
    id: number;
    title: string;
    content: string;
    tags: Tag[];
    created_at: string;
}

export interface Tag {
    id: number;
    name: string;
    tag_type: {
        color: string;
        name: string;
    };
}