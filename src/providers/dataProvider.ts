import { DataProvider } from "@refinedev/core";
import { TOKEN_KEY } from "./authProvider";

const API_URL = "/api";

const fetcher = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response;
};

export const dataProvider: DataProvider = {
  getOne: async ({ resource, id }) => {
    const response = await fetcher(`${API_URL}/${resource}/${id}`);
    const data = await response.json();
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const response = await fetcher(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });
    const data = await response.json();
    return { data };
  },

  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = new URL(`${API_URL}/${resource}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    if (pagination) {
      const { current, currentPage, pageSize } = pagination as any;
      url.searchParams.set("_page", String(current || currentPage || 1));
      url.searchParams.set("_limit", String(pageSize || 10));
    }

    if (sorters && sorters.length > 0) {
      url.searchParams.set("_sort", sorters.map((s) => s.field).join(","));
      url.searchParams.set("_order", sorters.map((s) => s.order).join(","));
    }

    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter) {
          // Ensure values are strings or properly encoded
          url.searchParams.set(filter.field, String(filter.value));
        }
      });
    }

    const response = await fetcher(url.toString());
    const data = await response.json();
    const total = Number(response.headers.get("X-Total-Count"));

    return {
      data,
      total: isNaN(total) ? data.length : total,
    };
  },

  create: async ({ resource, variables }) => {
    const response = await fetcher(`${API_URL}/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables),
    });
    const data = await response.json();
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    await fetcher(`${API_URL}/${resource}/${id}`, {
      method: "DELETE",
    });
    return { data: { id } as any };
  },

  getApiUrl: () => API_URL,

  // Optional methods fallback
  getMany: async ({ resource, ids }) => {
    // This is a naive implementation using Promise.all since the backend lacks batch support
    if (!ids) return { data: [] };
    const data = await Promise.all(
      ids.map(async (id) => {
        const response = await fetcher(`${API_URL}/${resource}/${id}`);
        return response.json();
      })
    );
    return { data };
  },
};
