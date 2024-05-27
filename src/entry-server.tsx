import React from 'react'
import ReactDOMServer from 'react-dom/server'
import App from './App'
import { StaticRouter } from "react-router-dom/server"

type RenderProps = {
    path: string
}
export function render({ path }: RenderProps) {
    console.log('in entry-server with path: ', path)
    const html = ReactDOMServer.renderToString(
        <StaticRouter location={path}>
            <App />
        </StaticRouter>


    )
    return { html }
}
