//jshint esversion 6
const express = require("express");
const mongoose = require('mongoose');
const schema = mongoose.Schema;

//stduent academic details schema
const studentAcademicSchema = new schema({
  user_id :{
    type: Number,
    unique: [true, "User already exists."]
  },
  class : Number,
  dob : Date,
  organisation_id : Number,
  gender:{
    type: String
  }
});

//student academic models

const studentAcademicDetail = new mongoose.model("student_Academic_Detail", studentAcademicSchema);
module.exports = studentAcademicDetail;
