import fs from 'node:fs/promises'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
    ? await fs.readFile('./dist/client/index.html', 'utf-8')
    : ''
const ssrManifest = isProduction
    ? await fs.readFile('./dist/client/.vite/ssr-manifest.json', 'utf-8')
    : undefined

// Create http server
const app = express()

// Add Vite or respective production middlewares
let vite
if (!isProduction) {
    const { createServer } = await import('vite')
    vite = await createServer({
        server: { middlewareMode: true },
        appType: 'custom',
        base
    })
    app.use(vite.middlewares)
} else {
    const compression = (await import('compression')).default
    const sirv = (await import('sirv')).default
    app.use(compression())
    app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Serve HTML - app.use works, but I don't think it's still doing ssr on the csr routes.
// app.use('*', async (req, res) => {
//   try {
//     const url = req.originalUrl.replace(base, '')
//     console.log('in server.js with path: ', url)
//     let template
//     let render
//     if (!isProduction) {
//       // Always read fresh template in development
//       template = await fs.readFile('./index.html', 'utf-8')
//       template = await vite.transformIndexHtml(url, template)
//       render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
//     } else {
//       template = templateHtml
//       render = (await import('./dist/server/entry-server.js')).render
//     }

//     const rendered = await render({path: url, ssrManifest})

//     const html = template
//       .replace(`<!--app-head-->`, rendered.head ?? '')
//       .replace(`<!--app-html-->`, rendered.html ?? '')

//     res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
//   } catch (e) {
//     vite?.ssrFixStacktrace(e)
//     console.log(e.stack)
//     res.status(500).end(e.stack)
//   }
// })

//this causes "/about" to not be able to be found
// ssr home page
app.get('/', async (req, res) => {
    try {
        const url = req.originalUrl.replace(base, '')
        console.log('in server.js with path: ', url)
        let template
        let render
        if (!isProduction) {
            // Always read fresh template in development
            template = await fs.readFile('./index.html', 'utf-8')
            template = await vite.transformIndexHtml(url, template)
            render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
        } else {
            template = templateHtml
            render = (await import('./dist/server/entry-server.js')).render
        }

        const rendered = await render({ path: url, ssrManifest })

        const html = template
            .replace("<!--app-head-->", rendered.head ?? '')
            .replace("<!--app-html-->", rendered.html ?? '')

        res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
    } catch (e) {
        vite?.ssrFixStacktrace(e)
        console.log(e.stack)
        res.status(500).end(e.stack)
    }
})

app.use("/s",express.static("dist/client"))

// csr about page
app.get('/about', async (req, res) => {
    // res.status(200).end("Hi world")
    res.sendFile(path.resolve(__dirname, "dist/client", "index.html"));
})

// Middleware to handle CSR routes
// app.get('*', async (req, res) => {
//     try {
//         const filePath = path.resolve(__dirname, 'dist/client/index.html');
//         const htmlData = await fs.readFile(filePath, 'utf-8');
//         res.status(200).set({ 'Content-Type': 'text/html' }).send(htmlData);
//     } catch (err) {
//         console.error('Error reading HTML file:', err);
//         res.status(404).end();
//     }
// });

// Start http server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
})
