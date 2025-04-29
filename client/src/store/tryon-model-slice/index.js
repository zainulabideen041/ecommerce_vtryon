import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const baseURL = "https://ecomtryonbackend.vercel.app/api/common/tryon";

const initialState = {
  isLoading: false,
  modelImageList: [],
};

export const getModelImage = createAsyncThunk(
  "/order/getModelImage",
  async () => {
    const response = await axios.get(`${baseURL}/getmodel`);

    return response.data;
  }
);

export const addModelImage = createAsyncThunk(
  "/order/addModelImage",
  async (image) => {
    const response = await axios.post(`${baseURL}/addmodel`, {
      image,
    });

    return response.data;
  }
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
