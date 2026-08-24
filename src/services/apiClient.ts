const API_URL = "/api/v1/resource";

const getHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  "x-bypass-token": import.meta.env.VITE_BYPASS_TOKEN,
});

export const get = async <T>(resource: string): Promise<T> => {
  const response = await fetch(`${API_URL}/${resource}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GET ${resource} failed`);
  }

  return response.json();
};

export const getById = async <T>(resource: string, id: string): Promise<T> => {
  const response = await fetch(`${API_URL}/${resource}/${id}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GET ${resource}/${id} failed`);
  }

  return response.json();
};

export const create = async <T, B>(resource: string, data: B): Promise<T> => {
  const response = await fetch(`${API_URL}/${resource}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      data: [data],
    }),
  });

  if (!response.ok) {
    throw new Error(`POST ${resource} failed`);
  }

  return response.json();
};

export const update = async <T, B>(
  resource: string,
  id: string,
  data: B,
): Promise<T> => {
  const response = await fetch(`${API_URL}/${resource}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      data,
    }),
  });

  if (!response.ok) {
    throw new Error(`PUT ${resource}/${id} failed`);
  }

  return response.json();
};
