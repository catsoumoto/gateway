"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var timeout = require("connect-timeout");
var express = require("express");
var amqplib = require("amqplib");
var Server = /** @class */ (function () {
    function Server() {
        this.rabConnection = amqplib.connect('amqp://fravaud:BBjakmlc100489@rabbitserver');
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
            console.log(_req.header);
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
        var _this = this;
        var router;
        router = express.Router();
        router.get("/api/test", function (_req, res) {
            var uuid = _this.uuid();
            _this.rabConnection
                .then(function (conn) { return conn.createChannel(); })
                .then(function (ch) {
                return ch.assertQueue("worker")
                    .then(function (ok) { return ch.sendToQueue("worker", { uuid: uuid }); });
            }).catch(function (err) { return console.warn(err); });
            /*this.rabConnection.publish("worker", {uuid});*/
            _this.rabConnection
                .then(function (conn) { return conn.createChannel(); })
                .then(function (ch) {
                return ch.assertQueue(uuid)
                    .then(function (ok) { return ch.consume(uuid, function (msg) {
                    if (msg !== null) {
                        console.log(msg.content.toString());
                        ch.ack(msg);
                    }
                }); });
            }).catch(function (err) { return console.warn(err); });
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
    };
    Server.prototype.uuid = function () {
        var s4 = function () { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); };
        var date = function () { return (new Date()).getTime().toString(36); };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + (s4() + s4() + s4()) + "-" + date();
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map