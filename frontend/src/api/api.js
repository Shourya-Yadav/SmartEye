import axios from "axios";
import server from "../environment";

const API = axios.create({
  baseURL: `${server}/api`
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = token;
  }
  return req;
});

export default API;
