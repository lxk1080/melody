const express = require('express');
const path = require('path');
const fs = require('fs');
const jsmediatags = require('jsmediatags');
const router = express.Router();

const media = path.join(__dirname, '../public/media');

router.get('/songs', function (req, res) {
  fs.readdir(media, function (err, data) {
    if (!err) {
      const list = data.map(item => item.slice(0, item.length - 4)); // 去掉 '.mp3' 后缀

      res.json({
        code: 0,
        data: {
          musicList: list,
        }
      })
    }
  })
});

router.get('/picture', function (req, res) {
  jsmediatags.read(`${media}/${req.query.songName}.mp3`, {
    onSuccess: function (tag) {
      res.json({
        code: 0,
        data: {
          picture: tag.tags.picture
        }
      });
    },
    onError: function (error) {
      console.log(':(', error.type, error.info);
    }
  });
});

module.exports = router;
