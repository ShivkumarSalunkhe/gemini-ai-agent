import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Dark mode setup
const root = document.documentElement;
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const updateTheme = (e) => {
  if (e.matches) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Listen for OS theme changes
darkModeMediaQuery.addEventListener('change', updateTheme);
updateTheme(darkModeMediaQuery);

const rootElement = ReactDOM.createRoot(document.getElementById('root'));
rootElement.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
