const morgan = require('morgan');
const express = require('express');
var responseTime = require('response-time');
const {influx, Point} = require('../core/database/influx');

module.exports = function (app) {
    app.disable('x-powered-by');
    app.enable('trust proxy');
    //app.use(morgan('combined'));
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());

    app.use(responseTime(function (req, res, time) {
      let originalUrl = req.originalUrl;

      if (originalUrl.indexOf("/api/") == -1)
        return;

      if (originalUrl.indexOf("/api/avatar/info") != -1)
        originalUrl = "/api/avatar/info/:avatarIdHash";

      if (originalUrl.indexOf("/api/keyed/") != -1)
        return;

      influx.writePoint(new Point('requests_time')
        .tag('path', originalUrl)
        .floatField('response_time', time)
        .timestamp(new Date()));

      influx.writePoint(new Point('requests')
        .tag('path', originalUrl)
        .tag('method', req.method)
        .intField('value', 1)
        .timestamp(new Date()));
    }));
}
