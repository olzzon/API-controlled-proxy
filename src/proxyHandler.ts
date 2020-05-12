const httpProxy = require('http-proxy')
const http = require('http')

let proxyServer: any
let proxy: any

export const initProxy = () => {
    proxy = new httpProxy.createProxyServer({
        target: {
            host: 'localhost',
            port: 1176,
        },
    })
    proxyServer = new http.createServer((req: any, res: any) => {
        proxy.web(req, res)
    })

    proxyServer.on('upgrade', function (req: any, socket: any, head: any) {
        proxy.ws(req, socket, head)
    })

    proxyServer.listen(8015)

    console.log('Proxy listening to 8015, and sending out to 1176')
}

export const setAmp = () => {
    proxy = new httpProxy.createProxyServer({
        target: {
            host: 'localhost',
            port: 3000,
        },
    })
}

export const setSisyfos = () => {
    proxy = new httpProxy.createProxyServer({
        target: {
            host: 'localhost',
            port: 1176,
        },
    })
}
