import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { collectAdminOrderPages } from "@/lib/admin-order-pages";
const baseURL = `${API_BASE_URL}/admin/orders`;

const initialState = {
  orderList: [],
  orderDetails: null,
  activeDetailRequest: null,
  isLoading: false,
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async (_, { signal }) => {
    return collectAdminOrderPages(async (page) => {
      const response = await axios.get(`${baseURL}/get`, {
        params: { page, limit: 100 },
        signal,
      });
      return response.data;
    });
  },
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id, { signal }) => {
    const response = await axios.get(`${baseURL}/details/${id}`, { signal });

    return response.data;
  },
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }) => {
    const response = await axios.put(`${baseURL}/update/${id}`, {
      orderStatus,
    });

    return response.data;
  },
);

export const deleteOrder = createAsyncThunk(
  "/order/deleteOrder",
  async (id) => {
    const response = await axios.delete(`${baseURL}/delete/${id}`);

    return response.data;
  },
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
      state.activeDetailRequest = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetailsForAdmin.pending, (state, action) => {
        state.isLoading = true;
        state.activeDetailRequest = action.meta.requestId;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        if (state.activeDetailRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state, action) => {
        if (state.activeDetailRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
