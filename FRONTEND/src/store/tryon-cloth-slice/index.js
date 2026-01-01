import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const baseURL = "https://ecomtryonbackend.vercel.app/api/common/tryon";

const initialState = {
  isLoading: false,
  clothImageList: [],
};

export const getClothImage = createAsyncThunk(
  "/order/getClothImage",
  async () => {
    const response = await axios.get(`${baseURL}/getcloth`);

    return response.data;
  }
);

export const addClothImage = createAsyncThunk(
  "/order/addClothImage",
  async (image) => {
    const response = await axios.post(`${baseURL}/addcloth`, {
      image,
    });

    return response.data;
  }
);

const tryonClothSlice = createSlice({
  name: "tryonClothSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getClothImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClothImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clothImageList = action.payload.data;
      })
      .addCase(getClothImage.rejected, (state) => {
        state.isLoading = false;
        state.clothImageList = [];
      });
  },
});

export default tryonClothSlice.reducer;
