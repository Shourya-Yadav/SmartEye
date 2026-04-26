import axios from "axios";

const AI_API = axios.create({
  baseURL: "http://localhost:8000"
});

export default AI_API;