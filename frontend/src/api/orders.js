import { getHeaders, handleResponse } from "./helpers";
import { API_URL } from "./config";

// GET orders list by user
export async function getUserOrders() {
  const res = await fetch(`${API_URL}/orders`, {
    headers: getHeaders(false, true), // true = besoin du token
  });
  return handleResponse(res);
}

// GET order by ID
export async function getOrderById(orderId) {
  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: getHeaders(false, true),
  });
  return handleResponse(res);
}

// POST create Stripe checkout session
export async function createCheckoutSession(orderData) {
  const res = await fetch(`${API_URL}/payments/create-checkout-session`, {
    method: "POST",
    headers: getHeaders(true, true),
    body: JSON.stringify(orderData),
  });
  if (res.status === 409) {
    const data = await res.json();
    const err = new Error("STOCK_ERROR");
    err.stockItems = data.items;
    throw err;
  }
  return handleResponse(res);
}
