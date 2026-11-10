import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { LOCAL_CATALOG, localCatalogRequest } from "@/lib/catalog-source";
const baseURL = `${API_BASE_URL}/shop/search`;

const initialState = {
  isLoading: false,
  searchResults: [],
  pagination: null,
  activeRequest: null,
};

export const getSearchResults = createAsyncThunk(
  "/order/getSearchResults",
  async (query, { signal }) => {
    const { keyword, page = 1 } =
      typeof query === "object" ? query : { keyword: query };
    if (LOCAL_CATALOG)
      return localCatalogRequest(
        "products",
        { keyword: decodeURIComponent(keyword), page },
        signal,
      );
    const response = await axios.get(`${baseURL}/${keyword}`);

    return response.data;
  },
);

const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    resetSearchResults: (state) => {
      state.searchResults = [];
      state.pagination = null;
      state.activeRequest = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSearchResults.pending, (state, action) => {
        state.isLoading = true;
        state.activeRequest = action.meta.requestId;
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        if (state.activeRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.searchResults = action.payload.data;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(getSearchResults.rejected, (state, action) => {
        if (state.activeRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.searchResults = [];
      });
  },
});

export const { resetSearchResults } = searchSlice.actions;

export default searchSlice.reducer;
