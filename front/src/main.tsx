import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MantineProvider } from '@mantine/core';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = 'https://your-site.com/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <MantineProvider>
        <App />
      </MantineProvider>
    </TonConnectUIProvider>
  </React.StrictMode>
);