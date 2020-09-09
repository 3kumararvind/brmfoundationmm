const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventRegistrationSchema = new Schema({
  user_id :{
    type: Number,
    unique:[true, "You are already registered."]
  },
  participating_category:[],
  student_group:{
    type: String
  },
  individual_events:[],
  group_events:[],
  coordinator_id: Number,
  participating_through_coordinator: String,
  team_members :{
    type: String,
    uppercase: true
  },
  year:{
    type: Number
  }
});

const eventRegistration = mongoose.model('student_event_registration', eventRegistrationSchema);
module.exports = eventRegistration;
