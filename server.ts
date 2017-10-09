import * as  bodyParser from "body-parser";
import * as timeout from "connect-timeout";
import * as express from "express";
import * as amqp from "amqp";

export class Server {
    public app: express.Application;
    public rabConnection: any;

    constructor() {
        this.rabConnection = amqp.createConnection({ 
            host: 'rabbitserver'
            , login: 'fravaud'
            , password: 'BBjakmlc100489' });
        this.app = express();
        this.app.use(timeout("60s"));
        this.app.use( bodyParser.json() );
        this.app.use(bodyParser.urlencoded({
            extended: true,
        }));

        this.app.use((_req, res, next) => {
            // console.log(_req.body);
            res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT");
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Content-Type, QualityUuid");
            res.header("Access-Control-Max-Age", "86400");
            console.log(_req);
            next();
        });

        this.app.use((err, _req, res, next) => {
            res.status(err.status || 500);
            res.json({
                error: err,
                message: err.message,
            });
            next(err);
        });

    }
    public start() {
        this.initRoutes();
        this.rabConnection.on('ready', function() {
            console.log('Rabbit Connect!!');
        });
        this.app.listen(9999);
        console.log("Listening on port 9999...");
    }

    public initRoutes() {
        let router: express.Router;
        router = express.Router();

        router.get("/api/test", (_req, res) => {  
            let uuid = this.uuid();
            this.rabConnection.publish("worker", {uuid});
            this.rabConnection.queue(uuid, function (q) {
                console.log('Queue ('+ uuid +') Connect');
                q.bind('#');
                
                q.subscribe(function (message) {
                    console.log(message);
                    res.status(200).json(message);
                    q.detroy();
                })
            });
        });

        this.app.use(router);
    }

    public uuid() {
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        const date = () => (new Date()).getTime().toString(36);
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}-${date()}`;
    }
}
