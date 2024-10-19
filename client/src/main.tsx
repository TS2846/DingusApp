import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div className="container flex flex-row mx-auto h-screen min-h-96">
            <App />
        </div>
    </StrictMode>,
);
