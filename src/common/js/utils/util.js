/**
 * 解析URL参数
 * @example ?id=123456&a=b
 * @return Object {id:123456,a:b}
 */
export function urlParse() {
  const url = window.location.search;
  const reg = /[?&][^?&]+=[^?&]+/g;
  const arr = url.match(reg);
  const obj = {};
  let key, val;
  // ['?id=123456', '&a=b']
  if (arr) {
    arr.forEach((item) => {
      let tempArr = item.substr(1).split('=');
      key = decodeURIComponent(tempArr[0]);
      val = decodeURIComponent(tempArr[1]);
      obj[key] = val;
    });
  }
  return obj;
}

/**
 * 获取两个数字之间的随机数
 * @param m
 * @param n
 * @returns {number}
 */
export function random(m, n) {
  return Math.floor(Math.random() * (n - m + 1) + m);
}

/**
 * 一个洗牌函数
 * @param arr
 */
export function shuffle(arr) {
  let newArr = arr.slice();
  for (let i = 0; i < newArr.length; i++) {
    let j = random(0, i);
    let tmp = newArr[i];
    newArr[i] = newArr[j];
    newArr[j] = tmp;
  }
  return newArr;
}

/**
 * 生成guid唯一性标识
 * @returns {string}
 */
export function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
}
