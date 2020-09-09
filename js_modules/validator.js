const express = require('express');

//function to validate mobile number
validateMobile = function(mobNumber){
  if(mobNumber.toString().length==10){
    return true;
  }else{
    return false;
  }
}
//end of validateMobile

module.exports={
  validateMobile:validateMobile
}
