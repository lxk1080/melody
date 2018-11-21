import { animationTypes } from '../constants';
import { random } from '../utils/util';
import $store from '../../../store';

export default class Dot {
  constructor({el, ctx, type, size, width, height}) {
    this.name = animationTypes.dot;
    this.el = el;
    this.ctx = ctx;
    this.size = size;
    this.width = width;
    this.height = height;
    this.dots = []; // 每个dot的信息
    this.dotsMode = 'x'; // dot运动模式

    // 初始化事件，这个函数直执行一次
    this.initEvent();
    this.init();
  }

  init() {
    // 创建点信息
    this.createDots();
  }

  resize({width, height}) {
    this.width = this.el.width = width;
    this.height = this.el.height = height;

    this.createDots();
  }

  initEvent() {
    this.el.addEventListener('click', () => {
      if ($store.getters.animationType !== this.name) return;
      this.dotsMode = this.dotsMode === 'x' ? 'xy' : 'x';
    })
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
}
