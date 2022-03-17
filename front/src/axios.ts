import axios from "axios";
const axiosPostVideo = axios.create({
  baseURL: "http://localhost:4000",
});
export default axiosPostVideo;
