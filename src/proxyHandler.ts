const fs = require('fs')
const path = require('path')
const net = require('net')

interface connectionList {
    source: number | undefined
    target: number | undefined
}
interface mtx {
    sources: [
        {
            name: string
            ip: string
            port: number
        },
    ]
    targets: [
        {
            name: string
            ip: string
            port: number
        },
    ]
}

let sourceSockets: any[] = []
let targetSockets: any[] = []
let connectionList: number[] = []

let mtx: mtx
try {
    mtx = JSON.parse(fs.readFileSync(path.resolve('storage', 'default-mtx.JSON')))
} catch (error) {
    console.log('Couldn´t read default-mtx.JSON file')
}

export const initProxy = () => {
    process.on('uncaughtException', (error) => {
        console.error('UncaughtExption setting up proxy :', error)
    })

    connectToTargets()
    let sourcePort = 9923
    const server = net.createServer((sourceSocket: any) => {
        sourceSockets.push(sourceSocket)
        console.log('Number of Clients connected', sourceSockets.length)
        let targetIndex = 0

        mtx.sources.forEach((sourceItem: any, index: number) => {
            if (sourceSocket.remoteAddress.includes(sourceItem.ip)) {
                targetIndex = connectionList[index]
            }
        })

        sourceSocket.on('data', (data: any) => {
            //console.log('Writing data to Target Socket :', data)
            if (targetSockets[targetIndex] != undefined) {
                targetSockets[targetIndex].write(data)
            }
        })

        targetSockets[targetIndex].on('data', (data: any) => {
            //console.log('Writing data to Source Socket :', data)
            if (sourceSocket != undefined) {
                sourceSocket.write(data)
            }
        })

        sourceSocket.on('close', (had_error: any) => {
            console.log('Source connection has ended', sourceSocket.remoteAddress)
            sourceSockets = sourceSockets.filter((item) => {
                return item.remoteAddress != undefined
            })
        })
    })

    server.listen(sourcePort)

    console.log('Proxy listening to ', sourcePort, 'and sending out to ', targetSockets[0].remotePort)
}

const connectToTargets = () => {
    mtx.targets.forEach((mtxTarget: any, index: number) => {
        targetSockets.push(new net.Socket())
        connectTarget(index, mtxTarget.port, mtxTarget.ip)
        targetSockets[index].on('end', () => {
            setInterval(() => {
                console.log('Reconnecting to Target')
                connectTarget(index, mtxTarget.port, mtxTarget.ip)
            }, 5000)
        })
    })
}

const connectTarget = (index: number, port: number, host: string) => {
    targetSockets[index].connect(port, host)
}

export const setMtx = (source: string, target: string) => {
    let sourceIndex = 0
    mtx.sources.forEach((item: any, index: number) => {
        if (item.name === source) {
            sourceIndex = index
        }
    })
    let targetIndex = 0
    mtx.targets.forEach((item: any, index: number) => {
        if (item.name === target) {
            targetIndex = index
        }
    })
    if (connectionList.length < sourceIndex + 1) {
        connectionList.push(targetIndex)
    } else {
        connectionList[sourceIndex] = targetIndex
    }
    console.log('Connection List : ', connectionList )
}
