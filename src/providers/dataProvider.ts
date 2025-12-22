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
    const json = await response.json();
    return { data: json.data };
  },

  update: async ({ resource, id, variables }) => {
    const response = await fetcher(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });
    const json = await response.json();
    return { data: json.data };
  },

  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = new URL(`${API_URL}/${resource}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    if (pagination) {
      let { current, currentPage, pageSize } = pagination as any;
      if (pagination.mode == "off") {
        current = 1;
        pageSize = 999;
      }
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
          const { field, operator, value } = filter;

          if (value === undefined || value === null || value === "") return;

          switch (operator) {
            case "contains":
              url.searchParams.set(`${field}_like`, String(value));
              break;
            case "eq":
              url.searchParams.set(field, String(value));
              break;
            case "ne":
              url.searchParams.set(`${field}_ne`, String(value));
              break;
            case "gte":
              url.searchParams.set(`${field}_gte`, String(value));
              break;
            case "lte":
              url.searchParams.set(`${field}_lte`, String(value));
              break;
            case "in":
              if (Array.isArray(value)) {
                url.searchParams.set(`${field}_in`, value.join(","));
              }
              break;
            default:
              // Fallback to exact match for others
              url.searchParams.set(field, String(value));
              break;
          }
        }
      });
    }

    const response = await fetcher(url.toString());
    const json = await response.json();

    // Fallback if total is missing
    const total = json.total !== undefined ? json.total : (json.data ? json.data.length : 0);

    return {
      data: json.data,
      total: total,
    };
  },

  create: async ({ resource, variables }) => {
    const response = await fetcher(`${API_URL}/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables),
    });
    const json = await response.json();
    return { data: json.data };
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
        const json = await response.json();
        return json.data;
      })
    );
    return { data };
  },

  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    let requestUrl = `${url}?`;

    if (sorters && sorters.length > 0) {
      const sortQuery = {
        _sort: sorters.map((s) => s.field).join(","),
        _order: sorters.map((s) => s.order).join(","),
      };
      requestUrl = `${requestUrl}&${new URLSearchParams(sortQuery).toString()}`;
    }

    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter) {
          const { field, operator, value } = filter;
          if (value === undefined || value === null || value === "") return;

          // Reuse logic or simplify for custom? 
          // Ideally we should extract a helper but for now copy-paste for safety to avoid messing imports
          let key = field;
          let val = String(value);

          switch (operator) {
            case "contains": key = `${field}_like`; break;
            case "ne": key = `${field}_ne`; break;
            case "gte": key = `${field}_gte`; break;
            case "lte": key = `${field}_lte`; break;
            case "in":
              key = `${field}_in`;
              if (Array.isArray(value)) val = value.join(",");
              break;
          }
          requestUrl = `${requestUrl}&${key}=${val}`;
        }
      });
    }

    if (query) {
      requestUrl = `${requestUrl}&${new URLSearchParams(query as any).toString()}`;
    }

    // Default to API_URL prefix if url is relative? 
    // Usually useCustom url is passed as is. But if it starts with /, we might want to prepend domain?
    // fetcher handles relative URLs if they don't include protocol.
    // But fetcher expects `${API_URL}/${resource}...` usuallly.
    // If user passes `/api/permissions`, fetcher will call `fetch("/api/permissions")`. Correct.

    const response = await fetcher(requestUrl, {
      method,
      headers: headers as any,
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const json = await response.json();
    return { data: json };
  },
};
