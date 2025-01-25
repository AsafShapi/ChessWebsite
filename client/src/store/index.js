import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import friendsReducer from './slices/friendsSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        friends: friendsReducer
    }
});

export default store;

