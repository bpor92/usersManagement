import Vue from "vue";
import Vuex from "vuex";
import { dbUserRef, dbMenuRef } from "../firebase/firebase-config";

import { firebaseMutations, firebaseAction } from "vuexfire";
import firebase from "firebase";
import router from "../Router/routes";
Vue.use(Vuex);

const user = firebase.auth().currentUser;

const state = {
  isUserLoggedIn: null,
  users: [],
  basket: [],
  Menu: []
};

const getters = {
  isUserLoggedIn: state => state.isUserLoggedIn,
  getUsers: state => state.users
};

const mutations = {
  ...firebaseMutations,
  signIn(state, payload) {
    Vue.set(state, "isUserLoggedIn", payload.uid);
    Vue.set(state, "email", payload.email);
  },
  logout(state) {
    Vue.set(state, "isUserLoggedIn", null);
  },
  addToBasket(state, payload) {
    state.basket.push(payload);
  },
  removeItem(state, payload) {
    state.basket.splice(payload, 1);
  },
  recalcItem(state, payload) {
    Vue.set(state.basket[payload.index], "total", payload.total);
  },
  incQty(state, payload) {
    Vue.set(state.basket, "quantity", state.basket[payload].quantity++);
  },
  decQty(state, payload) {
    Vue.set(state.basket, "quantity", state.basket[payload].quantity--);
  }
};

const actions = {
  signIn({ commit, state, dispatch }, payload) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .signInWithEmailAndPassword(payload.email, payload.password)
        .then(res => {
          commit("signIn", { uid: res.uid, email: res.email });
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  logout({ commit, state, dispatch }, payload) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .signOut()
        .then(user => {
          commit("logout");
          resolve();
        })
        .catch(err => {
          console.log(err);
          reject();
        });
    });
  },
  setUsersList: firebaseAction(({ bindFirebaseRef }, { ref }) => {
    bindFirebaseRef("users", ref);
  }),
  updateUserData({ commit, state, dispatch }, payload) {
    user
      .updatePassword(newPassword)
      .then(function() {
        // Update successful.
      })
      .catch(function(error) {
        // An error happened.
      });
  },
  addToBasket({ commit }, payload) {
    commit("addToBasket", payload);
  },
  recalcItem({ commit, state }, payload) {
    const qty = state.basket[payload].quantity;
    const price = state.basket[payload].price;
    const total = parseFloat(qty) * price;
    commit("recalcItem", { index: payload, total });
  },
  incQty({ commit, state, dispatch }, payload) {
    commit("incQty", payload);
    dispatch("recalcItem", payload);
  },
  decQty({ commit, state, dispatch}, payload) {
    const quantity = state.basket[payload].quantity;
    if (quantity === 1) {
      commit("removeItem", payload);
    } else {
      commit("decQty", payload);
      dispatch("recalcItem", payload);
    }
  },
  removeItem({ commit }, payload) {
    commit("removeItem", payload);
  },
  addPizza({ commit }, payload) {
    dbMenuRef.push(payload).then(res => {
      console.log(res);
    });
  },
  importMenu: firebaseAction(({ bindFirebaseRef }, { ref }) => {
    bindFirebaseRef("Menu", ref);
  }),
  removeItemFromMenu({ commit }, payload) {
    dbMenuRef.child(payload.key).remove();
  }
};

const store = new Vuex.Store({ state, getters, actions, mutations });
export { store };
