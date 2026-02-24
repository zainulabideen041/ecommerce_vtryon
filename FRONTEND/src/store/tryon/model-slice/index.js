import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config";
const baseURL = `${API_BASE_URL}/common/tryon`;

const initialState = {
  isLoading: false,
  modelImageList: [],
};

export const getModelImage = createAsyncThunk(
  "/order/getModelImage",
  async () => {
    const response = await axios.get(`${baseURL}/getmodel`);

    return response.data;
  },
);

export const addModelImage = createAsyncThunk(
  "/order/addModelImage",
  async (image) => {
    const response = await axios.post(`${baseURL}/addmodel`, {
      image,
    });

    return response.data;
  },
);

export const deleteModelImage = createAsyncThunk(
  "/order/deleteModelImage",
  async (id) => {
    const response = await axios.delete(`${baseURL}/deletemodel/${id}`);

    return response.data;
  },
);

const tryonModelSlice = createSlice({
  name: "tryonModelSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getModelImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getModelImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modelImageList = action.payload.data;
      })
      .addCase(getModelImage.rejected, (state) => {
        state.isLoading = false;
        state.modelImageList = [];
      });
  },
});

export default tryonModelSlice.reducer;
