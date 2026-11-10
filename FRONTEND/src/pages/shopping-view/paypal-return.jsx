import { capturePayment } from "@/store/shop/order-slice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";

function PaypalReturnPage() {
  const [failed, setFailed] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  useEffect(() => {
    const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));
    dispatch(capturePayment({ paymentId, payerId, orderId })).then((data) => {
      if (data?.payload?.success) {
        sessionStorage.removeItem("currentOrderId");
        window.location.href = "/shop/payment-success";
      } else {
        setFailed(true);
      }
    });
  }, [paymentId, payerId, dispatch]);

  return (
    <section className="status-page" role="status">
      <p className="eyebrow">YOUR ORDER / PAYMENT</p>
      <h1>{failed ? "A moment to check." : "The finishing touch."}</h1>
      <p>
        {failed
          ? "We couldn't confirm this payment. Check your orders before trying again, or contact us for help."
          : "We're confirming your payment. Please keep this page open while we check your order."}
      </p>
      {failed ? (
        <Link className="solid-link" to="/shop/account">
          Check your orders
        </Link>
      ) : (
        <div className="loading-rule" aria-hidden="true" />
      )}
    </section>
  );
}
export default PaypalReturnPage;
