import { loadSong, getSongPic } from '../../../api/file';

export default class Player {
  constructor({currentSong, volume, imageItem}) {
    this.currentSong = currentSong;
    this.volume = volume;
    this.imageItem = imageItem;
    this.source = null;
    this.ac = null;
    this.gainNode = null;
    this.analyser = null;
    this.size = 128; // frequencyBinCount的大小
    this.count = 0; // 解决 load 或 decodeAudioData 未完成时，快速切歌的情况
  }

  setSource(source) {
    this.source = source;
  }

  getSource() {
    return this.source;
  }

  setVolume(value) {
    if (!this.gainNode) return;
    this.gainNode.gain.value = value;
  }

  createAc() {
    // audio上下文对象，类似于canvas中的getContext()
    this.ac = new (window.AudioContext || window.webkitAudioContext)();
  }

  createGainNode(volume) {
    // 创建可以控制音量的对象
    this.gainNode = this.ac[this.ac.createGain ? 'createGain' : 'createGainNode']();
    // 初始化音量
    this.gainNode.gain.value = volume;
    // 连接到音频输出点
    this.gainNode.connect(this.ac.destination);
  }

  createAnalyser() {
    // 创建音频分析对象
    this.analyser = this.ac.createAnalyser();
    this.analyser.fftSize = this.size * 2;
    this.analyser.connect(this.gainNode);
  }

  async playSong(songName) {
    const self = this;

    // 如果在load或decodeAudioData未完成时切歌( n 是局部变量，this.count 是全局的)， n !== this.count
    const n = ++self.count;

    // 播放下一首之前，停止当前播放
    const source = this.getSource();
    source && source[source.stop ? 'stop' : 'noteOff']();

    // 从后台获得歌曲arraybuffer数据
    const songData = await loadSong(songName);
    const image = await getSongPic(songName);

    if (songData && image) {
      // indexDB
    }

    // 在songData未获得时，可能切歌了，这里判断
    if (n !== self.count) return;

    // arraybuffer解码，参数：arraybuffer、解码成功、解码失败
    self.ac.decodeAudioData(songData, function(buffer) {
      // 在解码未完成时，可能切歌了，这里判断
      if (n !== self.count) return;

      // 创建音频资源对象
      const bufferSource = self.ac.createBufferSource();
      // 得到音频数据
      bufferSource.buffer = buffer;
      // 连接到gainNode，由于gainNode已经连接到了音频输出点，所以bufferSource就不需要再次连接了
      bufferSource.connect(self.analyser);
      // 开始播放
      bufferSource[bufferSource.start ? 'start' : 'noteOn'](0); // 当前时间+0秒后播放

      // 显示封面
      self.showImage(image);

      // 记录当前的source
      self.setSource(bufferSource);

    }, function(err) {
      console.log('decode_error:', err);
    });

    // 可有可无
    return songName;
  }

  showImage(image) {
    let base64String = '';
    for (let i = 0; i < image.data.length; i++) {
      base64String += String.fromCharCode(image.data[i]);
    }
    this.imageItem.src = `data:${image.format};base64,${window.btoa(base64String)}`;
    this.imageItem.style.display = 'block';
  }

  visualizer(canvas) {
    const self = this;
    // 创建一个长度为 self.analyser.frequencyBinCount 的 Uint8Array 数组，初始时数组的每个元素都为 0
    const uint8array = new Uint8Array(self.analyser.frequencyBinCount);
    const requestAnimateFrame = requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

    function data() {
      // 复制音频当前的频域数据到 uint8array 数组中
      self.analyser.getByteFrequencyData(uint8array);
      // ...
      // console.log(uint8array.length);
      canvas.draw(uint8array);
      requestAnimateFrame(data);
    }
    data();
  }
}
