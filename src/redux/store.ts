import { configureStore } from "@reduxjs/toolkit";
import movieSlice, { moviesSlice } from "./MoviesSlice";
import { useDispatch } from "react-redux";
import tvReducer, { TvSlice } from "./TvSlice";
import i18n from "@/i18n";

export const store = configureStore({
  reducer: {
    movies: movieSlice,
    tv: tvReducer,
  },
});

i18n.on("languageChanged", () => {
  store.dispatch(moviesSlice.actions.resetLanguage());
  store.dispatch(TvSlice.actions.resetLanguage());
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
