import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) {
            return 'react-vendor';
          }

          if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-')) {
            if (
              id.includes('/antd/es/table') ||
              id.includes('/antd/es/pagination') ||
              id.includes('/rc-table/') ||
              id.includes('/rc-pagination/')
            ) {
              return 'antd-data-vendor';
            }

            if (
              id.includes('/antd/es/form') ||
              id.includes('/antd/es/input') ||
              id.includes('/antd/es/select') ||
              id.includes('/antd/es/upload') ||
              id.includes('/rc-field-form/') ||
              id.includes('/rc-select/') ||
              id.includes('/rc-upload/')
            ) {
              return 'antd-form-vendor';
            }

            if (
              id.includes('/antd/es/modal') ||
              id.includes('/antd/es/drawer') ||
              id.includes('/antd/es/notification') ||
              id.includes('/antd/es/message') ||
              id.includes('/rc-dialog/') ||
              id.includes('/rc-notification/')
            ) {
              return 'antd-feedback-vendor';
            }

            if (
              id.includes('/antd/es/date-picker') ||
              id.includes('/antd/es/calendar') ||
              id.includes('/rc-picker/')
            ) {
              return 'antd-date-vendor';
            }

            return 'antd-vendor';
          }

          if (id.includes('react-quill')) {
            return 'editor-vendor';
          }

          if (
            id.includes('chart.js') ||
            id.includes('react-chartjs-2') ||
            id.includes('recharts')
          ) {
            return 'charts-vendor';
          }

          if (id.includes('jspdf') || id.includes('html2pdf.js')) {
            return 'export-vendor';
          }

          if (id.includes('react-icons')) {
            return 'icons-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});
