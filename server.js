"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var timeout = require("connect-timeout");
var express = require("express");
var Server = /** @class */ (function () {
    function Server() {
        this.app = express();
        this.app.use(timeout("60s"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true,
        }));
        this.app.use(function (_req, res, next) {
            // console.log(_req.body);
            res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT");
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Content-Type, QualityUuid");
            res.header("Access-Control-Max-Age", "86400");
            next();
        });
        this.app.use(function (err, _req, res, next) {
            res.status(err.status || 500);
            res.json({
                error: err,
                message: err.message,
            });
            next(err);
        });
    }
    Server.prototype.start = function () {
        this.initRoutes();
        this.app.listen(9999);
        console.log("Listening on port 9999...");
    };
    Server.prototype.initRoutes = function () {
        var router;
        router = express.Router();
        router.get("/api/test", function (_req, res) {
            res.status(200).json("Test");
        });
        this.app.use(router);
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map