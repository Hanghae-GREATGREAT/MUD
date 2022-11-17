"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.status(200).render('home.html');
});
router.get('/front', (_, res) => {
    res.render('front.html');
});
router.get('/main', (req, res) => {
    res.render('main.html');
});
exports.default = router;
