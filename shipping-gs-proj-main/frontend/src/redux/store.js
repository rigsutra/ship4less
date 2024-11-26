// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/auth";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // other reducers
  },
});

export default store;
