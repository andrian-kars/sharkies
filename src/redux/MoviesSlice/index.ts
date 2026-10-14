import { getApiErrorMessage } from "@/api/config";
import { MoviesData, getMovies } from "@/api/moviesService";
import { createSlice } from "@reduxjs/toolkit";
import type { Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { getApiLanguage } from "@/i18n";
import {
  MoviesPageType,
  POPULAR,
  NOW_PLAYING,
  UPCOMING,
  TOP_RATED,
} from "@/constants";

interface MovieState {
  [POPULAR]: MoviesData | null;
  [NOW_PLAYING]: MoviesData | null;
  [UPCOMING]: MoviesData | null;
  [TOP_RATED]: MoviesData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MovieState = {
  [POPULAR]: null,
  [NOW_PLAYING]: null,
  [UPCOMING]: null,
  [TOP_RATED]: null,
  isLoading: true,
  error: null,
};

export const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    resetLanguage: () => initialState,
    setPopular: (state, action: PayloadAction<MoviesData>) => {
      state[POPULAR] = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setNowPlaying: (state, action: PayloadAction<MoviesData>) => {
      state[NOW_PLAYING] = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setUpcoming: (state, action: PayloadAction<MoviesData>) => {
      state[UPCOMING] = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setTopRated: (state, action: PayloadAction<MoviesData>) => {
      state[TOP_RATED] = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const fetchGetMovies =
  (type: MoviesPageType, page: number) => async (dispatch: Dispatch) => {
    const language = getApiLanguage();
    try {
      dispatch(moviesSlice.actions.setLoading(true));
      const fetchedMovies = await getMovies(type, page, language);
      if (language !== getApiLanguage()) return;

      switch (type) {
        case POPULAR:
          dispatch(moviesSlice.actions.setPopular(fetchedMovies.data));
          break;
        case NOW_PLAYING:
          dispatch(moviesSlice.actions.setNowPlaying(fetchedMovies.data));
          break;
        case UPCOMING:
          dispatch(moviesSlice.actions.setUpcoming(fetchedMovies.data));
          break;
        case TOP_RATED:
          dispatch(moviesSlice.actions.setTopRated(fetchedMovies.data));
          break;
      }
    } catch (e) {
      if (language !== getApiLanguage()) return;
      const errorMessage = getApiErrorMessage(e);

      dispatch(moviesSlice.actions.setError(errorMessage));
    }
  };

export const {
  setPopular,
  setNowPlaying,
  setUpcoming,
  setTopRated,
  setLoading,
  setError,
} = moviesSlice.actions;

export default moviesSlice.reducer;
