import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

//Check if path is csr or ssr and render accordingly
const csrPath = '/about'
const ssrPath = '/'

const isSSR = window.location.pathname === ssrPath

if (isSSR) {
    console.log('ssr render')
    ReactDOM.hydrateRoot(
        document.getElementById('root') as HTMLElement,
        <BrowserRouter>
            <App />
        </BrowserRouter>
    )
}
else {
    console.log('csr render')
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <BrowserRouter>
            <App />
        </BrowserRouter>
    )
}


