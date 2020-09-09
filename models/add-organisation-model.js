const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);
//Organisation Schema

const organisationSchema = new Schema({
  organisation_name:{
    type: String,
    required:[true, "Organisation name field cannot be empty"],
    uppercase: true
  },
  organisation_address:{
    type: String,
    required:[true, "Organisation address field cannot be empty"],
    uppercase: true
  },
  organisation_district : {
    type:String,
    required:[true, "Organisation district field cannot be empty"],
    uppercase: true
  },
  organisation_state:{
    type:String,
    required:[true, "Organisation state field cannot be empty"],
    uppercase: true
  },
  organisation_pin_code:{
    type:Number,
    required:[true, "Organisation pin field cannot be empty"]
  },
  organisation_country:{
    type: String,
    required:[true, "Country field cannot be empty"],
    uppercase: true
  }
});


//organisation unique ID
organisationSchema.plugin(AutoIncrement, {inc_field: 'organisation_id'});
//organisation model
const organisationDetail = new mongoose.model("organisation_detail", organisationSchema);
module.exports = organisationDetail;
