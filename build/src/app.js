"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_env_1 = __importDefault(require("./config.env"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socket_routes_1 = __importDefault(require("./socket.routes"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const connection_1 = __importDefault(require("./db/config/connection"));
const associate_1 = __importDefault(require("./db/config/associate"));
const api_routes_1 = __importDefault(require("./api.routes"));
const page_routes_1 = __importDefault(require("./page.routes"));
const errorhandlers_1 = __importDefault(require("./middlewares/errorhandlers"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: '*',
    }
});
io.use((socket, next) => { next(); });
// io.use(SocketMiddleware)
io.on('connection', socket_routes_1.default);
if (config_env_1.default.NODE_ENV !== 'test') {
    connection_1.default.authenticate().then(() => {
        (0, associate_1.default)();
        console.log('DB CONNECTED');
    }).catch((error) => {
        console.error(error);
        console.log('DB CONNECTION FAIL');
        process.exit(0);
    });
}
app.set('views', path_1.default.join(__dirname, 'views'));
app.engine('html', ejs_1.default.renderFile);
app.set('view engine', 'ejs');
app.use(express_1.default.static('public'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'views', 'public')));
app.use(express_1.default.json());
app.use('/', page_routes_1.default);
app.use('/api', api_routes_1.default);
app.use(errorhandlers_1.default.logger, errorhandlers_1.default.handler);
exports.default = httpServer;
