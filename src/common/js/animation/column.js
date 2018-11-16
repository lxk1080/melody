export default class Column {
  constructor({ctx, size, width, height}) {
    this.ctx = ctx;
    this.caps = new Array(size).fill(0); // 存储每个柱形小帽的高度
    this.width = width;
    this.height = height;

    this.init();
  }

  init() {
    const line = this.ctx.createLinearGradient(0, 0, 0, this.height);
    line.addColorStop(0, 'red');
    line.addColorStop(0.5, 'yellow');
    line.addColorStop(1, 'green');

    this.ctx.fillStyle = line;
  }

  draw(arr) {
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
}
