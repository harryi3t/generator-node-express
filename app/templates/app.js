'use strict';

process.title = 'my.api';
module.exports = createExpressApp;

var glob = require('glob');
var async = require('async');
var _ = require('underscore');
var express = require('express');
var mongoose = require('mongoose');
var DB_URL = process.env.DB_URL || 'localhost/test';

// To allow more than five calls at a time:
require('http').globalAgent.maxSockets = 10000;

require('./common/logger.js');
require('./common/ActErr.js');
require('./common/express/sendJSONResponse.js');
require('./common/express/sendXMLResponse.js');
require('./common/respondWithError.js');

var ignoreEADDRINUSE = false;

global.util = require('util');

if (require.main === module) {
  global.app = express();
  createExpressApp(process.env.DB_URL);
  module.exports = global.app;
}

process.on('uncaughtException', function (err) {
  if (ignoreEADDRINUSE && err.errno === 'EADDRINUSE') {
    return;
  }
  logger.error('Uncaught Exception thrown.', err);
});

function createExpressApp() {
  var bag = {};
  bag.who = 'api.js|createExpressApp';
  logger.verbose('Starting', bag.who);

  async.series([
      _setupMiddlewares.bind(null, bag),
      _connectToMongo.bind(null, bag),
      _requireRoutes.bind(null, bag),
      _startListening.bind(null, bag)
    ],
    function (err) {
      logger.verbose('Completed', who);

      if (err)
        logger.error(err.message, err);
    }
  );
}

function _setupMiddlewares(next) {
  var who = bag.who + '|' + _setupMiddlewares.name;
  logger.verbose('Starting', who);

  // Set up morgan and mongoose logging only if we're running in dev mode
  if (process.env.RUN_MODE === 'dev') {
    app.use(require('morgan')('dev'));
    mongoose.set('debug', true);
  }

  app.use(require('body-parser').json({limit: '10mb'}));
  app.use(require('body-parser').urlencoded({limit: '10mb'}));
  app.use(require('cookie-parser')());
  app.use(require('method-override')());

  return next();
}

function _connectToMongo(next) {
  mongoose.connect(DB_URL, {},
    function (err) {
      if (!err)
        logger.info('MongoDB: ' + DB_URL + ' connected.');
      return next(err);
    }
  );
}

function _requireRoutes(app, next) {
  var who = 'app.js|' + _requireRoutes.name;
  logger.debug('Inside', who);

  logger.info('Initializing routes');

  glob.sync('./**/*Routes.js').forEach(
    function (routeFile) {
      require(routeFile)(app);
    }
  );

  return next();
}

function _removeStaleRoutePermissions (bag, next) {
  var who = 'app.js|' + _removeStaleRoutePermissions.name;
  logger.debug('Inside', who);

  async.each(bag.staleRoutePermissions, function (srp, done) {
    var query = {
      routePattern: srp.routePattern,
      httpVerb: srp.httpVerb
    };
    RoutePermissionModel.remove(query, function (err) {
      return done(err);
    });
  },
  function (err) {
    return next(err);
  });
}

function _startListening(app, next) {
  var who = 'app.js|' + _startListening.name;
  logger.debug('Inside', who);

  var apiPort = config.apiPort;
  var tries = 0;
  ignoreEADDRINUSE = true;
  listen();
  function listen(error) {
    if (!apiPort)
      return next(
        new ActErr(who, ActErr.InternalServer,
          'Failed to start server.', new Error('Invalid port.'))
      );
    if (!error) {
      try {
        app.listen(apiPort, '0.0.0.0',
          _logServerListening.bind(null, apiPort, listen));
      } catch (err) {
        error = err;
      }
    }
    if (error) {
      if (tries > 3) {
        ignoreEADDRINUSE = false;
        var errMessage = 'Shippable API unable to listen: ' + apiPort;
        return next(
          new ActErr(who, ActErr.InternalServer, errMessage, error)
        );
      }
      tries += 1;
      listen();
    }
  }
}

function _logServerListening(port, listen, err) {
  var url = '0.0.0.0:' + port;
  if (err) return listen(err);
  logger.info('Shippable API started on %s.', url);
  ignoreEADDRINUSE = false;
}
