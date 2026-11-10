import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config";
const baseURL = `${API_BASE_URL}/shop/order`;

const initialState = {
  // approvalURL: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
  activeDetailRequest: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    const response = await axios.post(`${baseURL}/create`, orderData);

    return response.data;
  },
);

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }) => {
    const response = await axios.post(`${baseURL}/capture`, {
      paymentId,
      payerId,
      orderId,
    });

    return response.data;
  },
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId, { signal }) => {
    try {
      const response = await axios.get(`${baseURL}/list/${userId}`, { signal });
      return response.data;
    } catch (error) {
      // The existing API represents an empty order history with HTTP 404.
      if (error.response?.status === 404) return { success: true, data: [] };
      throw error;
    }
  },
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id, { signal }) => {
    const response = await axios.get(`${baseURL}/details/${id}`, { signal });

    return response.data;
  },
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
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
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        // state.approvalURL = action.payload.approvalURL;
        state.orderId = action.payload.orderId;
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId),
        );
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        // state.approvalURL = null;
        state.orderId = null;
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state, action) => {
        state.isLoading = true;
        state.activeDetailRequest = action.meta.requestId;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        if (state.activeDetailRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        if (state.activeDetailRequest !== action.meta.requestId) return;
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
