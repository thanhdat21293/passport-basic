/**
 * Created by techmaster on 1/17/17.
 */
const path      = require("path");
const env       = process.env.NODE_ENV || "development";
const config    = require(path.join(__dirname, 'config', 'config.json'))[env];
const pgp = require('pg-promise')();

const cn = {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password
};

module.exports.db = pgp(cn);

module.exports.config = config;