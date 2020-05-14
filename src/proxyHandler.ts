const fs = require('fs')
const path = require('path')
const net = require('net')

let targetHost = 'localhost'
let targetPort = 9924
let targetSocket = new net.Socket()
let targetConnected = false
let clientList: any[] = []

export const initProxy = () => {
    process.on('uncaughtException', (error) => {
        console.error('UncaughtExption setting up proxy :', error)
    })

    let sourcePort = 9923

    let mtx: JSON
    try {
        mtx = JSON.parse(fs.readFileSync(path.resolve('storage', 'default-mtx.JSON')))
    } catch (error) {
        console.log('Couldn´t read default-mtx.JSON file')
    }
    console.log('Mtx :', mtx)

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
                console.log('Writing data to Target Socket :', data)
                targetSocket.write(data)
            }
        })

        targetSocket.on('data', (data: any) => {
            console.log('Writing data to Source Socket :', data)
            sourceSocket.write(data)
        })

        sourceSocket.on('close', (had_error: any) => {})

        targetSocket.on('close', (had_error: any) => {})
    })

    server.listen(sourcePort)

    console.log('Proxy listening to ', sourcePort, 'and sending out to ', targetPort)
}

export const setEmulator = () => {
    clientList.forEach((clientSocket) => {
        clientSocket.destroy()
    })
    targetSocket.destroy()
    targetSocket = new net.Socket()
    targetPort = 9925
    targetHost = 'localhost'
    targetConnected = true
}

export const setSisyfos = () => {
    clientList.forEach((clientSocket) => {
        clientSocket.destroy()
    })
    targetSocket.destroy()
    targetSocket = new net.Socket()
    targetPort = 9924
    targetHost = 'localhost'
    targetConnected = true
}
