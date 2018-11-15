const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileRouter = require('./file');

const app = express();

// 处理传递过来的payload类型的数据
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/file', fileRouter);

app.use(express.static(path.join(__dirname, '../public')));

app.listen(9093, function () {
  console.log('listening at port 9093 ...');
});
