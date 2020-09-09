const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const PaymentDetailSchema = new Schema({
  user_id:{
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
  payment_date:{
    type:Date,
    default: Date.now
  },
  payment_current_status:{
    type: String,    
    uppercase: true
  },

  total_amount:{
    type: Number,
    required:[true, "Total amount is required."]

  },
  discount_amount: {
    type: Number,
    required:true
  },
  net_payable_amount:{
    type: Number,
    required: true

  },
  coordinator_id:{
    type:Number,
  },
  coordinator_verification_date:{
    type:Date,
  },
  final_approve_date:{
    type: Date
  },
  final_approver:{
    type: String,
    uppercase: true
  }

});

PaymentDetailSchema.plugin(AutoIncrement, {inc_field: 'payment_id'});

//add event model
const payment_details = new mongoose.model("payment_details", PaymentDetailSchema);

module.exports = payment_details;
