import * as  bodyParser from "body-parser";
import * as timeout from "connect-timeout";
import * as express from "express";
import * as amqplib from "amqplib"

export class Server {
    public app: express.Application;
    public rabConnection: any;

    constructor() {
        this.rabConnection = amqplib.connect('amqp://fravaud:BBjakmlc100489@rabbitserver');
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
            console.log(_req.header);
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
        this.app.listen(9999);
        console.log("Listening on port 9999...");
    }

    public initRoutes() {
        let router: express.Router;
        router = express.Router();

        router.get("/api/test", (_req, res) => {  
            let uuid = this.uuid();

            this.rabConnection
                .then((conn) => conn.createChannel())
                .then((ch) => {
                    return ch.assertQueue("worker")
                        .then((ok) => ch.sendToQueue("worker", {uuid}));
                }).catch((err) => console.warn(err));

            /*this.rabConnection.publish("worker", {uuid});*/
            this.rabConnection
                .then((conn) => conn.createChannel())
                .then((ch) => {
                    return ch.assertQueue(uuid)
                        .then((ok) => ch.consume(uuid, (msg) => {
                            if (msg !== null) {
                                console.log(msg.content.toString());
                                ch.ack(msg);
                            }
                        }));
                }).catch((err) => console.warn(err));
                
            /*this.rabConnection.queue(uuid, {autoDelete: false}, function (q) {
                console.log('Queue ('+ uuid +') Connect');
                q.bind('#');
                
                q.subscribe(function (message) {
                    console.log(message);
                    res.status(200).json(message);
                    q.detroy();
                })
            });*/
        });

        this.app.use(router);
    }

    public uuid() {
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        const date = () => (new Date()).getTime().toString(36);
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}-${date()}`;
    }
}
