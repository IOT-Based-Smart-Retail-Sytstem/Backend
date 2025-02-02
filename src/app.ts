require('dotenv').config()

import express from 'express'
import config from 'config'
import connectToDb from './utils/connectToDb';
import log from './utils/logger';
import router from './routes'
import {errorHandler} from './middlware/error.handler';


const app  = express()

app.use(express.json())
app.use(router)

app.use(errorHandler)


const port  = config.get("port");

connectToDb().then(() => {
    app.listen(port, () => {
        log.info(`Server is running at http://localhost:${port}`)
    })
}).catch((e) => {
    log.error(e)
    process.exit(1)
})