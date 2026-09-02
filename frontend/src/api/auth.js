import { getHeaders, handleResponse } from "./helpers";
import { API_URL } from "./config";

export async function signup(first_name, last_name, email, password) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ first_name, last_name, email, password }),
  });

  const data = await handleResponse(res);
  if (!res.ok) throw new Error(data?.message || "Erreur d'inscription");
  return data;
}

export async function loginRequest(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);
  if (!res.ok) throw new Error(data?.message || "Erreur de connexion");
  return data;
}

export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders(false, true),
  });

  const data = await handleResponse(res);
  if (!res.ok) throw new Error(data?.message || "Token invalide");
  return data;
}
