import React from 'react'
import ReactDOM from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifestUrl="https://dmtrrmntsv.github.io/oxton_v2/tonconnect-manifest.json"
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
)