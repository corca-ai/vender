import axios from "axios";
const axiosPostVideo = axios.create({
  baseURL: "http://211.58.102.6:8003",
});

const axiosAnalyzeVideo = axios.create({
  baseURL: "http://211.58.102.6:8001",
});

export { axiosPostVideo, axiosAnalyzeVideo };
