import axios from "axios";
import qs from "qs";

// 创建axios实例
const service = axios.create({
  baseURL: (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') ? "http://test.elderly.api.iqeq01.com:8099/api/v1/" : "http://elderly.api.iqeq01.com:8099/api/v1/",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  transformRequest: [
    function(data) {
      return qs.stringify(data);
    },
  ]
});

service.defaults.timeout = 150000;

// request拦截器
service.interceptors.request.use(
  config => {
    /* const _hasSigned = hasSigned(Cookies.get("token"), Cookies.get("ssid"));
    if (!_hasSigned) {
      confirm2signIn();
    } */

    return config;
  },
  error => {
    console.log("网络请求失败");
    Promise.reject(error);
  }
);

// respone拦截器
const resSuccessInterceptors = function (response) {
  const res = response.data;
  if (res.code === 1) {
    message.error(res.msg);
    return Promise.reject(res.msg);
  }
  return response;
}
service.interceptors.response.use(
  response => resSuccessInterceptors(response),
  error => {
    console.log(error.message);
    return Promise.reject(error);
  }
);

export default service;
