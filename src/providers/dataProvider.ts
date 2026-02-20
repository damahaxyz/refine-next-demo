
import { DataProvider } from "@refinedev/core";
import { get, post, patch, del, put } from "@/lib/http";

const API_URL = "/api";

export const dataProvider: DataProvider = {
  getOne: async ({ resource, id }) => {
    const json = await get(`${API_URL}/${resource}/${id}`);
    return { data: json.data };
  },

  update: async ({ resource, id, variables }) => {
    const json = await patch(`${API_URL}/${resource}/${id}`, variables);
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

    const json = await get(url.toString());

    // Fallback if total is missing
    const total = json.total !== undefined ? json.total : (json.data ? json.data ? json.data.length : 0 : 0);

    return {
      data: json.data,
      total: total,
    };
  },

  create: async ({ resource, variables }) => {
    const json = await post(`${API_URL}/${resource}`, variables);
    return { data: json.data };
  },

  deleteOne: async ({ resource, id }) => {
    await del(`${API_URL}/${resource}/${id}`, {});
    return { data: { id } as any };
  },

  getApiUrl: () => API_URL,

  getMany: async ({ resource, ids }) => {
    if (!ids) return { data: [] };
    const data = await Promise.all(
      ids.map(async (id) => {
        const json = await get(`${API_URL}/${resource}/${id}`);
        return json.data;
      })
    );
    return { data };
  },

  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    let requestUrl = `${url}`;

    // If url is relative but doesn't start with /, adhere to convention or adjust.
    // Assuming standard URL handling.

    const urlObj = new URL(requestUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    if (sorters && sorters.length > 0) {
      urlObj.searchParams.set("_sort", sorters.map((s) => s.field).join(","));
      urlObj.searchParams.set("_order", sorters.map((s) => s.order).join(","));
    }

    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter) {
          const { field, operator, value } = filter;
          if (value === undefined || value === null || value === "") return;

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
          urlObj.searchParams.set(key, val);
        }
      });
    }

    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        urlObj.searchParams.set(k, String(v));
      });
    }

    const finalUrl = urlObj.toString();
    let json;

    switch (method) {
      case "get":
        json = await get(finalUrl);
        break;
      case "post":
        json = await post(finalUrl, payload);
        break;
      case "patch":
        json = await patch(finalUrl, payload);
        break;
      case "put":
        json = await put(finalUrl, payload);
        break;
      case "delete":
        json = await del(finalUrl, payload);
        break;
      default:
        throw new Error(`Unsupported method ${method}`);
    }

    return { data: json };
  },
};
