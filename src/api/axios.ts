import axios from "axios";

const api = axios.create({
  baseURL: "https://yumetunes.duckdns.org/api",
  timeout: 10000,
});

export default api;