import * as types from './mutation-types';

const mutations = {
  [types.SET_ANIMATION_TYPE](state, type) {
    state.animationType = type;
  }
}

export default mutations;
