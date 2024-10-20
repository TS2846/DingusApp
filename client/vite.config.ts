import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({mode}) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.

    const dotenv_path =
        mode === 'development'
            ? path.join(process.cwd(), '../')
            : process.cwd();

    const env = loadEnv(mode, dotenv_path, '');

    return {
        // vite config
        plugins: [react()],
        server: {
            port: env.APP_CLIENT_PORT || 3000,
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        envPrefix: 'APP_',
    };
});
