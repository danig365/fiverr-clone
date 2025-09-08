import API from "./api";

export const getOrders = () => API.get("orders/");
export const createOrder = (data) => API.post("orders/", data);
export const deliverOrder = (orderId) => API.post(`orders/${orderId}/deliver/`);
export const rejectOrder = (orderId) => API.post(`orders/${orderId}/reject/`);
export const acceptOrder = (orderId) => API.post(`orders/${orderId}/accept/`);
