'use strict';

var mongoose = require('mongoose');

var empSchema = new mongoose.Schema({
  sno: {
    type: Number,
    require: true
  },
  firstName: {
    type: String, require: true
  },
  lastName: String,
  category: {
    enum: ['sda-1', 'sda-2', 'manager'],
    default: 'sda-1'
  }
});

var empModel = mongoose.model('expense', empSchema);

module.exports = empModel;