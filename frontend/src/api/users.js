// users.js
import { getHeaders, handleResponse } from './helpers';
import { API_URL } from './config';

// GET adresses d'un utilisateur
export async function getUserAddresses() {
    try {
        const res = await fetch(`${API_URL}/addresses`, {
            method: 'GET',
            headers: getHeaders(false, true),
        });
        return await handleResponse(res);
    } catch (error) {
        console.error('Erreur getUserAddresses:', error);
        return [];
    }
}

// POST nouvelle adresse
export async function createAddress(data) {
    const res = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: getHeaders(true, true),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

// PATCH update adresse
export async function updateAddress(id, data) {
    const res = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'PATCH',
        headers: getHeaders(true, true),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

// DELETE adresse
export async function deleteAddress(id) {
    const res = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(false, true),
    });
    return handleResponse(res);
}

// PATCH update user
export async function updateUser(data) {
    const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: getHeaders(true, true),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

// PATCH change password
export async function updatePassword(data) {
    const res = await fetch(`${API_URL}/users/change_password`, {
        method: 'PATCH',
        headers: getHeaders(true, true),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

// DELETE compte utilisateur
export async function deleteMe() {
    const res = await fetch(`${API_URL}/users/me`, {
        method: 'DELETE',
        headers: getHeaders(false, true),
    });
    return handleResponse(res);
}

// GET export des données utilisateur
export async function exportMe() {
    const res = await fetch(`${API_URL}/users/me/export`, {
        method: 'GET',
        headers: getHeaders(false, true),
    });
    return handleResponse(res);
}