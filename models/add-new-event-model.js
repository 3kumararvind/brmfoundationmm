const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

//add event details Schema
const addEventDetailsSchema = new Schema({
  event_name:{
    type:String,
    unique:[true, "Event already exists. Event cannot be duplicate."],
    uppercase: true
  },
  event_category :{
    type: String,
    required: [true,"Event category is required."],
    uppercase: true
  },
  junior_group :{
    type: String,
    uppercase: true
  },
  senior_group :{
    type: String,
    uppercase: true
  },
  super_senior_group :{
    type: String,
    uppercase: true
  }
});

addEventDetailsSchema.plugin(AutoIncrement, {inc_field: 'event_id'});

//add event model
const event_details = new mongoose.model("event_details", addEventDetailsSchema);

module.exports = event_details;
