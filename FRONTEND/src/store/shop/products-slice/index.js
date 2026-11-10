import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import {
  LOCAL_CATALOG,
  isLocalProductId,
  localCatalogRequest,
} from "@/lib/catalog-source";
const baseURL = `${API_BASE_URL}/shop/products`;

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  pagination: null,
  activeListRequest: null,
  activeDetailRequest: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async (
    { filterParams, sortParams, page = 1, pageSize = 24, featured = false },
    { signal },
  ) => {
    if (LOCAL_CATALOG)
      return localCatalogRequest(
        "products",
        {
          ...filterParams,
          sortBy: sortParams,
          page,
          pageSize,
          ...(featured ? { featured: "1" } : {}),
        },
        signal,
      );
    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
    });

    const result = await axios.get(`${baseURL}/get?${query}`);

    return result?.data;
  },
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id, { signal }) => {
    if (isLocalProductId(id)) {
      if (!LOCAL_CATALOG)
        throw new Error(
          "Switch to Dummy catalog to view this preview product.",
        );
      return localCatalogRequest(`products/${id}`, {}, signal);
    }
    const result = await axios.get(`${baseURL}/get/${id}`);

    return result?.data;
  },
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
      state.activeDetailRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
        state.activeListRequest = action.meta.requestId;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        if (state.activeListRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.productList = action.payload.data;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        if (state.activeListRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.productList = [];
        state.pagination = null;
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
        state.activeDetailRequest = action.meta.requestId;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        if (state.activeDetailRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        if (state.activeDetailRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
