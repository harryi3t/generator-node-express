'use strict';

module.exports = post;

var async = require('async');
var empModel = require('./Model.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    who: 'expense|post'
  };

  logger.info('Starting', bag.who);

  async.series([
      _checkInputParams.bind(null, bag),
      _post.bind(null, bag)
    ],
    function (err) {
      if (err) {
        logger.error(err);
        return res.status(500).json(err);
      }

      logger.info('Finished', bag.who);
      return res.json(bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose('Inside', who);

  if (!bag.reqBody)
    return next('body not found');
  if(!bag.reqBody.category)
    return next('category not found');
  if(!bag.reqBody.date)
    return next('date not found');
  if(!bag.reqBody.type)
    return next('type not found');
  if(!bag.reqBody.amount)
    return next('amount not found');
  return next();
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose('Inside', who);

  empModel.create(bag.reqBody,
    function (err, expense) {
      console.log('err',expense);
      console.log('expense',expense);
      if(err)
        return next(err);

      bag.resBody = expense;
      return next();
    }
  );
}