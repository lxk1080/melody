import axios from 'axios';

// 拦截请求
axios.interceptors.request.use(function (req) {
  return req;
});

// 拦截响应
axios.interceptors.response.use(function (res) {
  if (res.data.code === 404) {
    throw new Error(res.data.data.message);
  }
  return res;
});
