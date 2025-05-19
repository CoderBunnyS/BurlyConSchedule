// utils/authUtils.js

export function getAccessToken() {
    return localStorage.getItem("access_token") || null;
  }
  
  export function getDecodedToken() {
    const token = getAccessToken();
    if (!token) return null;
  
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(base64));
      return decodedPayload;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }
  
  export function getUserId() {
    const decoded = getDecodedToken();
    return decoded?.sub || null;
  }
  
  export function isLoggedIn() {
    return !!getUserId();
  }
  