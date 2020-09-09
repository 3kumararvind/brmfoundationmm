const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CoordinatorDeletedPaymentDetailSchema = new Schema({
  coordinator_id:{
    type: Number,
    required: true
  },
  coordinator_payment_id:{
    type:Number
  },
  student_id:{
    type: Number,
    required: true
  },
  amount:{
    type: Number

  },
  upi_ref_number:{
    type: String
    },
  payment_mode:{
    type: String,
    required: true,
    uppercase:true
  },
  payment_date:{
    type:Date,
    default: Date.now
  }

});

//add event model
const coordinator__deleted_payment_details = new mongoose.model("coordinator_deleted_payment_detail", CoordinatorDeletedPaymentDetailSchema);

module.exports = coordinator__deleted_payment_details;
