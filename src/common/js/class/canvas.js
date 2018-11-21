import { animationTypes } from '../constants';
import Column from '../animation/column';
import Dot from '../animation/dot';
import Circle from '../animation/circle';
import $store from '../../../store';

const mapClasses = {
  [animationTypes.column]: Column,
  [animationTypes.dot]: Dot,
  [animationTypes.circle]: Circle,
}

export default class Canvas {
  constructor({el, type, size, width, height}) {
    this.el = el;
    this.ctx = this.el.getContext('2d');
    this.size = size; // frequencyBinCount的大小
    this.width = this.el.width = width;
    this.height = this.el.height = height;
    this.animation = {};

    this.createAnimation(type);
  }

  createAnimation() {
    const type = $store.getters.animationType;

    if (!this.animation[type]) {
      this.animation[type] = new mapClasses[type]({
        el: this.el,
        ctx: this.ctx,
        size: this.size,
        width: this.width,
        height: this.height,
      });
    }

    this.animation[type].init();
  }

  reRender(type) {
    // reset all attrs of canvas
    this.el.width = this.el.width;

    this.createAnimation();
  }

  resize({width, height}) {
    const type = $store.getters.animationType;

    this.width = this.el.width = width;
    this.height = this.el.height = height;

    if (typeof this.animation[type].resize === 'function') {
      this.animation[type].resize({width, height});
    }
  }

  draw(arr) {
    const type = $store.getters.animationType;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.animation[type].draw(arr);
  }
}
