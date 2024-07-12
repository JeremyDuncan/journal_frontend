const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchPosts(year?: number, month?: number, page: number = 1, limit: number = 5) {
    if (!API_URL) {
        throw new Error('API_URL is not defined');
    }

    let url = `${API_URL}/posts?page=${page}&limit=${limit}`;
    if (year && month) {
        url += `&year=${year}&month=${month}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Error fetching posts: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
}

export async function fetchPost(id: string) {
    if (!API_URL) {
        throw new Error('API_URL is not defined');
    }

    const res = await fetch(`${API_URL}/posts/${id}`);
    if (!res.ok) {
        throw new Error(`Error fetching post: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
}

export async function deletePost(id: string) {
    const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        throw new Error(`Failed to delete post: ${res.statusText}`);
    }

    // Only attempt to parse JSON if there is a body
    if (res.status !== 204) {
        return res.json();
    }

    return null;
}

export async function fetchTags() {
    const res = await fetch(`${API_URL}/tags`);
    if (!res.ok) {
        throw new Error(`Error fetching tags: ${res.statusText}`);
    }
    return res.json();
}

export async function fetchTagTypes() {
    const res = await fetch(`${API_URL}/tags/tag_types`);
    if (!res.ok) {
        throw new Error(`Error fetching tag types: ${res.statusText}`);
    }
    return res.json();
}

export async function createTag(name: string, tagType: string) {
    tagType = (tagType == "") ? "default" : tagType;
    const res = await fetch(`${API_URL}/tags`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag: { name, tag_type: tagType } }),
    });
    if (!res.ok) {
        throw new Error(`Error creating tag: ${res.statusText}`);
    }
    return res.json();
}

export async function createTagType(name: string, color: string) {
    console.log("name => ", name);
    console.log("color => ", color);

    const res = await fetch(`${API_URL}/tags/tag_types`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag_type: { name, color } }),
    });
    if (!res.ok) {
        throw new Error(`Error creating tag type: ${res.statusText}`);
    }

    return res.json();
}

export async function updateTagTypeColor(id: number, color: string) {
    const res = await fetch(`${API_URL}/tags/tag_types/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag_type: { color } }),
    });

    if (!res.ok) {
        throw new Error(`Error updating tag type color: ${res.statusText}`);
    }

    return res.json();
}

export async function deleteTag(id: number) {
    const res = await fetch(`${API_URL}/tags/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error(`Error deleting tag: ${res.statusText}`);
    }
}

export async function deleteTagType(id: number) {
    const res = await fetch(`${API_URL}/tags/tag_types/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error(`Error deleting tag type: ${res.statusText}`);
    }
}
export const fetchPostsSearch = async (query: string, page: number = 1, limit: number = 5) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);

    if (!response.ok) {
        throw new Error('Failed to search posts');
    }

    return response.json();
};


