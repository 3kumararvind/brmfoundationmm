const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const CoordinatorPaymentDetailSchema = new Schema({
  coordinator_id:{
    type: Number,
    required: true
  },
  upi_ref_number:{
    type: Number
    },
  payment_mode:{
    type: String,
    required: true,
    uppercase:true
  },
  student_id:{
    type: Number,
    required: true
  },
  payment_date:{
    type:Date,
    default: Date.now
  },
  amount:{
    type: Number,
    required:[true, "Total amount is required."]

  }


});

CoordinatorPaymentDetailSchema.plugin(AutoIncrement, {inc_field: 'coordinator_payment_id'});

//add event model
const coordinator_payment_details = new mongoose.model("coordinator_payment_details", CoordinatorPaymentDetailSchema);

module.exports = coordinator_payment_details;
