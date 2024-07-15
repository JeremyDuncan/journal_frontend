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
        id: any;
        color: string;
        name: string;
    };
}

export interface TagType {
    id: number;
    name: string;
    color: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
}

export type FormData = {
    email: string;
    password: string;
};