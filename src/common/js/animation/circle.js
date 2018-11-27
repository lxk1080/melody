import { animationTypes } from '../constants';
import $store from '../../../store';
import { getSongPic, loadSong } from '../../../api/file';
import { addData, getDataByCursor } from '../indexdb';
import { guid } from '../utils/util';

export default class Circle {
  constructor({el, ctx, type, size, width, height}) {
    this.name = animationTypes.circle;
    this.el = el;
    this.ctx = ctx;
    this.size = size;
    this.width = width;
    this.height = height;
    this.songName = null;
    this.isRender = false;

    this.init();
  }

  init() {
    // do something here
  }

  showImage(dom, image) {
    let base64String = '';
    for (let i = 0; i < image.data.length; i++) {
      base64String += String.fromCharCode(image.data[i]);
    }
    dom.src = `data:${image.format};base64,${window.btoa(base64String)}`;
  }

  draw(arr) {
    const ctx = this.ctx;
    const len = arr.length;
    const deg = Math.PI / 180;

    const x = this.width / 2;
    const y = this.height / 2;

    const baseNum = Math.min(this.width, this.height);

    // const minR = 200;
    const minR = (baseNum / 2) * (3 / 4);
    // const baseR = 100;
    const baseR = (baseNum / 2) * (1 / 4);

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

    // 这里可以将圆形渲染到canvas上
    if (!this.isRender || this.songName !== $store.getters.currentSong) {
      const cdCanvas = document.createElement('canvas');
      const cdCtx = cdCanvas.getContext('2d');
      const songName = $store.getters.currentSong;
      const img = new Image();

      img.onload = () => {
        cdCtx.drawImage(img, 0, 0, cdCanvas.width, cdCanvas.height);
      };

      getDataByCursor('song', { songName }).then(async res => {
        if (!res) {
          // 从后台获得歌曲arraybuffer数据
          const songData = await loadSong(songName);
          const songPic = await getSongPic(songName);

          this.showImage(img, songPic);

          if (songData && songPic) {
            addData('song', {id: guid(), songName, songData, songPic});
          }
        } else {
          this.showImage(img, res.songPic);
        }
      })

      const style = {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate3d(-50%, -50%, 0)',
        width: `${(minR - size) * 2 - 20}px`,
        height: `${(minR - size) * 2 - 20}px`,
        borderRadius: '50%',
      };

      for (let [key, value] of Object.entries(style)) {
        cdCanvas.style[key] = value;
      }

      this.el.parentNode.appendChild(cdCanvas);

      this.songName = songName;
      this.isRender = true;
    }
  }
}
