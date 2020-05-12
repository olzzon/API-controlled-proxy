const express = require('express')
const path = require('path')
const app = express()
const server = require('http').Server(app)
import { setAmp, setSisyfos } from './proxyHandler'

export const expressInit = () => {
    console.log('REST Initialising WebServer')
    app.use('/', express.static(path.join(__dirname, '..')))
    server.listen(80)
    server.on('connection', () => {
        app.get('/', (req: any, res: any) => {
            console.log(req.params)
            res.send('Access REST api by calling /state, queries: ?full  and ?path=the/tree/of/our/ember')
        })
            .get('/sisyfos', (req: any, res: any) => {
                console.log('Sisyfos')
                setSisyfos()
                res.send('Sisyfos')
            })
            .get('/amp', (req: any, res: any) => {
                console.log('Amp')
                setAmp()
                res.send('Amp')
            })
    })
}