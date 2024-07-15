import { FormData } from "@/lib/types";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_KEY) {
    throw new Error('API_KEY is not defined in environment variables');
}
if (!API_URL) {
    throw new Error('API_URL is not defined in environment variables');
}

// #############################################################################
// ###########################   POSTS   #######################################
// #############################################################################
export async function fetchPosts(year?: number, month?: number, page: number = 1, limit: number = 5) {
    if (!API_URL) {
        throw new Error('API_URL is not defined');
    }

    let url = `${API_URL}/posts?page=${page}&limit=${limit}`;
    if (year && month) {
        url += `&year=${year}&month=${month}`;
    }

    const res = await fetch(url, {
        headers: {
            'X-Api-Key': API_KEY as string,
        },
    });

    if (!res.ok) {
        throw new Error(`Error fetching posts: ${res.statusText}`);
    }
    return await res.json();
}

export async function fetchAllPosts() {
    const url = `${API_URL}/posts/all_posts`;

    const res = await fetch(url, {
        headers: {
            'X-Api-Key': API_KEY as string,
        },
    });

    if (!res.ok) {
        throw new Error(`Error fetching all posts: ${res.statusText}`);
    }

    return await res.json();
}

export async function fetchPost(id: string) {
    if (!API_URL) {
        throw new Error('API_URL is not defined');
    }

    const res = await fetch(`${API_URL}/posts/${id}`, {
        headers: {
            'X-Api-Key': API_KEY as string,
        },
    });

    if (!res.ok) {
        throw new Error(`Error fetching post: ${res.statusText}`);
    }
    return await res.json();
}

export async function deletePost(id: string) {
    const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Api-Key': API_KEY as string,
        },
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


// #############################################################################
// ###########################   TAGS   ########################################
// #############################################################################
export async function fetchTags() {
    const res = await fetch(`${API_URL}/tags`, {
        headers: {
            'X-Api-Key': API_KEY as string,
        },
    });

    if (!res.ok) {
        throw new Error(`Error fetching tags: ${res.statusText}`);
    }
    return res.json();
}

export async function fetchTagTypes() {
    const res = await fetch(`${API_URL}/tags/tag_types`, {
        headers: {
            'X-Api-Key': API_KEY as string,
        },
    });

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
            'X-Api-Key': API_KEY as string,
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
            'X-Api-Key': API_KEY as string,
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
            'X-Api-Key': API_KEY as string,
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
        headers: {
            'X-Api-Key': API_KEY as string,
        },
    });

    if (!res.ok) {
        throw new Error(`Error deleting tag: ${res.statusText}`);
    }
}

export async function deleteTagType(id: number) {
    const res = await fetch(`${API_URL}/tags/tag_types/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Api-Key': API_KEY as string,
        },
    });

    if (!res.ok) {
        throw new Error(`Error deleting tag type: ${res.statusText}`);
    }
}

// #############################################################################
// #################   POST SEARCHING   ########################################
// #############################################################################
export const fetchPostsSearch = async (query: string, page: number = 1, limit: number = 5) => {
    const response = await fetch(`${API_URL}/posts/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
        headers: {
            'X-Api-Key': API_KEY as string,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to search posts');
    }

    return response.json();
};


// #############################################################################
// #################   AUTHENTICATION   ########################################
// #############################################################################
export async function userExists() {
    const res = await fetch(`${API_URL}/users/exists`, {
        headers: {
            'X-Api-Key': API_KEY as string,
        },
    });

    if (!res.ok) {
        throw new Error(`Error checking user existence: ${res.statusText}`);
    }

    return res.json();
}

export async function registerUser(data: FormData) {
    const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': API_KEY as string,
        },
        body: JSON.stringify({ user: data }),
    });

    if (!res.ok) {
        throw new Error(`Error registering user: ${res.statusText}`);
    }

    return res.json();
}