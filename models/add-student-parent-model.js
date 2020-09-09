const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addParentDetailSchema = new Schema({
  user_id: {
    type: Number,
    unique:[true, 'Duplicate parent details are not allowed']
  },
  f_fname:{
    type: String,
    uppercase: true
  },
  f_mname: {
    type: String,
    uppercase: true
  },
  f_lname:{
    type: String,
    uppercase: true
  },
  m_fname:{
    type: String,
    uppercase: true
  },
  m_mname:{
    type:String,
    uppercase: true
  },
  m_lname:{
    type: String,
    uppercase: true
  },
  parents_contact: {
    type: Number,
    validate:{
      validator : function(v){
        return /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },

  }
});

//models
const parentDetail = new mongoose.model("parent_detail", addParentDetailSchema );
module.exports = parentDetail;
