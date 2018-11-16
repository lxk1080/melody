import { random } from '../utils/util';
import { AnimationTypes } from '../constants';

export default class Canvas {
  constructor({el, type, width, height, size}) {
    this.el = el;
    this.type = type;
    this.caps = new Array(size).fill(0); // 存储每个柱形小帽的高度
    this.dots = []; // type为dot时，每个dot的信息
    this.dotsMode = 'x'; // dot运动模式
    this.size = size; // frequencyBinCount的大小
    this.width = this.el.width = width;
    this.height = this.el.height = height;
    this.ctx = this.el.getContext('2d');

    this.initEvent();
    this.setColumn();
  }

  initEvent() {
    const self = this;
    self.el.addEventListener('click', function() {
      if (self.type !== 'dot') return;
      self.dotsMode = self.dotsMode === 'x' ? 'xy' : 'x';
    })
  }

  setType(type) {
    this.type = type;

    // reset all attrs of canvas
    this.el.width = this.el.width;

    switch (type) {
      case AnimationTypes.column:
        this.setColumn();
        break;
      case AnimationTypes.dot:
        this.createDots();
        break;
    }
  }

  resize({width, height}) {
    this.width = this.el.width = width;
    this.height = this.el.height = height;

    switch (this.type) {
      case AnimationTypes.column:
        this.setColumn();
        break;
      case AnimationTypes.dot:
        this.createDots();
        break;
    }
  }

  setColumn() {
    const line = this.ctx.createLinearGradient(0, 0, 0, this.height);
    line.addColorStop(0, 'red');
    line.addColorStop(0.5, 'yellow');
    line.addColorStop(1, 'green');
    this.ctx.fillStyle = line;
  }

  createDots() {
    this.dots = [];

    for (let i = 0; i < this.size; i++) {
      const x = random(0, this.width);
      const y = random(0, this.height);
      const dx = random(1, 4);
      const dy = random(1, 4);
      const color = `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, ${random(0, 10) / 10})`;

      this.dots.push({x, y, dx, dy, color});
    }
  }

  draw(arr) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.type === AnimationTypes.column) {
      this.drawColumn(arr);

    } else if (this.type === AnimationTypes.dot) {
      this.drawDot(arr);

    } else if (this.type === AnimationTypes.circle) {
      this.drawCircle(arr);

    }
  }

  drawColumn(arr) {
    const ctx = this.ctx;
    const caps = this.caps;
    const len = arr.length;
    const w = parseInt(this.width / len);
    const dw = w * 0.8;
    const capH = dw * 0.6;
    for (let i = 0; i < arr.length; i++) {
      const h = arr[i] / 256 * this.height;
      // 绘制柱状图
      ctx.fillRect(w * i, this.height, dw, -h);
      // 绘制柱状图上面的小帽
      ctx.fillRect(w * i, this.height - caps[i], dw, -capH);
      caps[i] = caps[i] - 5;
      if (caps[i] < 0) {
        caps[i] = 0;
      }
      if (h > 0 && caps[i] < h + 40) {
        caps[i] = h + 40;
      }
      if (caps[i] > this.height) {
        caps[i] = this.height - capH;
      }
    }
  }

  drawDot(arr) {
    const ctx = this.ctx;
    const len = arr.length;
    const measure = Math.min(50, (this.height > this.width ? this.width : this.height) / 10);

    for (let i = 0; i < len; i++) {
      const dot = this.dots[i];
      const {x, y, color} = dot;
      const r = arr[i] / 256 * measure;

      const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
      radial.addColorStop(0, '#ffffff');
      radial.addColorStop(1, color);
      ctx.fillStyle = radial;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 360 * Math.PI / 180, false);
      ctx.closePath();

      ctx.fill();

      // 让 dot 动起来，通过 r 的大小改变运动速度，判断边界，改变其运动方向
      // 速度控制
      dot.dx = dot.dx > 0 ? (r === 0 ? 1 : r / 5) : (r === 0 ? -1 : -r / 5);
      dot.dy = dot.dy > 0 ? (r === 0 ? 1 : r / 5) : (r === 0 ? -1 : -r / 5);

      if (this.dotsMode === 'xy') {
        // 1. x,y轴同时运动，并且反弹
        if (x >= this.width || x <= 0) {
          dot.dx = -dot.dx;
        }
        if (y >= this.height || y <= 0) {
          dot.dy = -dot.dy;
        }
        dot.x += dot.dx;
        dot.y += dot.dy;
      } else if (this.dotsMode === 'x') {
        // 2. 仅x轴运动，不反弹
        dot.x += dot.dx;
        dot.x = dot.x > this.width ? 0 : dot.x;
        if (dot.x < 0) {
          dot.dx = -dot.dx;
        }
      }
    }
  }

  drawCircle(arr) {
    const ctx = this.ctx;
    const len = arr.length;
    const deg = Math.PI / 180;

    const x = this.width / 2;
    const y = this.height / 2;
    const baseR = 100;
    const minR = 200;

    const angle = 360 / len;
    const size = 6;

    for (let i = 0; i < len; i++) {
      const r = minR + baseR * arr[i] / 256;
      // const color = `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 1)`;

      // 画线
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, r, i * angle * deg, i * angle * deg, false);
      ctx.closePath();
      // ctx.strokeStyle = color;
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = size;
      ctx.stroke();

      // 以点的形式展现
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, r - size, i * angle * deg - 0.01, i * angle * deg + 0.01, false); // 0.01是根据angle的大小计算而来
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 画一个圆盖住不要的线，使中间透明，以放置圆形唱片
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out'; // 全局合成操作, 仅仅显示老图像与新图像没有重叠的部分
    ctx.arc(x, y, minR - size, 0, 360 * deg, false);
    ctx.fill();
    ctx.restore();
  }
}
