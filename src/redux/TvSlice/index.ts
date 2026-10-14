import { getApiErrorMessage } from "@/api/config";
import { TvData, getTv } from "@/api/tvService";
import { createSlice } from "@reduxjs/toolkit";
import type { Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { getApiLanguage } from "@/i18n";
import { TvPageType, POPULAR, AIRING_TODAY, ON_TV, TOP_RATED } from "@/constants";

interface TvState {
  [POPULAR]: TvData | null;
  [AIRING_TODAY]: TvData | null;
  [ON_TV]: TvData | null;
  [TOP_RATED]: TvData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TvState = {
  [POPULAR]: null,
  [AIRING_TODAY]: null,
  [ON_TV]: null,
  [TOP_RATED]: null,
  isLoading: true,
  error: null,
};

export const TvSlice = createSlice({
  name: "tv",
  initialState,
  reducers: {
    resetLanguage: () => initialState,
    setPopular: (state, action: PayloadAction<TvData>) => {
      state[POPULAR] = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setAiringToday: (state, action: PayloadAction<TvData>) => {
      state[AIRING_TODAY] = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setOnTv: (state, action: PayloadAction<TvData>) => {
      state[ON_TV] = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setTopRated: (state, action: PayloadAction<TvData>) => {
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

export const fetchGetTv =
  (type: TvPageType, page: number) => async (dispatch: Dispatch) => {
    const language = getApiLanguage();
    try {
      dispatch(TvSlice.actions.setLoading(true));
      const fetchedMovies = await getTv(type, page, language);
      if (language !== getApiLanguage()) return;

      switch (type) {
        case POPULAR:
          dispatch(TvSlice.actions.setPopular(fetchedMovies.data));
          break;
        case AIRING_TODAY:
          dispatch(TvSlice.actions.setAiringToday(fetchedMovies.data));
          break;
        case ON_TV:
          dispatch(TvSlice.actions.setOnTv(fetchedMovies.data));
          break;
        case TOP_RATED:
          dispatch(TvSlice.actions.setTopRated(fetchedMovies.data));
          break;
      }
    } catch (e) {
      if (language !== getApiLanguage()) return;
      const errorMessage = getApiErrorMessage(e);

      dispatch(TvSlice.actions.setError(errorMessage));
    }
  };

export const { setPopular, setAiringToday, setOnTv, setTopRated, setLoading, setError } =
  TvSlice.actions;

export default TvSlice.reducer;
