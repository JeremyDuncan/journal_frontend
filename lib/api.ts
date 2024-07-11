// // lib/api.ts
// // const API_URL = process.env.API_URL;
// const API_URL = process.env.NEXT_PUBLIC_API_URL;
//
//
// export async function fetchPosts() {
//     const res = await fetch(`${API_URL}/posts`);
//     const data = await res.json();
//     console.log("API DATA => ", data)
//     return data;
// }
//
// export async function fetchPost(id: string) {
//     const res = await fetch(`${API_URL}/posts/${id}`);
//     const data = await res.json();
//     return data;
// }

// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// const API_URL = "https://blog-api.jeremyd.net"
export async function fetchPosts() {
    if (!API_URL) {
        throw new Error('API_URL is not defined');
    }

    const res = await fetch(`${API_URL}/posts`);
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
