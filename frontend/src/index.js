import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import "@/styles/responsive.css";
import App from "@/App";

// Fix for vh on mobile browsers
function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVH();
window.addEventListener('resize', setVH);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
