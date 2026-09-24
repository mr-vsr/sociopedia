import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "state";

// One place for the backend URL. Set REACT_APP_API_URL in client/.env for deploys.
export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:3001").replace(
  /\/$/,
  ""
);

export const assetUrl = (file) => (file ? `${API_URL}/assets/${file}` : "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const request = async (path, { token, json, body, method = "GET", signal } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      signal,
      body: json !== undefined ? JSON.stringify(json) : body,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message =
      (data && (data.message || data.msg || data.error)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return data;
};

/** Authenticated request bound to the current session; signs out on 401. */
export const useApi = () => {
  const token = useSelector((s) => s.token);
  const dispatch = useDispatch();
  return useCallback(
    async (path, opts = {}) => {
      try {
        return await request(path, { token, ...opts });
      } catch (err) {
        if (err.status === 401) dispatch(setLogout());
        throw err;
      }
    },
    [token, dispatch]
  );
};
