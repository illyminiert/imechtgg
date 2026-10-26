import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// imecht.gg ist eine eigene Domain, daher base: '/'.
export default defineConfig({ plugins: [react()], base: '/' });
