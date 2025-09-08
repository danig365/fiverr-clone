// frontend/src/api/auth.js
import API from "./api";

export const register = data => API.post("auth/register/", data);
export const verifyEmail = token => API.post("auth/verify-email/", { token });
export const resendVerify = data => API.post("auth/resend-verify/", data);
export const login = creds => API.post("auth/login/", creds);
export const refreshToken = refresh => API.post("auth/token/refresh/", { refresh });
export const me = () => API.get("auth/me/");
export const logout = refresh => API.post("auth/logout/", { refresh });
export const requestPasswordReset = data => API.post("auth/password-reset/request/", data);
export const confirmPasswordReset = data => API.post("auth/password-reset/confirm/", data);
export const becomeSeller = () => API.post("auth/become-seller/");
export const switchRole = (role) => API.patch("auth/switch-role/", { role });