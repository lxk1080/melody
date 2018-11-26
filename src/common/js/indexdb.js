window.indexedDB = window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;

if (!window.indexedDB) {
  console.log('Your Browser does not support IndexedDB');
}

let request, db, id = 0;

/**
 * 打开或创建数据库
 * @param name 库名
 * @param version 版本
 */
const openDB = (name, version) => {
  const request = window.indexedDB.open(name, version || 1);

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
  };
}

const closeDB = () => {
  db.close();
}

const deleteDB = (name) => {
  window.indexedDB.deleteDatabase(name);
}

/**
 * 创建一个store
 * @param storeName store名
 * @param keyPath 主健
 * @param createIndex 索引：[{indexName, fieldName, unique}]，可不传
 */
const createStore = (storeName, keyPath, createIndex) => {
  const objectStore = db.createObjectStore(storeName, { keyPath });

  // 建立索引
  if (createIndex) {
    createIndex.map(item => {
      objectStore.createIndex(item.indexName, item.fieldName, { unique: item.unique });
    })
  }

  /*for (let i = 0; i < data.length; i++) {
    request = objectStore.add(data[i])
    request.onsuccess = function() {
      console.log('数据已存入数据库')
    };
    request.onerror = function () {
      console.error('数据库中已有该数据')
    }
  }*/
}

/**
 * add data
 * @param store
 * @param data
 */
const addRow = (store, data) => {
  const transaction = db.transaction([store], 'readwrite');
  const objectStore = transaction.objectStore(store);

  const res = objectStore.add({ id: id++, ...data });

  res.onsuccess = function () {
    console.log('add success');
  }
  res.onerror = function () {
    console.log('add error');
  }
}

/**
 * remove data
 * @param store
 * @param data
 */
const removeRow = (store, data) => {
  const transaction = db.transaction([store], 'readwrite');
  const objectStore = transaction.objectStore(store);

  if (typeof data === 'object') {
    const request = objectStore.openCursor();
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const row = cursor.value;
        data.map(key => {
          if (row[key] === data[key]) {
            objectStore.delete(row[id]);
            return true;
          }
        })
        cursor.continue();
      }
    }
  } else {
    objectStore.delete(data);
  }
}
