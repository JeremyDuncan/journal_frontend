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
