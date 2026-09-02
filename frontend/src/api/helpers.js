export function getHeaders(json = false, auth = false) {
    const headers = {};
    if (json) headers["Content-Type"] = "application/json";
    if (auth) headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    return headers;
}

export async function handleResponse(res) {
    let data = null;
    try {
        data = await res.json();
    } catch { }
    if (!res.ok) {
        console.error("API ERROR:", data);
        throw new Error(data?.message || "Erreur API");
    }
    return data;
}
