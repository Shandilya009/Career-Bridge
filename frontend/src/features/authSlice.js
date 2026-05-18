import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: { token, user, isAuthenticated: !!token },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token           = payload.token;
      state.user            = payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload));
    },
    logout: (state) => {
      state.token           = null;
      state.user            = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
