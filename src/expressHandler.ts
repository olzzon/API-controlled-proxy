const express = require('express')
const path = require('path')
const app = express()
const server = require('http').Server(app)
import { setEmulator, setMtx } from './proxyHandler'

export const expressInit = () => {
    console.log('REST Initialising WebServer')
    app.use('/', express.static(path.join(__dirname, '..')))
    server.listen(80)
    server.on('connection', () => {
        app.get('/', (req: any, res: any) => {
            console.log(req.params)
            res.send('Access REST api by calling /state, queries: ?full  and ?path=the/tree/of/our/ember')
        })
            .get('/mtx', (req: any, res: any) => {
                setMtx(req.query.source, req.query.target)
                res.send('MTX switched')
            })
    })
}