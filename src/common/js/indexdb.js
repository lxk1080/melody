const indexedDB = window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;

if (!indexedDB) {
  console.log('Your Browser does not support IndexedDB');
}

let db = null;

// 初始化数据库和store
openDB('songDB', [
  {
    storeName: 'song',
    keyPath: 'id',
    createIndex: [
      {
        indexName: 'songNameIndex',
        fieldName: 'songName',
        unique: false,
      }
    ]
  }
], 1);

/**
 * 打开或创建数据库
 * @param name 库名
 * @param stores 相当于多个表
 * @param version 版本
 */
export function openDB(name, stores, version) {
  const request = indexedDB.open(name, version || 1);

  request.onsuccess = function (e) {
    console.log('Success opening db');
    db = e.target.result;
  };

  request.onerror = function (e) {
    console.log(`Error opening ${name}`, e.currentTarget.error.message);
  };

  request.onupgradeneeded = function (e) {
    console.log('DB version changed to ' + version);
    db = e.target.result;

    for (let store of stores) {
      createStore(store.storeName, store.keyPath, store.createIndex);
    }
  };
}

/**
 * 创建一个store
 * @param storeName store名
 * @param keyPath 主健
 * @param createIndex 索引：[{indexName, fieldName, unique}]，可不传
 */
export function createStore(storeName, keyPath, createIndex) {
  const objectStore = db.createObjectStore(storeName, {keyPath});

  // 建立索引
  if (createIndex) {
    createIndex.map(item => {
      objectStore.createIndex(item.indexName, item.fieldName, {unique: item.unique});
    })
  }

  /* const data = [
    {
      id: 0,
      name: 'q',
      age: 12,
    },
    {
      id: 1,
      name: 'w',
      age: 15,
    }
  ];

  for (let i = 0; i < data.length; i++) {
    const request = objectStore.add(data[i])
    request.onsuccess = function() {
      console.log('数据已存入数据库');
    };
    request.onerror = function () {
      console.error('数据库中已有该数据');
    }
  } */
}

/**
 * add data
 * @param store
 * @param data
 */
export function addData(store, data) {
  const transaction = db.transaction([store], 'readwrite');
  const objectStore = transaction.objectStore(store);

  const res = objectStore.add({...data});

  res.onsuccess = function () {
    console.log('add: success');
  }
  res.onerror = function () {
    console.log('add: error');
  }
}

/**
 * 通过keyPath删除数据
 * @param store
 * @param key
 */
export function deleteDataByKey(store, key) {
  const transaction = db.transaction(store, 'readwrite');
  const objectStore = transaction.objectStore(store);
  objectStore.delete(key);
  console.log('remove: success');
}

/**
 * 通过其他的字段值删除数据
 * @param store
 * @param data -- example { name: 'xiaoxiao' }
 */
export function deleteDataByCursor(store, data) {
  const transaction = db.transaction([store], 'readwrite');
  const objectStore = transaction.objectStore(store);

  const request = objectStore.openCursor();

  request.onsuccess = (e) => {
    const cursor = e.target.result;

    if (!cursor) {
      return console.log('remove: error');
    }

    const row = cursor.value;
    let flag = true;

    for (let [key, value] of Object.entries(data)) {
      if (row[key] !== value) {
        flag = false;
      }
    }

    if (flag) {
      objectStore.delete(row['id']);
      return console.log('remove: success');
    }

    cursor.continue();
  }
}

/**
 * 通过keyPath修改一条数据
 * @param store
 * @param key
 * @param data -- example: { name: 'xiaoxiao', age: 20 }
 */
export function updateDataByKey(store, key, data) {
  const transaction = db.transaction(store, 'readwrite');
  const objectStore = transaction.objectStore(store);

  const request = objectStore.get(key);

  request.onsuccess = function (e) {
    const row = e.target.result;
    for (let [key, value] of Object.entries(data)) {
      row[key] = value;
    }
    objectStore.put(row);
    console.log('update: success');
  };
}

/**
 * 通过keyPath查找数据
 * @param store
 * @param key
 */
export function getDataByKey(store, key) {
  const transaction = db.transaction([store], 'readwrite');
  const objectStore = transaction.objectStore(store);

  const request = objectStore.get(key);

  request.onsuccess = function (e) {
    return e.target.result;
  };
}

/**
 * 通过其他的字段值查找数据
 * @param store
 * @param data -- example { name: 'xiaoxiao' }
 */
export function getDataByCursor(store, data) {
  return new Promise(resolve => {
    const transaction = db.transaction(store);
    const objectStore = transaction.objectStore(store);

    const request = objectStore.openCursor();

    request.onsuccess = function (e) {
      const cursor = e.target.result;

      if (!cursor) {
        resolve('');
        return;
      }

      const row = cursor.value;
      let flag = true;

      for (let [key, value] of Object.entries(data)) {
        if (row[key] !== value) {
          flag = false;
          break;
        }
      }

      if (flag) {
        resolve(row);
        return;
      }

      cursor.continue();
    };
  })
}

/**
 * 关闭数据库
 */
export function closeDB() {
  db.close();
}

/**
 * 删除数据库
 * @param name
 */
export function deleteDB(name) {
  window.indexedDB.deleteDatabase(name);
}

/**
 * 清除一个store内的所有数据
 * @param store
 */
export function clearObjectStore(store) {
  const transaction = db.transaction(store, 'readwrite');
  const objectStore = transaction.objectStore(store);
  objectStore.clear();
}

/**
 * 删除一个store
 * @param store
 */
export function deleteObjectStore(store) {
  db.transaction(store, 'versionchange');
  db.deleteObjectStore(store);
}
