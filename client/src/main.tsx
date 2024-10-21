import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div className="container flex flex-row mx-auto h-screen min-h-96">
        <ToastContainer
            position="top-center"
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover
            theme="light"
            transition={Bounce}
            stacked
            limit={4} 
            closeButton = {false}
            />
            <App />
        </div>
    </StrictMode>,
);
