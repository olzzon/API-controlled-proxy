const fs = require('fs')
const path = require('path')
const net = require('net')

let targetHost = 'localhost'
let targetPort = 9924
let targetSocket = new net.Socket()
let targetConnected = false
let clientList: any[] = []

let mtx: any
try {
    mtx = JSON.parse(fs.readFileSync(path.resolve('storage', 'default-mtx.JSON')))
} catch (error) {
    console.log('Couldn´t read default-mtx.JSON file')
}

export const initProxy = () => {
    process.on('uncaughtException', (error) => {
        console.error('UncaughtExption setting up proxy :', error)
    })

    let sourcePort = 9923
    const server = net.createServer((sourceSocket: any) => {
        clientList.push(sourceSocket)
        console.log('Clients connected', clientList.length)

        targetSocket.connect(targetPort, targetHost)

        sourceSocket.on('connect', (data: any) => {
            console.log(
                '>>> connection #%d from %s:%d',
                server.connections,
                sourceSocket.remoteAddress,
                sourceSocket.remotePort,
            )
        })

        sourceSocket.on('data', (data: any) => {
            if (targetConnected) {
                //console.log('Writing data to Target Socket :', data)
                targetSocket.write(data)
            }
        })

        targetSocket.on('data', (data: any) => {
            //console.log('Writing data to Source Socket :', data)
            sourceSocket.write(data)
        })

        sourceSocket.on('close', (had_error: any) => {})

        targetSocket.on('close', (had_error: any) => {})
    })

    server.listen(sourcePort)

    console.log('Proxy listening to ', sourcePort, 'and sending out to ', targetPort)
}

export const setMtx = (source: string, target: string) => {
    let sourceIndex = 0
    mtx.sources.forEach((item: any, index: number)=>{
        if (item.name === source) {
            sourceIndex = index
        }
    })
    let targetIndex = 0
    mtx.targets.forEach((item: any, index: number)=>{
        if (item.name === target) {
            targetIndex = index
        }
    })

    console.log(mtx)
    console.log('Source :', sourceIndex, 'Target :', targetIndex)
    clientList.forEach((clientSocket) => {
        clientSocket.destroy()
    })
    targetSocket.destroy()
    targetSocket = new net.Socket()
    targetPort = mtx.targets[targetIndex].port
    targetHost = mtx.targets[targetIndex].ip
    targetConnected = true
}
