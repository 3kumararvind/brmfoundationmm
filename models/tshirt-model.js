//jshint esversion 6
const express = require("express");
const mongoose = require('mongoose');
const schema = mongoose.Schema;

//tshirt schema
const tshirtSchema = new schema({
  student_id :{
    type: Number
  },
  tshirt_required:{
    type:String,
    uppercase: true},
  tshirt_size:{
    type:String,
  uppercase: true}
});

//student academic models

const tShirtDetail = new mongoose.model("tshirt_Detail", tshirtSchema);
module.exports = tShirtDetail;
