import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  loading: false,
  error: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.error = false;
      state.currentUser = action.payload;
    },
    signInFaliure: (state) => {
      state.loading = false;
      state.error = true;
    },
    logoutStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    logoutSuccess: (state) => {
      state.loading = false;
      state.error = false;
      state.currentUser = null;
    },
    LogoutFaliure: (state) => {
      state.loading = false;
      state.error = true;
    },
    updateStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    updateSuccess: (state, action) => {
      state.loading = false;
      state.error = false;
      state.currentUser = action.payload;
    },
    updateFaliure: (state) => {
      state.loading = false;
      state.error = true;
    },
    unauthorizedHandler: (state) => {
      state.loading = false;
      state.error = false;
      state.currentUser = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  signInStart,
  signInSuccess,
  signInFaliure,
  logoutStart,
  logoutSuccess,
  LogoutFaliure,
  updateStart,
  updateSuccess,
  updateFaliure,
  unauthorizedHandler,
} = authSlice.actions;

export default authSlice.reducer;
