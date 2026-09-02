import { getHeaders, handleResponse } from "./helpers";
import { API_URL } from "./config";

export async function postReview(productId, comment) {
  const res = await fetch(`${API_URL}/reviews/${productId}`, {
    method: "POST",
    headers: getHeaders(true, true),
    body: JSON.stringify({ comment }),
  });
  return handleResponse(res);
}

export async function deleteReview(reviewId) {
  const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: getHeaders(false, true),
  });
  return handleResponse(res);
}