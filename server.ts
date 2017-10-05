import * as  bodyParser from "body-parser";
import * as timeout from "connect-timeout";
import * as express from "express";

export class Server {
    public app: express.Application;

    constructor() {
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
            res.status(200).json("Test");
        });

        this.app.use(router);
    }
}
