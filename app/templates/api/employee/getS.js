'use strict';

module.exports = getS;

var async = require('async');
var empModel = require('./Model.js');

function getS(req, res) {
  var bag = {
    resBody: [],
    who: 'employee|getS'
  };

  logger.info('Starting', bag.who);

  async.series([
      _mongoQuery.bind(null, bag),
    ],
    function (err) {
      if (err) {
        logger.error(err);
        return res.err(err);
      }

      logger.info('Completed', bag.who);
      return res.json(bag.resBody);
    }
  );
}

function _mongoQuery(bag, next) {
  var who = bag.who + '|' + _mongoQuery.name;
  logger.verbose('Inside', who);

  empModel.find({},
    function (err, employees) {
      bag.resBody = employees;
      return next(err);
    }
  );
}