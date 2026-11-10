import test from "node:test";
import assert from "node:assert/strict";
import {
  orderState,
  orderMoney,
  orderLineTotal,
  orderQuantity,
  orderDate,
} from "../src/lib/order-presentation.js";

test("order progress uses the actual backend statuses", () => {
  assert.equal(orderState("confirmed").step, 0);
  assert.equal(orderState("inProcess").step, 1);
  assert.equal(orderState("inShipping").step, 2);
  assert.equal(orderState("delivered").group, "delivered");
});
test("rejected and unknown orders do not display invented delivery progress", () => {
  assert.equal(orderState("rejected").step, null);
  assert.equal(orderState("unknown-state").step, null);
  assert.equal(orderState(null).label, "Status unavailable");
});
test("receipt line totals account for quantity and preserve currency precision", () => {
  assert.equal(
    orderMoney(orderLineTotal({ price: "19.95", quantity: 3 })),
    "$59.85",
  );
  assert.equal(
    orderQuantity({ cartItems: [{ quantity: 2 }, { quantity: "3" }] }),
    5,
  );
  assert.equal(orderMoney(0), "$0.00");
});
test("missing prices and invalid dates remain visibly unavailable", () => {
  assert.equal(orderMoney(null), "—");
  assert.equal(orderMoney(orderLineTotal({ quantity: 2 })), "—");
  assert.equal(orderDate("invalid"), "Date unavailable");
  assert.equal(orderDate(null), "Date unavailable");
});
