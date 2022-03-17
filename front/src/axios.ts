import axios from "axios";
const axiosPostVideo = axios.create({
  baseURL: "http://localhost:4000",
});

const axiosAnalyzeVideo = axios.create({
  baseURL: "http://localhost:4050",
});

export { axiosPostVideo, axiosAnalyzeVideo };
