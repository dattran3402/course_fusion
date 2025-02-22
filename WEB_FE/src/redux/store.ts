import { configureStore } from "@reduxjs/toolkit";

import contextSlice from "./features/contextSlice";

export const store = configureStore({
  reducer: {
    context: contextSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
