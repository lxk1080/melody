import axios from 'axios';

// create a cancel token using the CancelToken.source factory
const CancelToken = axios.CancelToken;
let token = null;
let cancel = null;

export const getSongsList = () => {
  const url = '/api/file/songs';

  return axios.get(url).then((res) => {
    if (res.status === 200) {
      return Promise.resolve(res.data);
    }
  })
}

export const loadSong = (songName) => {
  const url = `/api/media/${songName}.mp3`;

  // cancel several requests with the same cancel token
  if (typeof cancel === 'function') {
    cancel('close the last request')
  }

  // 为每一次请求创建一个不同的token，以及一个对应的cancel
  token = new CancelToken(function executor(c) {
    cancel = c
  })

  return axios.get(url, {
    responseType: 'arraybuffer',
    cancelToken: token,
  }).then((res) => {
    if (res.status === 200) {
      return Promise.resolve(res.data);
    }
  })
}

export const getSongPic = (songName) => {
  const url = '/api/file/picture';

  return axios.get(url, {
    params: {
      songName,
    },
    cancelToken: token,
  }).then((res) => {
    if (res.status === 200) {
      return Promise.resolve(res.data.data.picture);
    }
  })
}
