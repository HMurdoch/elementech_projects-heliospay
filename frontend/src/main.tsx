import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import "./styles/styles.css"; 
import "./styles/ui.css"; 

import { ToastProvider } from "./ui/Toast";
createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ToastProvider>
            <App />
        </ToastProvider>
    </React.StrictMode>
);


//createRoot(document.getElementById('root')!).render(
//    <React.StrictMode>
//        <App />
//    </React.StrictMode>
//)