const httpProxy = require('http-proxy')
const http = require('http')

import { expressInit } from './expressHandler'
import { initProxy } from './proxyHandler'

expressInit()
initProxy()

