import { AnimationTypes } from '../constants';
import Column from '../animation/column';
import Dot from '../animation/dot';
import Circle from '../animation/circle';

const mapClasses = {
  [AnimationTypes.column]: Column,
  [AnimationTypes.dot]: Dot,
  [AnimationTypes.circle]: Circle,
}

export default class Canvas {
  constructor({el, type, size, width, height}) {
    this.el = el;
    this.type = type;
    this.size = size; // frequencyBinCount的大小
    this.width = this.el.width = width;
    this.height = this.el.height = height;

    this.ctx = this.el.getContext('2d');
    this.animation = {};

    this.createAnimation(type);
  }

  createAnimation(type) {
    this.type = type;

    if (!this.animation[type]) {
      this.animation[type] = new mapClasses[type]({ ...this });
    }

    this.animation[type].init();
  }

  setType(type) {
    // reset all attrs of canvas
    this.el.width = this.el.width;

    this.createAnimation(type);
  }

  resize({width, height}) {
    this.width = this.el.width = width;
    this.height = this.el.height = height;

    if (typeof this.animation[this.type].resize === 'function') {
      this.animation[this.type].resize({width, height});
    }
  }

  draw(arr) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.animation[this.type].draw(arr);
  }
}
