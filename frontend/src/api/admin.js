// api/adminProducts.js
import { getHeaders, handleResponse } from "./helpers";
import { API_URL } from "./config";

// GET all products with variants
export async function getAllProducts() {
    const res = await fetch(`${API_URL}/products?admin=true`, {
        headers: getHeaders(false, true),
    });
    return handleResponse(res);
}

// PATCH update Product is_featured
export async function updateProductIsFeatured(productId, isFeatured) {
    const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "PATCH",
        headers: getHeaders(true, true),
        body: JSON.stringify({
            is_featured: isFeatured,
            products_id: productId
        }),
    });
    return handleResponse(res);
}

// PATCH update variant stock
export async function updateVariantStock(variantId, newStock) {
    const res = await fetch(`${API_URL}/product_variants/${variantId}`, {
        method: "PATCH",
        headers: getHeaders(true, true),
        body: JSON.stringify({
            stock: newStock,
            product_variants_id: variantId
        }),
    });
    return handleResponse(res);
}

// POST create a new product (sans variantes)
export async function createProduct(product) {
    const { name, description, price_in_cents, img_url, sub_categories_id } = product;
    const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: getHeaders(true, true),
        body: JSON.stringify({ name, description, price_in_cents, img_url, sub_categories_id }),
    });
    const createdProduct = await handleResponse(res);

    return createdProduct;
}

// POST add a variant to an existing product
export async function createVariant(productId, variant) {
    const { color, color_hex, size, sku, stock } = variant; // ✅
    const res = await fetch(`${API_URL}/product_variants`, {
        method: "POST",
        headers: getHeaders(true, true),
        body: JSON.stringify({ products_id: productId, color, color_hex, size, sku, stock }), // ✅
    });
    return handleResponse(res);
}

// DELETE a product
export async function deleteProduct(productId) {
    const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: getHeaders(true, true),
        body: JSON.stringify({ products_id: productId }),
    });
    return handleResponse(res);
}

// DELETE a product variant
export async function deleteVariant(variantId) {
    const res = await fetch(`${API_URL}/product_variants/${variantId}`, {
        method: "DELETE",
        headers: getHeaders(true, true),
        body: JSON.stringify({ product_variants_id: variantId }),
    });
    return handleResponse(res);
}

// GET orders
export async function getAllOrders() {
    const res = await fetch(`${API_URL}/admin/orders`, {
        headers: getHeaders(true, true),
    });
    return handleResponse(res);
}

// PATCH order status
export async function updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {

        method: "PATCH",
        headers: getHeaders(true, true),
        body: JSON.stringify({
            status,
            orders_id: orderId,
        }),
    });
    return handleResponse(res);
}

export async function getAdminStats() {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: getHeaders(false, true),
  });
  return handleResponse(res);
}

// ── Categories ──
export async function createCategory(data) {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: getHeaders(true, true),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateCategory(id, data) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: getHeaders(true, true),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteCategory(id) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getHeaders(true, true),
  });
  if (res.status === 204) return;
  return handleResponse(res);
}

// ── Sub-categories ──
export async function createSubCategory(data) {
  const res = await fetch(`${API_URL}/sub_categories`, {
    method: "POST",
    headers: getHeaders(true, true),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateSubCategory(id, data) {
  const res = await fetch(`${API_URL}/sub_categories/${id}`, {
    method: "PATCH",
    headers: getHeaders(true, true),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteSubCategory(id) {
  const res = await fetch(`${API_URL}/sub_categories/${id}`, {
    method: "DELETE",
    headers: getHeaders(true, true),
  });
  if (res.status === 204) return;
  return handleResponse(res);
}