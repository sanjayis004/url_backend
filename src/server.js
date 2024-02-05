const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const config = require('./configs/index.js')
const routes = require('./routes/index.js')
const mysql = require('./helpers/mysql.js')
const cors = require('cors')
const helmet = require('helmet')
const os = require('os')
const cluster = require('cluster')
const rateLimit = require('express-rate-limit');
const PORT = process.env.PORT || 8754

if (cluster.isMaster) {
    const n_cpus =  config.env === 'testing' ? 1 :  os.cpus().length
    for (let i=0; i<n_cpus; i++){
        cluster.fork()
    }
} else {
    global.mysql = mysql
    const corsOptions = {
        origin: '*', // Specify your client's origin
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, // Include cookies
        optionsSuccessStatus: 204, // Respond with 204 for preflight requests
    };
    app.use(cors(corsOptions))
    app.use(bodyParser.json())
    
    const limiter = rateLimit({
        windowMs: 60 * 1000 * 15, 
        max: 1000,
        keyGenerator: (req) => {
            return req.ip; 
        },
        message: 'Too many requests from this IP, please try again later.',
    });
    // Apply the rate limiter to all requests
    app.use(limiter);
   
    app.use(helmet())
    app.use('/', routes)
    app.listen(PORT, () => {
        console.log("process-id",process.pid)
        console.log("server running at: ", PORT)
    })
}