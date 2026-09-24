import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.posts = [];
    },
    setFriends: (state, action) => {
      if (state.user) state.user.friends = action.payload.friends;
    },
    setPosts: (state, action) => {
      state.posts = Array.isArray(action.payload.posts) ? action.payload.posts : [];
    },
    setPost: (state, action) => {
      const next = action.payload.post;
      state.posts = state.posts.map((p) => (p._id === next._id ? next : p));
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload.id);
    },
  },
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost, removePost } =
  authSlice.actions;
export default authSlice.reducer;
