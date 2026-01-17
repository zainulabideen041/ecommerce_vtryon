import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch } from "react-redux";
import { useState } from "react";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Package,
  MapPin,
  CreditCard,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";

function AdminOrderDetailsView({ orderDetails }) {
  const [status, setStatus] = useState(orderDetails?.orderStatus || "");
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const newStatus = status;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: newStatus })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setStatus("");
        toast({
          title: "Order status updated successfully!",
        });
      }
    });
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Order Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Order ID: {orderDetails?._id}
            </p>
          </div>
          <Badge
            className={`px-4 py-2 text-sm font-semibold ${
              orderDetails?.orderStatus === "confirmed"
                ? "bg-green-500 hover:bg-green-600"
                : orderDetails?.orderStatus === "rejected"
                  ? "bg-red-600 hover:bg-red-700"
                  : orderDetails?.orderStatus === "delivered"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {orderDetails?.orderStatus}
          </Badge>
        </div>
        <Separator />
      </div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Customer Info */}
        <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold">Customer Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">User ID</Label>
              <p className="font-medium text-sm">{orderDetails?.userId}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="font-medium">
                {orderDetails?.addressInfo?.userName}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <p className="font-medium">{orderDetails?.addressInfo?.phone}</p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold">Order Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                Order Date
              </Label>
              <p className="font-medium">
                {orderDetails?.orderDate?.split("T")[0]}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Payment Method
              </Label>
              <p className="font-medium capitalize">
                {orderDetails?.paymentMethod}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Payment Status
              </Label>
              <p className="font-medium capitalize">
                {orderDetails?.paymentStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold">Shipping Address</h3>
          </div>
          <div className="space-y-2">
            <p className="font-medium">{orderDetails?.addressInfo?.address}</p>
            <p className="text-sm text-muted-foreground">
              {orderDetails?.addressInfo?.city},{" "}
              {orderDetails?.addressInfo?.pincode}
            </p>
            <p className="text-sm text-muted-foreground">
              {orderDetails?.addressInfo?.notes}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold">Payment Details</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                Payment ID
              </Label>
              <p className="font-medium text-sm break-all">
                {orderDetails?.paymentId}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Payer ID</Label>
              <p className="font-medium text-sm break-all">
                {orderDetails?.payerId}
              </p>
            </div>
            <div className="pt-2 border-t">
              <Label className="text-xs text-muted-foreground">
                Total Amount
              </Label>
              <p className="text-2xl font-bold text-green-600">
                ${orderDetails?.totalAmount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold">Order Items</h3>
        </div>
        <div className="space-y-4">
          {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
            ? orderDetails?.cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:shadow-md transition-shadow"
                >
                  <img
                    src={item?.image}
                    alt={item?.title}
                    className="w-20 h-20 object-cover rounded-lg shadow-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{item?.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item?.quantity}
                    </p>
                    <p className="text-sm font-medium text-purple-600">
                      ${item?.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-xl font-bold">
                      ${(item?.price * item?.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>

      {/* Update Status */}
      <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100">
        <h3 className="text-lg font-bold mb-4">Update Order Status</h3>
        <form onSubmit={handleUpdateStatus} className="flex gap-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inProcess">In Process</SelectItem>
              <SelectItem value="inShipping">In Shipping</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="submit"
            disabled={status === ""}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            Update Status
          </button>
        </form>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
