import { TOKEN_KEY, USER_KEY } from "@providers/authProvider";


function sendJson(url: string | URL | Request, methods: "POST" | "PUT" | "PATCH" | "DELETE" | "GET", json: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
        const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
        const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        fetch(url, {
            method: methods, // Specify the HTTP method as POST
            headers: headers,
            body: methods == "GET" ? undefined : JSON.stringify(json)
        }).then(response => {
            if (!response.ok && response.status != 401 && response.status != 404) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }).then(data => {
            if (data.code == 401 && typeof window !== "undefined") {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                location.href = "/admin/login";
            }

            resolve(data);
        })
            .catch(error => {
                console.error('Error:', error);
                reject(error);
            });
    });
}
export function post(url: string | URL | Request, json: any): Promise<any> {
    return sendJson(url, "POST", json);
}
export function put(url: string | URL | Request, json: any): Promise<any> {
    return sendJson(url, "PUT", json);
}
export function patch(url: string | URL | Request, json: any): Promise<any> {
    return sendJson(url, "PATCH", json);
}
export function del(url: string | URL | Request, json: any): Promise<any> {
    return sendJson(url, "DELETE", json);
}
export function get(url: string | URL | Request): Promise<any> {
    return sendJson(url, "GET", {});
}