import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import './index.css'
import store from './store'
import { ThemeProvider } from './components/theme-provider'
import { SocketProvider } from './context/socket'

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <Provider store={store}>
    <ThemeProvider defaultTheme="system" storageKey="chess-ui-theme">
      <SocketProvider>
        <App />
      </SocketProvider>
    </ThemeProvider>
  </Provider>
);

