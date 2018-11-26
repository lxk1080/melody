import * as types from './mutation-types';

const mutations = {
  [types.SET_ANIMATION_TYPE](state, type) {
    state.animationType = type;
  },
  [types.SET_CURRENT_SONG](state, song) {
    state.currentSong = song;
  },
}

export default mutations;
