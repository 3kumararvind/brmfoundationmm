//jshint esversion 6
const express = require("express");
//body Parser
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose  = require('passport-local-mongoose');
const LocalStrategy = require('passport-local').Strategy;
flash = require('connect-flash');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const AutoIncrement = require('mongoose-sequence')(mongoose);
const helmet = require('helmet');
//importing studentAcademicDetail model
const studentAcademicDetail = require('./models/student-academic-details-model');
//importing organisation details models
const organisationDetail = require('./models/add-organisation-model');
//importing add-new-event-model
const eventDetail = require('./models/add-new-event-model');
//importing parent model
const parentDetail = require('./models/add-student-parent-model');


//importing model for event registration
const eventRegistration = require('./models/event-registration-model');

//importing model for payment details
const paymentDetail = require('./models/payment-details-model');
const coordinatorPayment = require('./models/coordinator-payment-model');
const tshirtDetail = require('./models/tshirt-model');
const coordinatorDeletedPayment = require('./models/coordinator-deleted-payment-model');

//impoting JS validator module
const validator = require('./js_modules/validator');
const constValues = require('./js_modules/constant-values');
const router = express.Router();
//Picture Gallery
var picGallery = require('express-photo-gallery');
const app = express();

//app.use(cookieParser());
//session management
 const {

	sessSecret = 'qwewerwertrretrerte3453werwrwerew'
 } = process.env
app.use(express.json());
app.use(session({
	resave:false,
	secret: sessSecret,
	saveUninitialized: false,
  cookie: {
		 maxAge: 60*60000, //1 hr
		 sameSite: true,
		 secure:false
	 }
}))
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(flash());
app.use(helmet());

// caching disabled for every route
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


 mongoose.connect("mongodb+srv://userName:password@cluster0-ojctd.mongodb.net/dbName", {useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify: false});
//end connect


app.listen(process.env.PORT || 3000, function(){
	console.log("Server has started");
});

//static folders


//Pic Gallery
var picGalleryOptions = {
  title: 'BRM Foundation Picture Gallery'
};
app.use('/picture-gallery', picGallery('public/images/picture-gallery', picGalleryOptions));

//body Parser

//setting ejs view engine
app.set("view engine", "ejs");

app.get("/", function(req, res){
	res.render("index");
});
app.get("/who-we-are", function(req, res){
	res.render("who-we-are.ejs");
});
app.get("/members", function(req, res){
	res.render("members");
});
app.get("/mission", function(req, res){
	res.render("mission");
});
app.get("/our-unit", function(req, res){
	res.render("our-unit");
});


app.get("/contact", function(req, res){
	res.render("contact");
});
app.get("/donate", function(req, res){
	res.render("donate");
});

//start of picture Gallery

app.get("/picture-gallery", function(req, res){
	res.render("picture-gallery");
});
//End of picture gallery

//start of video Gallery
app.get("/video-gallery", function(req, res){
	res.render("video-gallery");
});

app.get("/media-corner", function(req, res){
	res.render("media-corner");
});

app.get("/interschool-carnival", function(req, res){
  eventsListJson = [];
  let juniorGroupEventList = [];
  let seniorGroupEventList = [];
  let superSeniorGroupEventList = [];
  let counter=0;
  eventDetail.find().sort({event_name:1})
    .exec(function (err, events) {
    if(err){
      console.log(err);
    }else{
      events.forEach(function(event){
        counter++;
        if(event.junior_group == "YES"){
          juniorGroupEventList.push(event.event_name);
        }
        if(event.senior_group == "YES"){
          seniorGroupEventList.push(event.event_name);
        }
        if(event.super_senior_group == "YES"){
          superSeniorGroupEventList.push(event.event_name);
        }
        eventsListJson.push(event.event_name);
        if(events.length==counter){
          res.render("interschool-carnival",{juniorGroupEventList:juniorGroupEventList, seniorGroupEventList:seniorGroupEventList, superSeniorGroupEventList:superSeniorGroupEventList });
        }
      });
    }
  })

});
router.get("/isc-2k19-selfie-photography-contest", function(req, res){
    res.render("isc-2k19-selfie-photography-contest");
});
//validation whether user is logged in or not. If not logged in redirect to login page

const redirectLogin = (req, res, next)=>{
  if(!req.isAuthenticated()){
  		res.redirect("login");
	}else{
		next();
	}
}

router.get("/register", function(req, res){
  errMsg=[];
	res.render("register",{errorMessage:errMsg});
});

mongoose.set('useCreateIndex', true);
//User registration schema
const userRegistrationSchema = new mongoose.Schema({
	fname:{
		type:String,
		required:[true,"Students must have first name"],
    uppercase: true
	},
	mname:{
		type: String,
    uppercase: true
	},
	lname:{
		type: String,
    uppercase: true
	},
	username:{
     type: String,
     unique:true
  },
  userid:{
    type:Number,
    default:100
  },
  usercategory:{
    type: String
  },
	password:{
    type:String,
    minlength: 6
  },
  whatsAppNumber:{
    type:Number
  },
	mobilenumber:Number,
	email:{
    type: String,
    lowercase: true
  },
	securityquestion:String,
	securityanswer:{
    type: String,
    uppercase: true
  },
  account_creation_date:{
    type:Date
  },
  userverificationstatus:String,
  registeredby:{
    type:Number
  },
  approved_by:{
    type:String,
    uppercase:true
  },
  approved_date:{
    type:Date
  }
});

userRegistrationSchema.plugin(passportLocalMongoose);

//creating index
//userRegistrationSchema.index({username: 1}, {unique: true});
userRegistrationSchema.plugin(AutoIncrement, {inc_field: 'rank'});
//User registration modal
const userDetail = new mongoose.model("userDetail",userRegistrationSchema);

passport.use(userDetail.createStrategy());
passport.serializeUser(function(user, done){
  done(null, user);
});
passport.deserializeUser(function(user, done){
  done(null, user);
});
passport.use( new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true },
            function(req, username, password, done){
            userDetail.findOne({username:username}, function(err, doc){
              if(err){
                return done(err);
              }else{
                if(doc){
                  var valid = bcrypt.compareSync(password, doc.password);
                  if(valid){
                    let fullName;
                    if(doc.fname && doc.mname && doc.lname){
                      fullName = doc.fname + " " + doc.mname + " " + doc.lname;
                    }else{
                      fullName= doc.fname + " " + doc.lname;
                    }
                    return done(null, {username:doc.username, fullName:fullName, usercategory:doc.usercategory, userverificationstatus:doc.userverificationstatus});
                  }else{
                    loginErrMsg=[];
                    loginErrMsg.push('Incorrect username/passwordss.');
                    return done(null, false, { message: 'Incorrect username/passwordss.' });
                  }
                }else{
                    loginErrMsg=[];
                    loginErrMsg.push('Incorrect username/password.');
                   return done(null, false);
                }
              }
      })
}))

router.post("/register", function(req, res){
	firstName = req.body.fname;
	middleName = req.body.mname;
	lastName = req.body.lname;
	userName = req.body.uname;
  userCategory = req.body.userCategory;
	password1 = req.body.password;
	password2 = req.body.pwd2;
  whatsAppNumber = req.body.whatsAppNumber;
	mobileNumber = req.body.mobileno;
	userEmail = req.body.email;
	securityQues = req.body.securityquestion;
	securityAns = req.body.securityanswer;

  if(userCategory === "Coordinator" || userCategory === "Admin" ){
    userVerStatus = "Not Verified";
  }else{
    userVerStatus="Auto verified";
  }
  var telRegex = "[6789]{1}[0-9]{9}";
  var mobFlag;
  if(mobileNumber.match(telRegex)){
    mobFlag=true;
  }else{
    mobFlag=false;
  }
  if(mobileNumber.length!=10 || mobFlag===false  ){
    errMsg=[];
    errMsg.push("Invalid mobile number! Mobile number should have 10 digits.");
    res.render("register", {errorMessage:errMsg});
  }else{
    if(password1===password2 && password1.length >5){
      userDetail.findOne().sort({userid:-1})  // give me the max
        .exec(function (err, Id) {
          if(err)
          console.log(error);
          else{
                let lastMaxUserId = Id.userid
                userDetail.findOne({username:userName}, function(err, doc){
                  if(err){
                    console.log(err);
                  }else{
                    if(doc){
                      errMsg=[];
                      errMsg.push("The username already exists. Please try with different username again.");
                      res.render("register", {errorMessage:errMsg});
                    }else{
                      hashPassword = bcrypt.hashSync(password1, bcrypt.genSaltSync(10));
                      const User = new userDetail({
                        fname: firstName,
                  			mname: middleName,
                  			lname: lastName,
                  			username: userName,
                        userid:lastMaxUserId+1,
                        usercategory: userCategory,
                  			password: hashPassword,
                        whatsAppNumber:whatsAppNumber,
                  			mobilenumber: mobileNumber,
                  			email: userEmail,
                        account_creation_date:Date.now(),
                  			securityquestion: securityQues,
                  			securityanswer:securityAns,
                        userverificationstatus: userVerStatus,
                      })
                      User.save(function(err, user){
                        if(err){
                          console.log(err);
                        }else{
                          res.render("registration-success", {registrationId:user.userid});
                        }
                      })

                    }
                  }
                });
            }
  			//end of else
  	  });
    //end of .exec function
    }else{
      if(password1.length<=5){
        errMsg=[];
        errMsg.push("Password should have minimum 6 characters.")
      }else {
          errMsg=[];
          errMsg.push("Password mismatched. Please try again.");
      }
      res.render("register",{errorMessage:errMsg});
    }
  }
 //end of if

});

router.get("/login",  function(req, res){
	res.render("login", {loginErr:loginErrMsg});
});

var loginErrMsg = [];
var successMsg = [];
var errMsg=[];

router.post("/login", passport.authenticate('local', {failureRedirect: '/login' }), function(req, res){
    let userCategory = req.user.usercategory;
    let userVerificationStatus = req.user.userverificationstatus;
    if(userCategory==="Student"){
      res.redirect("student-dashboard");
    }else if(userCategory==="Coordinator"){
      if(userVerificationStatus==="Verified"){
        res.redirect("coordinator-dashboard");
      }else{
        loginErrMsg=[];
        loginErrMsg.push("Your profile is not activated. Please contact technical team to verify your profile.");
        res.render("login", {loginErr:loginErrMsg});
      }
    }else if(userCategory==="Admin"){
      if(userVerificationStatus==="Verified"){
        res.redirect("admin-dashboard");
      }else{
        loginErrMsg=[];
        loginErrMsg.push("Your profile is not activated. Please contact technical team to verify your profile.");
        res.render("login", {loginErr:loginErrMsg});
      }
    }

});
//end of login post



//password reset
router.get("/security-question/:uname", function(req, res){
  let studentUserName = req.params.uname;
  userDetail.findOne({username:studentUserName}, function(err, student){
    if(err){
      console.log(err);
      res.send("Error occured");
    }else if(student == null){
      res.send("Sorry!!! You have entered wrong username. Please try again");
    }else{
      res.send(student.securityquestion);
    }
  });
});

router.get("/reset-password", function(req, res){
  errMsg=[];
  successMsg=[];
  res.render("reset-password", {errMsg:errMsg, successMsg:successMsg});
});


router.post("/reset-password", function(req, res){
  successMsg= [];
  errMsg= [];
  let userName= req.body.userName;
  let securityAns = req.body.securityanswer;
  let password = req.body.password;
  let password2 = req.body.password2;
  userDetail.findOne({username:userName}, function(err, user){
    if(err){
      console.log(err);
    }else{
      if(user.securityanswer == securityAns.toUpperCase()){
        if((password==password2) && (password.length>5 && password2.length>5)){
          bcrypt.hash(password, saltRounds, function(err, hashPassword) {
            userDetail.findOneAndUpdate({username:user.username}, {$set:{password:hashPassword}}, {new:true}, function(err, result){
              if(err){
                console.log(err);
              }else{
                successMsg.push("Your password updated succesfully.");
                res.render("reset-password", {successMsg:successMsg, errMsg:errMsg});
              }
            })
          });

        }else{
          errMsg.push("Error in password");
          res.render("reset-password", {successMsg:successMsg, errMsg:errMsg});
        }
      }else{
        errMsg.push("Your security answer didn't matched. Please try again.");
        res.render("reset-password", {successMsg:successMsg, errMsg:errMsg});
      }
    }
  });
});


app.get("/student-dashboard", redirectLogin,  function(req, res){
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log(err);
    }else{
      if(user.userverificationstatus==="Auto verified" && user.usercategory==="Student"){
        paymentDetail.findOne({user_id:user.userid}, function(err, paymentDetail){
          if(err){
            console.log(err);
          }else{
            let studentPaymentStatus;
            if(paymentDetail==null){
              studentPaymentStatus="Pending";
            }else{
              studentPaymentStatus="Done";
            }
            let userFullName;
            if(user.fname && user.mname && user.lname){
              userFullName = user.fname + " " + user.mname + " " + user.lname;
            }else{
              userFullName = user.fname + " " + user.lname;
            }
            res.render("student-dashboard", {loggedInUser:userFullName, loggedInUserCategory:user.usercategory, studentPaymentStatus:studentPaymentStatus});
          }

        });
      }else{
        res.redirect("logout");
      }
    }
  });

});

 //admin Dashboard
 app.get("/admin-dashboard", redirectLogin,  function(req, res){
   res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
   userDetail.findOne({username:req.user.username}, function(err, user){
     if(err){
       console.log(err);
       errMsg.push(err);
     }else{
       if(user.usercategory=="Admin" && user.userverificationstatus=="Verified"){
         res.render("admin-dashboard", {loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory});
       }else{
         res.redirect("/logout");
       }
     }
   });

 });


//add event
app.get("/add-event", redirectLogin,  function(req, res){
  errMsg = [];
  successMsg = [];
 res.render("add-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg, errorMessage:errMsg});
});

//add event post
app.post("/add-event", function(req, res){
  errMsg = [];
  successMsg = [];
    eventName = req.body.eventName;
    eventCategory = req.body.eventCategory;
    junior = req.body.eventForJuniorGroup;
    senior = req.body.eventForSeniorGroup;
    superSenior = req.body.eventForSuperSeniorGroup;
    //console.log(eventName);
    //checking event already exist in database or not
    eventDetail.findOne({event_name:eventName},function(err, eventExist){
      if(err){
        errMsg.push(err);
        res.render("add-event", {loggedInUser: req.user.fullName,loggedInUserCategory:req.user.usercategory, successMessage:successMsg, errorMessage:errMsg});
      }else if(eventExist){
        errMsg.push("Event already added!!!.");
        res.render("add-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg, errorMessage:errMsg});
      }else{
        const event= new eventDetail({
        event_name : eventName,
        event_category: eventCategory,
        junior_group: junior,
        senior_group: senior,
        super_senior_group: superSenior
        });
        event.save(function(err, result){
          if(err){
            errMsg.push("Failed to add event. Try again!");
            res.render("add-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg, errorMessage:errMsg});
          }else{
            successMsg.push("Event added successfully.")
            res.render("add-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg, errorMessage:errMsg});
          }
        });
      }
    });
    //end of eventDetail.findOne()
});

//add organisation
router.get("/add-organisation", redirectLogin, function(req, res){
  errMsg=[];
  successMsg=[];

  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log("err");
    }else{
      //access only for authorised Admin
      if(user.usercategory==="Admin" && user.userverificationstatus==="Verified"){
        successMsg=[];
          res.render("add-organisation", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg, errorMessage:errMsg });
      }
      else{
  			return res.render("login", {loginErr:"You are not authorised to access this page"});
      }
    }
    //end of outer if-else
  });
  //end of userDetail.findOne()

})

router.post("/add-organisation", function(req, res){
  errMsg = [];
  successMsg=[];

  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log("err");
      res.render("add-organisation", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg});
    }else{
          organisationDetail.findOne({organisation_name:req.body.organisationName,organisation_address: req.body.organisationAddress }, function(err, organisationExist){
            if(organisationExist){

              //if organisation already exist in the database, send error message
              errMsg.push("Organisation already exists.")
              res.render("add-organisation", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg, errorMessage:errMsg});
            }else{
              const organisation = new organisationDetail({
                organisation_name: req.body.organisationName,
                organisation_address: req.body.organisationAddress,
                organisation_district: req.body.districtName,
                organisation_state: req.body.stateName,
                organisation_pin_code: req.body.organisationPin,
                organisation_country: req.body.countryName
              });
              organisation.save(function(err, result){
                if(err){
                  console.log(err);

                  errMsg.push(err)
                  res.render("add-organisation", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg, errorMessage:errMsg});
                }else {
                  //console.log("Added organisation details:"+ result);

                  successMsg.push("Organisation details added successfully.")
                  res.render("add-organisation", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg, errorMessage:errMsg});
                }

              });
              //end of organisation.save
            }
          });
          //end of organisationDetail.findOne()
    }
    //end of outer else
  });
  //end of userDetail.findOne()
});

//logout get
app.get("/logout", function(req, res){
  req.logout();
  loginErrMsg=[];
  successMsg=[];
  errMsg=[];
  res.render("logout");
})

//end of logout get


//Academic Details
router.get("/add-student-academic-details", redirectLogin, function(req, res){
  errMsg = [];
  successMsg = [];
  academicClassList = constValues.academicClass;
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      errMsg.push("Unable to featch user details.");
      res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations} );
    }else{
      //console.log("User Id:" + user.userid);
      studentAcademicDetail.findOne({user_id:user.userid}, function(err, studentAcademicExist){
        if(err){
          errMsg.push("You have already added your academic details.");
          res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations} );
        }else{
          organisationDetail.find().sort({organisation_name:1}).exec(function(err, organisations){
            if(err){
              errMsg.push("Error in loading organisation details.")
              res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations} );
            }else{
              //console.log("Student Exists within organistion : " );
              if(studentAcademicExist==null){
                res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations, studentAcademicExist:studentAcademicExist,academicClassList:academicClassList} );
              }
              else{
                res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations, studentAcademicExist:studentAcademicExist,academicClassList:academicClassList} );
              }
            }
         });
          //end of organisationDetail.find()
        }
        //end of else
      });
      //end of studentAcademicDetail.findOne() method
    }
    //end of else

  });
  //end of userDetailfindOne()
});
router.post("/add-student-academic-details", redirectLogin, function(req, res){
  errMsg = [];
  successMsg=[];
  userDetail.findOne({username:req.user.username}, function(err, user){
    let studentUserId = user.userid;
    const studentAcademic = new studentAcademicDetail({
      user_id : studentUserId,
      class: req.body.studentclass,
      dob: req.body.studentdob,
      gender: req.body.gender,
      organisation_id: req.body.organisationId
    });
    //end of studentAcademicDetail.findOne
    studentAcademicDetail.findOne({user_id:user.userid}, function(err, studentAcademicExist ){
      if(err){
        console.log("Error in student academic detail find One");

        errMsg.push("Error in fetching Student Academic Details");
        res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations} );
      }else{
        if(studentAcademicExist === null){
          organisationDetail.find().sort({organisation_name:1}).exec(function(err, organisations){
            if(err){
              errMsg.push("Error in loading organisation details.")
              res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations,studentAcademicExist:studentAcademicExist} );
            }else{
              studentAcademic.save(function(err, result){
                if(err){
                  console.log(err);
                  errMsg.push("Failed to save your academic details.");
                  res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations, studentAcademicExist:studentAcademicExist} );
                }else{
                  res.redirect("student-dashboard");
                }
              });
              //end of save
            }
         });
         //end of organisationDetail findOne()
      }else{
        //console.log("ASASAS" + studentAcademicExist);
        studentAcademicDetail.findOneAndUpdate({user_id:user.userid},{$set:{class:req.body.studentclass, dob:req.body.studentdob, gender: req.body.gender, organisation_id:req.body.organisationId}}, { new: true }, function(err, UpdateAcademicResult){
          if(err){
            console.log(err);
            successMsg.push("Error in Updating Academic Values.");
            res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations, studentAcademicExist:studentAcademicExist} );
          }{

            organisationDetail.find().sort({organisation_name:1}).exec(function(err, organisations){
              if(err){
                errMsg.push("Error in loading organisation list.");
                res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations, studentAcademicExist:studentAcademicExist} );
              }else{
                studentAcademicDetail.findOne({user_id:user.userid}, function(err, studentAcademicExist ){
                  if(err){
                    errMsg.push("Error in fetching updated academic details");
                    res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations, studentAcademicExist:studentAcademicExist} );
                  }
                  else{
                    successMsg.push("Yours academic details updated successfully.");
                    res.render("add-student-academic-details",{loggedInUser:req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, organisationList:organisations, studentAcademicExist:studentAcademicExist} );
                  }
                });

              }
            });
          }
          //end of else of  student studentAcademicDetail.findOneAndUpdate
        } );
      }
      }
      //end of external if
    });
  });
//end of userDetail.findOne()
});

//
router.get("/add-student-parent-details", redirectLogin, function(req, res){
  successMsg=[];
  errMsg = [];
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(user.usercategory=="Student"){
      parentDetail.findOne({user_id:user.userid}, function(err, parentDetailsExist){
        if(parentDetailsExist){
          res.render("add-student-parent-details", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory,successMessage:successMsg,  errorMessage:errMsg, parentDetailsExist : parentDetailsExist});
        }else{
          errMsg.push("Parents details not updated. Please update your parent details.");
          res.render("add-student-parent-details", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory,successMessage:successMsg,  errorMessage:errMsg, parentDetailsExist : parentDetailsExist});
        }
      });
      //end of parentDetailfindOne()
    }else{
      errMsg.push("Failed to find your details. Please try again.");
      console.log(errMsg);
       res.render("add-student-parent-details", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory,successMessage:successMsg,  errorMessage:errMsg, parentDetailsExist : parentDetailsExist});
    }
    //end of else
  });
});

router.post("/add-student-parent-details", redirectLogin, function(req, res){
  successMsg=[];
  errMsg = [];
  userDetail.findOne({username:req.user.username}, function(err, user){
    studentId = user.userid;
    const parent = new parentDetail({
      user_id: studentId,
      f_fname: req.body.fathersFname,
      f_mname : req.body.fathersMname,
      f_lname: req.body.fathersLname,
      m_fname: req.body.mothersFname,
      m_mname: req.body.mothersMname,
      m_lname: req.body.mothersLname,
      parents_contact:req.body.parentsContact
    });
    //end of const parents
    parentDetail.findOne({user_id:user.userid}, function(err, parentDetailsExist){
      if(err){
        errMs.push("Error in fetching parent details:");
        res.render("add-student-parent-details",{loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, parentDetailsExist: parentDetailsExist});
      }else if(parentDetailsExist===null){
        parent.save(function(err, result){
          if(err){
            errMsg.push(err);
            res.render("add-student-parent-details",{loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, parentDetailsExist: parentDetailsExist});
          }else{
            res.redirect("/student-dashboard");
          }
        });
        //end of parent save
      }else{
        parentDetail.findOneAndUpdate({user_id:user.userid},{$set:{
          f_fname: req.body.fathersFname,
          f_mname : req.body.fathersMname,
          f_lname: req.body.fathersLname,
          m_fname: req.body.mothersFname,
          m_mname: req.body.mothersMname,
          m_lname: req.body.mothersLname,
          parents_contact:req.body.parentsContact
        }}, { new: true }, function(err, parentUpdateResult){
          if(err){
            errMsg.push(err);
            res.render("add-student-parent-details",{loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, parentDetailsExist: parentDetailsExist});
          }else{
            successMsg.push("Parents details updated successfully.");
            parentDetail.findOne({user_id:user.userid}, function(err,parentDetailsExist ){
              if(err){
                errMsg.push("Error in fetching parents details after updating.");
              }else{
                res.render("add-student-parent-details",{loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, parentDetailsExist: parentDetailsExist});
              }
            });
          }
        });
      }
      //end of else
    });
    //end of parent details findOne
  });
  //end of user detail find one method

});

//view student details
router.get("/view-student-details", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log("err");
      res.render("login", {loginErr:"You details does not exist"});
    }else{
      //access only for authorised Admin
      if(user.usercategory==="Student" && user.userverificationstatus==="Auto verified"){
        successMsg=[];
        paymentDetail.findOne({user_id:user.userid}, function(err, payment){
          if(err){
            console.log(err);
          }else if(payment==null){
            errMsg.push("Complete your payment first. Your payment is pending");
            res.redirect("make-payment");
          }else{
            studentAcademicDetail.findOne({user_id:user.userid},function(err, studentAcademic){
              if(err){
                console.log(err);
              }else{
                parentDetail.findOne({user_id:user.userid}, function(err, parent){
                  if(err){
                    console.log(err);
                  }else{
                    eventRegistration.findOne({user_id:user.userid}, function(err, participationDetail){
                      if(err){
                        console.log(err);
                      }else{
                        eventDetail.find({}, function(err, eventList){
                          if(err){
                            console.log(err);
                          }else{
                            organisationDetail.findOne({organisation_id: studentAcademic.organisation_id}, function(err, organisation){
                              if(err){
                                console.log(err);
                              }else{
                                    userDetail.findOne({userid:participationDetail.coordinator_id}, function(err, coordinator){
                                      if(err){
                                        console.log(err);
                                      }else{
                                          let tshirtOpted, tshirtSize;
                                          tshirtDetail.findOne({student_id:user.userid}, function(err, tshirtStats){
                                            if(err){
                                              console.log(err);
                                            }else if(tshirtStats==null || tshirtStats){
                                              if(tshirtStats==null){
                                                tshirtOpted = "NO";
                                                tshirtSize = "NA";
                                              }else{
                                                tshirtOpted = "YES"
                                                if(tshirtStats.tshirt_size=="S"){
                                                  tshirtSize = "SMALL";
                                                }else if(tshirtStats.tshirt_size=="M"){
                                                  tshirtSize="MEDIUM";
                                                }else{
                                                  tshirtSize = "LARGE";
                                                }
                                              }
                                              let sname, sregNo, sdob, sclass, sgender, semail, smobile, sorganisation, sfather, smother, sparentContact, eventCategory,  sgroup, steam, coordinatorName;
                                              let paymentRef;
                                              let dd, mm , yyyy;
                                              let indEvents = [];
                                              let grpEvent = [];
                                            //  console.log(studentAcademic);
                                              if(studentAcademic){
                                                dd = studentAcademic.dob.getDate();
                                                mm = studentAcademic.dob.getMonth() + 1
                                                yyyy = studentAcademic.dob.getFullYear();
                                                sgender = studentAcademic.gender;
                                                let classKey = Object.keys(constValues.academicClass);
                                                let classValue = Object.values(constValues.academicClass)
                                                for(let i=0; i< classKey.length; i++){
                                                  if(studentAcademic.class==classKey[i]){
                                                    sclass = classValue[i];
                                                  }
                                                }
                                              }else{
                                                dd = 0;
                                                mm = 0;
                                                yyyy = 0;
                                              }

                                              sregNo = user.userid,
                                              smobile = user.mobilenumber;
                                              semail = user.email;

                                              if(user.fname && user.mname && user.lname){
                                                sname = user.fname + " " + user.mname + " " + user.lname;
                                              }else{
                                                sname= user.fname + " " + user.lname;
                                              }
                                              if(dd<10){
                                                dd = '0' + dd;
                                              }
                                              if(mm<10){
                                                mm = '0' + mm;
                                              }
                                              sdob = mm + '/' + dd + '/' + yyyy;

                                            if(parent){
                                              if(parent.f_fname && parent.f_mname && parent.f_lname){
                                                sfather = parent.f_fname + " " + parent.f_mname + " " + parent.f_lname;
                                              }else if(parent.f_fname && parent.f_lname){
                                                sfather = parent.f_fname + " " + parent.f_mname;
                                              }else{
                                                sfather=" ";
                                              }
                                              if(parent.m_fname && parent.m_mname && parent.m_lname){
                                                smother = parent.m_fname + " " + parent.m_mname + " " + parent.m_lname;
                                              }else if(parent.m_fname && parent.m_lname){
                                                smother = parent.m_fname + " " + parent.m_lname;
                                              }else{
                                                smother = " ";
                                              }
                                              sparentContact = parent.parents_contact;

                                            }

                                              sorganisation = organisation.organisation_name + ", " + organisation.organisation_address;
                                              if(participationDetail){
                                                sgroup = participationDetail.student_group;

                                                if(participationDetail.individual_events){
                                                  eventList.forEach(function(event){
                                                    participationDetail.individual_events.forEach(function(individualEvents){
                                                      if(event.event_id == individualEvents){
                                                        indEvents.push(event.event_name);
                                                      }
                                                    })
                                                  })
                                                }

                                                if(participationDetail.group_events){
                                                  eventList.forEach(function(event){
                                                    participationDetail.group_events.forEach(function(groupEvents){
                                                      if(event.event_id == groupEvents){
                                                        grpEvent.push(event.event_name);
                                                      }
                                                    })
                                                  })

                                                  steam = participationDetail.team_members;
                                                }
                                                if(coordinator){
                                                  if(coordinator.fname && user.mname && coordinator.lname){
                                                    coordinatorName = coordinator.fname + " " + coordinator.mname + " " + coordinator.lname;
                                                  }else{
                                                    coordinatorName = coordinator.fname + " " + coordinator.lname;
                                                  }
                                                }

                                              }
                                              res.render("view-student-details", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user, sregNo:sregNo, sname:sname,
                                                sdob:sdob, sclass:sclass, sgender:sgender, semail:semail, smobile:smobile, sfather:sfather, smother:smother, sparentContact:sparentContact,
                                                 sorganisation:sorganisation, sgroup:sgroup, indEvents:indEvents, grpEvent:grpEvent, steam:steam, payment:payment, coordinatorName:coordinatorName,
                                               tshirtOpted:tshirtOpted, tshirtSize:tshirtSize  });

                                            }
                                          });
                                      }
                                    });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }

            });
            //end of students academic details
          }
        });
      }
      else{
  			 res.render("login", {loginErr:"You are not authorised to access this page"});
      }
    }
    //end of outer if-else
  });
  //end of userDetail.findOne()

})
//end of view students get details


//**********************************************************************
//**********************************************************************
//*****************************************************************

router.get("/register-event", redirectLogin,  function(req, res){
  successMsg= [];

  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log(err);
    }else{
      paymentDetail.findOne({user_id:user.userid}, function(err, paymentResultStatus){
        if(err){
          console.log(err);
        }else if(paymentResultStatus!=null){
          res.redirect("/logout");
        }else{
          studentAcademicDetail.findOne({user_id:user.userid}, function(err, studentAcademic){
            if(err){
              console.log(error);
            }else if(studentAcademic==null){
              res.redirect("add-student-academic-details");
            }else{
              parentDetail.findOne({user_id:user.userid}, function(err, parentData){
                if(err){
                  console.log(err);
                }else if(parentData==null){
                  res.redirect("add-student-parent-details");
                }else{
                  //up to class 5 Junior group && class 6-9 senior group  and 10 &  above super senior group
                  let participatingGroup;
                  if(studentAcademic.class >= 0 && studentAcademic.class <=5){
                    participatingGroup = "JUNIOR GROUP";
                  }else if(studentAcademic.class >= 6 && studentAcademic.class <=9){
                    participatingGroup = "SENIOR GROUP";
                  }else{
                    participatingGroup = "SUPER SENIOR GROUP";
                  }
                  //fetch the events applicable to respective group
                  if(participatingGroup=="JUNIOR GROUP"){
                    eventDetail.find({junior_group:"YES"}).sort({event_name:1}).exec(function(err, eventList){
                      if(err){
                        console.log(err);
                      }else{
                        //finding coordinatorList
                        userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"}, function(err, coordinatorList){
                          if(err){
                            console.log(err);
                          }else {
                            eventRegistration.findOne({user_id: user.userid}, function(err, studEventRegDetail){
                              if(err){
                                console.log(err);
                              }else{

                                res.render("register-event",{loggedInUser: req.user.fullName, loggedInUserCategory: user.usercategory, successMessage:successMsg,  errorMessage:errMsg, eventList: eventList, coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail, participatingGroup:participatingGroup});
                              }
                              //end of eventRegistration error
                            });
                            //end of eventRegistration.findOne()
                          }
                          //end of coordinator find list  else
                        });
                        //end of coordinator find list
                      }
                      //end of eventDetailfind() else
                    });
                    //end of eventDetailfind()
                  }else if(participatingGroup=="SENIOR GROUP"){
                    eventDetail.find({senior_group:"YES"}).sort({event_name:1}).exec(function(err, eventList){
                      if(err){
                        console.log(err);
                      }else{
                        //finding coordinatorList
                        userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"}, function(err, coordinatorList){
                          if(err){
                            console.log(err);
                          }else {
                            eventRegistration.findOne({user_id: user.userid}, function(err, studEventRegDetail){
                              if(err){
                                console.log(err);
                              }else{

                                res.render("register-event",{loggedInUser: req.user.fullName, loggedInUserCategory: user.usercategory, successMessage:successMsg,  errorMessage:errMsg, eventList: eventList, coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail, participatingGroup:participatingGroup});
                              }
                              //end of eventRegistration error
                            });
                            //end of eventRegistration.findOne()
                          }
                          //end of coordinator find list  else
                        });
                        //end of coordinator find list
                      }
                      //end of eventDetailfind() else
                    });
                    //end of eventDetailfind()
                  }else{
                    eventDetail.find({super_senior_group:"YES"}).sort({event_name:1}).exec(function(err, eventList){
                      if(err){
                        console.log(err);
                      }else{
                        //finding coordinatorList
                        userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"}, function(err, coordinatorList){
                          if(err){
                            console.log(err);
                          }else {
                            eventRegistration.findOne({user_id: user.userid}, function(err, studEventRegDetail){
                              if(err){
                                console.log(err);
                              }else{

                                res.render("register-event",{loggedInUser: req.user.fullName, loggedInUserCategory: user.usercategory, successMessage:successMsg,  errorMessage:errMsg, eventList: eventList, coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail, participatingGroup:participatingGroup});
                              }
                              //end of eventRegistration error
                            });
                            //end of eventRegistration.findOne()
                          }
                          //end of coordinator find list  else
                        });
                        //end of coordinator find list
                      }
                      //end of eventDetailfind() else
                    });
                    //end of eventDetailfind()
                  }

                }
              });
              //end of parentDetail
            }
            //end of studentAcademicDetail findOne() else
          });
          //end of studentAcademicDetail findOne()

        }
      });
      //end of payment details
      }
    //end of userDetailfindOne else
  });
  //end of userDetailfindOne
})
//end of get register event

//register event post
router.post("/register-event", function(req, res){
  successMsg = [];
  errMsg =[];
  userDetail.findOne({username:req.user.username},function(err, user){
    eventRegistration.findOne({user_id: user.userid}, function(err, userRegistered){
      let category = req.body.eventRegistrationCategory;
      let individual_events = req.body.IndividualEventList;
      let group_events = req.body.GroupEventList;
      let flag = true;
      let participating_through_coordinator = "YES";
      let today = new Date();
      let currentYear = today.getFullYear();
      if(!req.body.coordinator){
        participating_through_coordinator = "NO";
      }
      if(userRegistered== null){
            const eventRegister = new eventRegistration({
              user_id : user.userid,
              participating_category : req.body.eventRegistrationCategory,
              student_group: req.body.studentGroup,
              individual_events: req.body.IndividualEventList,
              group_events: req.body.GroupEventList,
              coordinator_id: req.body.coordinator,
              participating_through_coordinator:participating_through_coordinator,
              team_members:req.body.teamMember,
              year: currentYear
            });

            if(category== undefined){
              flag=false;
               errMsg.push("Individual category or group category must be checked.");
              //  res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
            }else if(category.includes("Individual") && category.includes("Group") ){
              if(individual_events==undefined || group_events==undefined){
                errMsg.push("Atleast one value for individual events and group events must be seleted.");
                //res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                flag=false;
              }
            }else if (category.includes("Individual")) {
              if(individual_events == undefined ){
                flag=false;
                errMsg.push("Atleast one value for individual events must be selected.");
              }
            }else if(category.includes("Group")){
              if(group_events == undefined){
                errMsg.push("Atleast one group events must be selected");
                flag=false;
                //res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
              }else{
                if(individual_events!= undefined){
                  console.log(individual_events);
                  errMsg.push("You cannot select individual events if you are partcipating in group events only.");
                  flag=false;
                }
              }
            }
            if(flag==true){
              eventRegister.save(function(err, eventRegistrationDone){
                if(err){
                  errMsg.push("Failed to register event details.");
                  console.log(err);
                  //fetching all event list from database for displaying in front end.
                  eventDetail.find().sort({event_name:1}).exec(function(err, eventList){
                    if(err){
                      console.log(err);
                      errMsg.push("Unable to fetch event list from databse.");
                      res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList,studEventRegDetail:studEventRegDetail });
                    }else{
                      userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"}, function(err, coordinatorList){
                        if(err){
                          errMsg.push("Unable to fetch coordinator list. Please try again");
                          res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                        }else{
                              eventRegistration.findOne({user_id: user.userid}, function(err, studEventRegDetail){
                                if(err){
                                  errMsg.push("Error in finding your event registered details");
                                  res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                                }else{
                                  res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                                }
                              });
                        }
                        //end of else
                      });
                    }
                  });
                  //end of event details find method

                }else{
                  successMsg.push("Your events registered succesfully.");
                  //fetching all event list from database for displaying in front end.
                  res.redirect("Student-dashboard");

                }
              });
              //end of save

            }else{
              eventDetail.find().sort({event_name:1}).exec(function(err, eventList){
                if(err){
                  console.log(err);
                  errMsg.push("Unable to fetch event list from databse.");
                  res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                }else{
                  userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"}, function(err, coordinatorList){
                    if(err){
                      errMsg.push("Unable to fetch coordinator list. Please try again");
                      res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                    }else{
                          eventRegistration.findOne({user_id: user.userid}, function(err, studEventRegDetail){
                            if(err){
                              errMsg.push("Error in finding your event registered details");
                              res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                            }else{
                              res.redirect("register-event");
                              //res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                            }
                          });
                        }
                    //end of else
                  });
                }
                //end of else
              });//end of event details find method

            }

      }else{
        category= req.body.eventRegistrationCategory;
        let individual_events = req.body.IndividualEventList;
        let group_events = req.body.GroupEventList;
        let team = req.body.teamMember
        let flag = true;
        let  participating_through_coordinator="YES";
        if(!req.body.coordinator){
          participating_through_coordinator = "NO";
        }

        if(category== undefined){
          flag=false;
           errMsg.push("Individual category or group category must be checked.");
          //  res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
        }else if(category.includes("Individual") && category.includes("Group") ){
          if(individual_events==undefined || group_events==undefined){
            errMsg.push("Atleast one value for individual events and group events must be seleted.");
            //res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
            flag=false;
          }
        }else if (category.includes("Individual")) {
          if(individual_events == undefined ){
            flag=false;
            errMsg.push("Atleast one value for individual events must be selected.");
          }
          if(group_events!=undefined){
            group_events=[];
            team='';

          }
        }else if(category.includes("Group")){
          if(group_events == undefined){
            errMsg.push("Atleast one group events must be selected");
            flag=false;
            //res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
          }else{
            if(individual_events!= undefined){
            individual_events=[];
            }
          }
        }
        if(flag==false){
          eventDetail.find().sort({event_name:1}).exec(function(err, eventList){
            if(err){
              console.log(err);
              errMsg.push("Unable to fetch event list from databse.");
              res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
            }else{
              userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"}, function(err, coordinatorList){
                if(err){
                  errMsg.push("Unable to fetch coordinator list. Please try again");
                  res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                }else{
                      eventRegistration.findOne({user_id: user.userid}, function(err, studEventRegDetail){
                        if(err){
                          errMsg.push("Error in finding your event registered details");
                          res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                        }else{
                          res.redirect("register-event");
                        //  res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail, participatingGroup:participatingGroup });
                        }
                      });
                }
              });
            }

          });//end of event details find method

        }else{
          eventRegistration.findOneAndUpdate({user_id: user.userid},{$set:{
            user_id : user.userid,
            participating_category : req.body.eventRegistrationCategory,
            student_group: req.body.studentGroup,
            individual_events: individual_events,
            group_events: group_events,
            coordinator_id: req.body.coordinator,
            participating_through_coordinator:  participating_through_coordinator,
            team_members:team
          }}, {new:true},function(err, updateResult){
            if(err){
              errMsg.push("Failed to update your changes.");
              //fetching all event list from database for displaying in front end.
              eventDetail.find().sort({event_name:1}).exec(function(err, eventList){
                if(err){
                  console.log(err);
                  errMsg.push("Unable to fetch event list from databse.");
                  res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                }else{
                  userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"}, function(err, coordinatorList){
                    if(err){
                      errMsg.push("Unable to fetch coordinator list. Please try again");
                      res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                    }else{
                          eventRegistration.findOne({user_id: user.userid}, function(err, studEventRegDetail){
                            if(err){
                              errMsg.push("Error in finding your event registered details");
                              res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                            }else{
                              res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, studEventRegDetail:studEventRegDetail });
                            }
                          });
                    }
                  });
                }

              });//end of event details find method
            //  res.render("register-event", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, user:user,successMessage:successMsg,  errorMessage:errMsg, eventList:eventList,coordinatorList:coordinatorList, teamList:teamList});
            }else{
              res.redirect("student-dashboard");
            }
          });
        }

      }
      //end of else
    });
    //end of eventRegistration findOne method
  });
//end of user detail find one
} );

//beginning of payment Details
router.get("/make-payment", redirectLogin,  function(req, res){
  successMsg=[];
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      errMsg.push("Unable to featch user details.");
      res.render("make-payment",{loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg} );
    }else{
      eventRegistration.findOne({user_id: user.userid},function(err, eventDetails){
        if(err){
          console.log(err);
          res.redirect("register-event");
        }else if(eventDetails==null){
          errMsg = [];
          errMsg.push("You haven't registered for any event. Register before proceeding to payment.");
          res.redirect("register-event");
        }else{
          let totalIndividualEvents = 0;
          let totalGroupEvents = 0;
          let totalEvents = 0;
          let totalAmount = 0;
          let discountedAmount = 0;
          let netPayableAmount = 0 ;
          if(eventDetails!=null){
            if(eventDetails.individual_events){
              totalIndividualEvents = eventDetails.individual_events.length;
            }
            if(eventDetails.group_events){
              totalGroupEvents = eventDetails.group_events.length;
            }
            totalEvents= totalIndividualEvents + totalGroupEvents;

            if(totalEvents==1){
              totalAmount = totalEvents * 100;
              netPayableAmount = 100;
              discountedAmount = 0;
            }else if(totalEvents==2){
              totalAmount = totalEvents * 100;
              netPayableAmount = 150;
              discountedAmount = totalAmount-netPayableAmount;
            } else if(totalEvents==3){
              totalAmount = totalEvents * 100;
              netPayableAmount = 200;
              discountedAmount = totalAmount-netPayableAmount;
            }else {
              totalAmount = totalEvents * 100;
              netPayableAmount = 350;
              discountedAmount = totalAmount-netPayableAmount;

            }

            res.render("make-payment",{loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, successMessage:successMsg,  errorMessage:errMsg, totalAmount:totalAmount, discountedAmount:discountedAmount, netPayableAmount:netPayableAmount} );
          }
          }



      });
      //end of eventRegistration findOne method
    }

});
//end of user detail findOne
});

router.post("/make-payment", function(req, res){
  errMsg=[];
  successMsg = [];

    userDetail.findOne({username:req.user.username}, function(err, user){
      if(err){
        console.log(err);
      }else{
        let upiRef = req.body.UPIRefNumber;
        let upiRegex = "(9)[0-9]{11}";
        let upiFlag=true;
        let payment_curr_status;
        let tshirtRequired, tshirtSize;
        let studentId = user.userid;
        if(req.body.paymentMode!="Cash"){
          if(upiRef.match(upiRegex)){
            upiFlag=true;
          }else{
            upiFlag=false;
          }
        }
        eventRegistration.findOne({user_id:user.userid}, function(err, participatedEventsDetails){
          if(err){
            console.log(err);
          }else{

            if(req.body.paymentMode=="Cash" && participatedEventsDetails.participating_through_coordinator=="NO" ){
              payment_curr_status = "PENDING WITH ORGANISER FOR VERIFICATION";
            }else if(req.body.paymentMode=="Cash" && participatedEventsDetails.participating_through_coordinator=="YES" ){
              payment_curr_status = "PENDING WITH COORDINATOR";
            }else{
              payment_curr_status = "PENDING WITH ORGANISER FOR VERIFICATION";
            }

              if(upiFlag==true ){
                if(req.body.netPayableAmount >0){
                  const payment = new paymentDetail({
                    user_id: user.userid,
                    upi_ref_number: req.body.UPIRefNumber,
                    payment_mode: req.body.paymentMode,
                    payment_current_status: payment_curr_status,
                    total_amount: req.body.totalAmount,
                    discount_amount: req.body.discountAmount,
                    net_payable_amount: req.body.netPayableAmount

                    });
                    payment.save(function(err, paymentSaveResult){
                      if(err){
                        console.log(err);
                      }else{
                        if(req.body.carnival_tshirt_radio=="Y"){
                          const tshirt = new tshirtDetail({
                            student_id: studentId,
                            tshirt_required: req.body.carnival_tshirt_radio,
                            tshirt_size:req.body.carnival_tshirt_size_radio
                          });
                          tshirt.save(function(err, tshirtSaveResult){
                            if(err){
                              console.log(err);
                            }else{
                              res.redirect("/student-dashboard");
                            }
                          })
                        }else{
                          res.redirect("/student-dashboard");
                        }
                      }
                    });
                }else{
                  errMsg.push("Payment details not saved. Try again.");
                  res.redirect("/make-payment");
                }

              }else{
                errMsg.push("UPI/UTR reference number must start with 9.");
                res.redirect("/make-payment");
              }
          }
        });
      }
    });
    //end of user detail findOne
})
//****************************************

  //COORDINATOR RELATED CODES


  //***************************************** /

  router.get("/coordinator-dashboard", redirectLogin,  function(req, res){
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    successMsg=[];
    errMsg=[];
    userDetail.findOne({username:req.user.username}, function(err, user){
      if(err){
        console.log(err);
        errMsg.push(err);
      }else{
        if(user.usercategory=="Coordinator" && user.userverificationstatus=="Verified"){
          res.render("coordinator-dashboard", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory});
        }else{
          res.redirect("logout");
        }
      }
    });
  });
//View participants get

router.get("/view-participants", redirectLogin,  function(req, res){
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  successMsg=[];
  errMsg=[];
  let studentList = [];
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log(err);
      errMsg.push(err);
    }else{
      if(user.usercategory=="Coordinator" && user.userverificationstatus=="Verified"){
        eventRegistration.find({coordinator_id:user.userid}, function(err, eventParticipationDetail){
          if(err){
            console.log(err);
          }else if(eventParticipationDetail==null || eventParticipationDetail.length==0){
            errMsg.push("No students registered under you.");
              res.render("view-participants", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, studentList:studentList, errMsg: errMsg});
          }else{
            eventParticipationDetail.forEach(function(student){
              studentAcademicDetail.findOne({user_id:student.user_id}, function(err, studentAcademic){
                if(err || studentAcademic==null){
                  console.log(err);
                }else{
                    organisationDetail.findOne({organisation_id:studentAcademic.organisation_id}, function(err, organisation){
                    if(err){
                      console.log(err);

                    }else{
                      userDetail.findOne({userid:student.user_id}, function(err, studentData){
                        if(err){
                          console.log(err);
                        }else{
                          paymentDetail.findOne({user_id:student.user_id}, function(err, payment){
                            if(err){
                              console.log(err);
                            }else{
                              let studentClass;
                              let studentFullName;
                              let organistionNameWithAddress = organisation.organisation_name + ", " + organisation.organisation_address;
                              let paymentMode, paymentAmount, paymentStatus;
                              let classKey = Object.keys(constValues.academicClass);
                              let classValue = Object.values(constValues.academicClass)
                              for(let i=0; i< classKey.length; i++){
                                if(studentAcademic.class==classKey[i]){
                                  studentClass = classValue[i];
                                }
                              }
                              if(studentData.fname && studentData.mname && studentData.fname){
                                  studentFullName = studentData.fname + " " + studentData.mname + " " + studentData.lname;
                              }else{
                                studentFullName= studentData.fname + " " + studentData.lname;
                              }
                              if(payment==null){
                                paymentMode = "PAYMENT NOT INITIATED";
                                paymentAmount = 0;
                                paymentStatus = "PENDING WITH STUDENT";
                              }else{
                                paymentMode = payment.payment_mode;
                                paymentAmount = payment.net_payable_amount;
                                  paymentStatus = payment.payment_current_status;
                              }

                              function studentFunction(regNo, name, sClass, org, payMode, fee, status ){
                                this.registrationNo = regNo;
                                this.name = name;
                                this.studentClass = sClass;
                                this.organistion = org;
                                this.paymentMode = payMode;
                                this.registrationFee = fee;
                                this.regFeeCurrentStatus = status
                              }

                              student = new studentFunction(studentData.userid, studentFullName, studentClass, organistionNameWithAddress, paymentMode, paymentAmount, paymentStatus);
                              studentList.push(student);

                            //  console.log("Welcome To INTERSCHOOL CARNIVAL");
                            //  console.log("Inside:" + JSON.stringify(studentList));
                            //    console.log("Student Name: "+ studentFullName);
                            //    console.log("Class: " + studentClass);
                            //  console.log("Organisation:" + organistionNameWithAddress );
                            //  console.log("Payment Mode: "+ payment.payment_mode);
                            //  console.log("Registration Fee:" +payment.net_payable_amount );
                            // console.log("Payment Status:" + payment.payment_current_status );
                             //console.log("Student Reg No:"+ studentData.userid );
                            // console.log("*****************************************************");
                             if(eventParticipationDetail.length==studentList.length){
                                res.render("view-participants", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, studentList:studentList, errMsg: errMsg});
                              }
                            }
                          });
                        }
                        //end of userDetailfindOne else
                      });
                      //end of userDetailfindOne
                    }
                    //end of orreganisationDetail else
                  });
                  //end of organisation findOne
                }
              });
              //end of student academic detail
            });
            //end of forEach loop
          }
        });
        //end of event registration find

      }else{
        res.redirect("logout");
      }
    }
  });
});
//end of View participants get

router.get("/payment-by-coordinator", redirectLogin,  function(req, res){
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  successMsg=[];

  let studentList = [];
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log(err);
      errMsg.push(err);
    }else{
      if(user.usercategory=="Coordinator" && user.userverificationstatus=="Verified"){
        eventRegistration.find({coordinator_id:user.userid}, function(err, eventParticipationDetail){
          if(err){
            console.log(err);
          }else if(eventParticipationDetail==null || eventParticipationDetail.length==0){
            errMsg.push("No students registered under you.");
              res.render("payment-by-coordinator", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, studentList:studentList, errMsg: errMsg});
          }else{
            eventParticipationDetail.forEach(function(student){
              studentAcademicDetail.findOne({user_id:student.user_id}, function(err, studentAcademic){
                if(err){
                  console.log(err);
                }else{

                    organisationDetail.findOne({organisation_id:studentAcademic.organisation_id}, function(err, organisation){
                    if(err){
                      console.log(err);
                    }else{
                      userDetail.findOne({userid:student.user_id}, function(err, studentData){
                        if(err){
                          console.log(err);
                        }else{
                          paymentDetail.findOne({user_id:student.user_id}, function(err, payment){
                            if(err){
                              console.log(err);
                            }else{
                              let studentClass;
                              let studentFullName;
                              let organistionNameWithAddress = organisation.organisation_name + ", " + organisation.organisation_address;
                              let paymentMode, paymentAmount, paymentStatus;
                              let classKey = Object.keys(constValues.academicClass);
                              let classValue = Object.values(constValues.academicClass)
                              for(let i=0; i< classKey.length; i++){
                                if(studentAcademic.class==classKey[i]){
                                  studentClass = classValue[i];
                                }
                              }
                              if(studentData.fname && studentData.mname && studentData.fname){
                                  studentFullName = studentData.fname + " " + studentData.mname + " " + studentData.lname;
                              }else{
                                studentFullName= studentData.fname + " " + studentData.lname;
                              }
                              if(payment==null){
                                paymentMode = "PAYMENT NOT INITIATED";
                                paymentAmount = 0;
                                paymentStatus = "PENDING WITH STUDENT";
                              }else{
                                paymentMode = payment.payment_mode;
                                paymentAmount = payment.net_payable_amount;
                                  paymentStatus = payment.payment_current_status;
                              }

                              function studentFunction(regNo, name, sClass, org, payMode, fee, status ){
                                this.registrationNo = regNo;
                                this.name = name;
                                this.studentClass = sClass;
                                this.organistion = org;
                                this.paymentMode = payMode;
                                this.registrationFee = fee;
                                this.regFeeCurrentStatus = status
                              }

                              student = new studentFunction(studentData.userid, studentFullName, studentClass, organistionNameWithAddress, paymentMode, paymentAmount, paymentStatus);
                              studentList.push(student);
                             if(eventParticipationDetail.length==studentList.length){
                                res.render("payment-by-coordinator", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory, studentList:studentList, errMsg: errMsg});
                              }
                            }
                          });
                        }
                        //end of userDetailfindOne else
                      });
                      //end of userDetailfindOne
                    }
                    //end of orreganisationDetail else
                  });
                  //end of organisation findOne
                }
              });
              //end of student academic detail
            });
            //end of forEach loop
          }
        });
        //end of event registration find

      }else{
        res.redirect("logout");
      }
    }
  });
});
//end of View participants get

router.post("/payment-by-coordinator", redirectLogin, function(req, res){
errMsg = [];
  userDetail.findOne({username:req.user.username}, function(err, coordinator){
    if(err){
      console.log(err);
    }else{
    //  console.log("Students List:" + req.body.studentList);
      let upiRef = req.body.UPIRefNumber;
      let upiRegex = "(9)[0-9]{11}";
      let upiFlag=true;
      let payment_curr_status;
      let studentsList = req.body.studentsList;
      if(req.body.paymentMode!="Cash"){
        if(upiRef.match(upiRegex)){
          upiFlag=true;
        }else{
          upiFlag=false;
        }
      }
      if(upiFlag==true){
        let studentsList = req.body.studentsList;
        let totalAmount = req.body.totalAmount; //from front end form
        let amountSumFromDB = 0;
        let counter1 = 0;
        studentsList.forEach(function(student){
          paymentDetail.findOne({user_id:student.studentId}, function(err, studentPayment){
            if(err){
              console.log(err);
            }else{
              counter1++;
              amountSumFromDB = amountSumFromDB + studentPayment.net_payable_amount;
              if(counter1==studentsList.length && amountSumFromDB == totalAmount){
                  studentsList.forEach(function(student){
                    const paymentCoordinator =  new coordinatorPayment({
                      coordinator_id: coordinator.userid,
                      upi_ref_number: req.body.UPIRefNumber,
                      payment_mode: req.body.paymentMode,
                      student_id: student.studentId,
                      amount:student.fee
                    });
                    paymentCoordinator.save(function(err, paymentSaveResult){
                       if(err){
                         console.log(err);
                       }else{

                            paymentDetail.findOneAndUpdate({user_id:student.studentId},{$set:{payment_current_status:"PENDING WITH ORGANISER FOR VERIFICATION", coordinator_id:coordinator.userid, coordinator_verification_date:Date.now()}}, {new: true}, function(err, updatedPaymentDetails){
                                 if(err){
                                   console.log(err);
                                 }
                               });
                               //end of payment update

                       }
                       //end of coordinatorpaymentsave() else
                     });
                     //end of coordinatorpaymentsave()

                  });
                  //end of inner forEach
                  res.send("Payemt details saved succesfully. Contact organiser to approve your payment.");

              }
              //end of counter1 if-else
            }
            //end of payment details findone else
          });
          //end of paymentDetailsFindOne
        });
        //end of studentsList for forEach
      }else{
        errMsg.push("UPI/UTR reference number must start with 9 and must have 12 digits.");
        res.send(errMsg);
        //res.redirect("/payment-by-coordinator");
      }
    }
    //end of else
  });
  //end of user details findOne
});
//end of coordinator make payment post

router.get("/approve-user", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, adminUser){
    if(err){
      console.log(err);
    }else if(adminUser.usercategory!="Admin" || adminUser.userverificationstatus!="Verified" ){
      res.redirect("logout");
    }else{
        let notVerifiedUsersList = [];
      userDetail.find({ $and:[{$or:[{usercategory:"Coordinator"}, {usercategory:"Admin"}]}, {userverificationstatus:"Not Verified"}]}, function(err, NotVerifiedUsers){
        if(err){
          console.log(err);
        }else {
            if(NotVerifiedUsers.length==0){
            res.render("approve-user", {loggedInUser: req.user.fullName, loggedInUserCategory:adminUser.usercategory,notVerifiedUsersList:notVerifiedUsersList, errorMessage:errMsg});
          }else{

            NotVerifiedUsers.forEach(function(user){
              let fullName;
              if(user.fname && user.mname && user.lname){
                fullName = user.fname + " " +user.mname + " " + user.lname;
              }else{
                fullName=user.fname + " " + user.lname;
              }
              userData = {userid:user.userid, username:user.username, fullName:fullName, userverificationstatus:user.userverificationstatus, userCategory:user.usercategory}
              notVerifiedUsersList.push(userData);
              if(NotVerifiedUsers.length == notVerifiedUsersList.length)
                {
                  res.render("approve-user", {loggedInUser: req.user.fullName, loggedInUserCategory:adminUser.usercategory,notVerifiedUsersList:notVerifiedUsersList, errorMessage:errMsg});
                }
            })
            //end of forEcah
          }

        }
      })
    }
  } );
  //end of user detail find one
});
//end of approve user get

router.put("/approve-user/:id", function(req, res){
  let id = req.params.id;
  let approverName = req.body.fullName;
  userDetail.findOneAndUpdate({userid:id}, {$set:{userverificationstatus:"Verified",approved_by:approverName , approved_date:Date.now()}}, {new:true}, function(err, updateResult){
    if(err){
      console.log(err);
    }else{
      res.send("ACCOUNT UPDATED SUCCESSFULLY.");
    }
  })
});

router.get("/view-payment-details-by-coordinator", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log(err);
    }else if(user.usercategory!="Coordinator" || user.userverificationstatus!="Verified"){
      res.redirect("/logout");
    }else{
      let paymentByCoordinator = [];
      coordinatorPayment.find({coordinator_id:user.userid}, function(err, coordinatorPaymentList){
        if(err){
          console.log(err);
        }else if(coordinatorPaymentList==null || coordinatorPaymentList.length==0){

          errMsg.push("You haven't made any payments.");
          res.render("view-payment-details-by-coordinator", {loggedInUser: req.user.fullName, loggedInUserCategory:user.usercategory, errMsg:errMsg,paymentByCoordinator:paymentByCoordinator});
        }else{
          coordinatorPaymentList.forEach(function(payment){
              let upi_ref_number, payment_mode,  student_id, amount, payment_date, payment_id;
            if(payment.payment_mode!="CASH"){
              upi_ref_number = payment.upi_ref_number;
            }
            payment_mode = payment.payment_mode;
            //number_of_student = payment.number_of_student;
            student_id = payment.student_id;
            amount = payment.amount;
            payment_date = payment.payment_date;
            payment_id = payment.coordinator_payment_id;
            function coordinatorPayment(upi, pay_mode, student, amount , pay_date, pay_id ){
              this.upi_ref_number = upi;
              this.payment_mode = pay_mode;
              this.student_id = student;
              this.amount = amount;
              this.payment_date = pay_date;
              this.coordinator_payment_id = pay_id;
            }
            payDetail = new coordinatorPayment(upi_ref_number, payment_mode, student_id, amount , payment_date, payment_id );
            paymentByCoordinator.push(payDetail);
            if(paymentByCoordinator.length == coordinatorPaymentList.length ){
              res.render("view-payment-details-by-coordinator", {loggedInUser: req.user.fullName, loggedInUserCategory:req.user.usercategory,errMsg:errMsg, paymentByCoordinator: paymentByCoordinator});
            }
          });
          //end of forEach
        }
      });
    }
  });
});

//delete method d
router.delete("/view-payment-details-by-coordinator/:id/:coordinatorPayId/:payDate/:amount/:payMode/:ref", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, coordinator){
    let studentId = Number(req.params.id);
    paymentDetail.findOne({user_id:studentId}, function(err, studentPayment){
      if(studentPayment.payment_current_status=="FINAL APPROVED BY ORGANISER"){
        res.send("Students payment is final approved. You can't delete the payment details.");
      }else{
        const deletedPayment = new coordinatorDeletedPayment({
          coordinator_id:coordinator.userid,
          coordinator_payment_id:req.params.coordinatorPayId,
          student_id:studentId,
          amount:req.params.amount,
          upi_ref_number:req.params.ref,
          payment_mode:req.params.payMode,
          payment_date:req.params.payDate
        });

        coordinatorPayment.deleteOne({ student_id:studentId }, function (err) {
          if(err){
            console.log(err);
          }else{
            paymentDetail.deleteOne({user_id:studentId}, function(err){
              if(err){
                console.log(err);
              }else{
                deletedPayment.save(function(err, saveResult){
                  if(err){
                    console.log(err);
                  }else{
                      res.send("Payment details is succesfully deleted.");
                  }
                });
              }
            });
          }
        });
      }
    });
  });
});


router.get("/approve-payment-by-organiser", redirectLogin, function(req, res){
  errMsg=[];
  successMsg=[];
  let coordinatorList = [];
  userDetail.findOne({username:req.user.username}, function(err, adminUser){
    if(err){
      console.log(err);
    }else if(adminUser.usercategory=="Admin" && adminUser.userverificationstatus=="Verified"){
      userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"}, function(err, coordinators){
        if(err){
          console.log(err);
        }else if(coordinators.length==0){
          res.render("approve-payment-by-organiser", {loggedInUser: req.user.fullName, loggedInUserCategory:adminUser.usercategory, coordinatorList:coordinatorList});
        }else{
          let counter=0;
          coordinators.forEach(function(coordinator){
            let coordinatorFullName ;
            counter++;
            if(coordinator.fname && coordinator.mname && coordinator.lname){
              coordinatorFullName = coordinator.fname + " " + coordinator.mname + " " + coordinator.lname;
            }else{
              coordinatorFullName = coordinator.fname + " " + coordinator.lname;
            }
            coordinatorIdName = {coordinator_id:coordinator.userid, coordinatorName:coordinatorFullName};
            coordinatorList.push(coordinatorIdName);
            if(counter==coordinators.length){

              res.render("approve-payment-by-organiser", {loggedInUser: req.user.fullName, loggedInUserCategory:adminUser.usercategory, coordinatorList:coordinatorList});
            }
          });
          //end of coordinator forEach
        }
      });
    }
    //end of else if
  });
  //end of userDetail findOne
});

router.get("/organiser-approve-payment-detail/:fromdate/:todate/:paymode/:coordinatorid", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, adminUser){
    if(err){
      console.log(err);
    }else{
      if(adminUser.usercategory==="Admin" && adminUser.userverificationstatus==="Verified"){
        let paymentMode = req.params.paymode;
        let coordinatorId = req.params.coordinatorid;
        let fromDate = req.params.fromdate;
        let toDate = req.params.todate;
        let studentPayList = [];
        if( (paymentMode == "PHONE PE" || paymentMode == "GOOGLE PAY" || paymentMode == "PAYTM" ) && (coordinatorId == "-1") ){
          paymentDetail.find({ payment_date: { $gte: fromDate, $lte:toDate}, payment_mode:paymentMode,coordinator_id:null, payment_current_status: "PENDING WITH ORGANISER FOR VERIFICATION" }, function(err, paymentDetailList){
            if(err){
              console.log(err);
            }else{
              if(paymentDetailList.length==0){
                res.send("No transaction found");
              }else {
                paymentDetailList.forEach(function(payment){
                  userDetail.findOne({userid:payment.user_id}, function(err, student){
                    if(err){
                      console.log(err);
                    }else{
                      let fullName;
                        if(student.fname && student.mname && student.lname){
                          fullName = student.fname + " " + student.mname + " " + student.lname;
                        }else{
                          fullName = student.fname + " " + student.lname;
                        }
                        studentObj = {regNo:student.userid,name:fullName, paymentTxnId:payment.payment_id, upi_ref_number:payment.upi_ref_number, fee:payment.net_payable_amount }
                        studentPayList.push(studentObj);
                        if(paymentDetailList.length == studentPayList.length){
                            res.send(studentPayList);
                        }
                    }
                  });
                });
              }
            }
          });
        }else if( (paymentMode == "PHONE PE" || paymentMode == "GOOGLE PAY" || paymentMode == "PAYTM" ) && (coordinatorId != "-1") ){

          paymentDetail.find({ payment_date: { $gte: fromDate, $lte:toDate},coordinator_id:coordinatorId, payment_mode:paymentMode, payment_current_status: "PENDING WITH ORGANISER FOR VERIFICATION" }, function(err, paymentDetailList){
            if(err){
              console.log(err);
            }else{
              if(paymentDetailList.length==0){
                res.send("No transaction found");
              }else {
                paymentDetailList.forEach(function(payment){
                  userDetail.findOne({userid:payment.user_id}, function(err, student){
                    if(err){
                      console.log(err);
                    }else{
                      let fullName;
                        if(student.fname && student.mname && student.lname){
                          fullName = student.fname + " " + student.mname + " " + student.lname;
                        }else{
                          fullName = student.fname + " " + student.lname;
                        }
                        studentObj = {regNo:student.userid,name:fullName, paymentTxnId:payment.payment_id, upi_ref_number:payment.upi_ref_number, fee:payment.net_payable_amount }
                        studentPayList.push(studentObj);

                        if(paymentDetailList.length == studentPayList.length){
                            res.send(studentPayList);
                        }
                    }
                  });
                });
              }
            }
          });
        }else if(paymentMode == "CASH" && coordinatorId == "-1"){
          paymentDetail.find({ payment_date: { $gte: fromDate, $lte:toDate}, payment_mode:paymentMode, coordinator_id:null, payment_current_status: "PENDING WITH ORGANISER FOR VERIFICATION"}, function(err, paymentDetailList){
            if(err){
              console.log(err);
            }else{
              if(paymentDetailList.length==0){
                res.send("No transaction found");
              }else {
                paymentDetailList.forEach(function(payment){
                  userDetail.findOne({userid:payment.user_id}, function(err, student){
                    if(err){
                      console.log(err);
                    }else{
                      let fullName;
                        if(student.fname && student.mname && student.lname){
                          fullName = student.fname + " " + student.mname + " " + student.lname;
                        }else{
                          fullName = student.fname + " " + student.lname;
                        }
                        studentObj = {regNo:student.userid,name:fullName, paymentTxnId:payment.payment_id, upi_ref_number:"NA", fee:payment.net_payable_amount }
                        studentPayList.push(studentObj);
                        if(paymentDetailList.length == studentPayList.length){
                            res.send(studentPayList);
                        }
                    }
                  });
                });
              }
            }
          });
        }else if(paymentMode == "CASH" && coordinatorId != "-1"){
          paymentDetail.find({ coordinator_verification_date: { $gte: fromDate, $lte:toDate}, payment_mode:paymentMode, payment_current_status: "PENDING WITH ORGANISER FOR VERIFICATION", coordinator_id:coordinatorId}, function(err, paymentDetailList){
            if(err){
              console.log(err);
            }else{
              if(paymentDetailList.length==0){
                res.send("No transaction found");
              }else {
                paymentDetailList.forEach(function(payment){
                  userDetail.findOne({userid:payment.user_id}, function(err, student){
                    if(err){
                      console.log(err);
                    }else{
                      let fullName;
                        if(student.fname && student.mname && student.lname){
                          fullName = student.fname + " " + student.mname + " " + student.lname;
                        }else{
                          fullName = student.fname + " " + student.lname;
                        }
                        studentObj = {regNo:student.userid,name:fullName, paymentTxnId:payment.payment_id,upi_ref_number:"NA", fee:payment.net_payable_amount }
                        studentPayList.push(studentObj);
                        if(paymentDetailList.length == studentPayList.length){
                            res.send(studentPayList);
                        }
                    }
                  });
                });
              }
            }
          });
        }else{
          res.send("Invalid filter selected. Please try with another filter combination.");
        }
      }
    }
  });
});
//post route of approve payment by organiser

router.post("/approve-payment-by-organiser", redirectLogin, function(req, res){
//  console.log(req.body.studentsRegNoList);
  let studentsRegNoList = req.body.studentsRegNoList;
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log(err);
    }else{
      if(user.usercategory=="Admin" && user.userverificationstatus == "Verified"){
        let approverFullName;
        if(user.fname && user.mname && user.lname){
          approverFullName = user.fname + " " + user.mname +" " + user.lname;
        }else{
          approverFullName = user.fname + " " + user.lname;
        }
        let counter=0;
        studentsRegNoList.forEach(function(regNo){
          paymentDetail.findOneAndUpdate({user_id:regNo}, {$set:{payment_current_status:"Final approved by organiser", final_approve_date: Date.now(), final_approver:approverFullName}}, {new: true}, function(err, updateResult){
            if(err){
              console.log(err);
            }else{
              counter++;
              if(studentsRegNoList.length==counter){
                res.send("Payment succesfully approved.");
              }
            }
          } );

        });

      }else{
        res.redirect("logout");
      }
    }
  });
});

router.get("/view-final-approved-payment", function(req, res){
  userDetail.findOne({username:req.user.username},function(err, user){
    if(err){
      console.log(err);
    }else if(user.usercategory=="Admin" && user.userverificationstatus=="Verified"){
      res.render("view-final-approved-payment", {loggedInUser: req.user.fullName, loggedInUserCategory:user.usercategory});
    }else{
      res.redirect("logout");
    }
  })

})
router.get("/approved-payment-details/:fromdate/:todate", redirectLogin, function(req, res ){
  userDetail.findOne({username:req.user.username}, function(err, adminUser){
    if(adminUser.usercategory=="Admin" && adminUser.userverificationstatus=="Verified"){
      let fromDate = req.params.fromdate;
      let toDate = req.params.todate;
      let studentsList=[];
      paymentDetail.find({final_approve_date: { $gte: fromDate, $lte:toDate}}, function(err, studentPaymentList){
        if(err){
          console.log(err);
        }else if(studentPaymentList.length==0){
          res.send("No transaction found");
        }else{

          studentPaymentList.forEach(function(studentPayment){
            studentAcademicDetail.findOne({user_id:studentPayment.user_id}, function(err, studentAcademic){
              if(err){
                console.log(err);
              }else{
                organisationDetail.findOne({organisation_id:studentAcademic.organisation_id}, function(err, organisation){
                  if(err){
                    console.log(err);
                  }else{
                    let studentFullName;
                    let organisationNameWithAddress;
                    userDetail.findOne({userid:studentPayment.user_id}, function(err, studentUser){
                      if(err){
                        console.log(err);
                      }else{
                        if(studentUser.fname && studentUser.mname && studentUser.lname){
                          studentFullName = studentUser.fname + " " + studentUser.mname + " " + studentUser.lname;
                        }else{
                          studentFullName = studentUser.fname + " " + studentUser.lname;
                        }
                        eventRegistration.findOne({user_id:studentUser.userid}, function(err, participatedEventData){
                          if(err){
                            console.log(err);
                          }else if (participatedEventData==null) {
                            console.log(participatedEventData);
                          }else{
                            organisationNameWithAddress = organisation.organisation_name + ", " + organisation.organisation_address;
                            student = { regNo:studentPayment.user_id,
                                        studentName: studentFullName,
                                        teamMember:participatedEventData.team_members,
                                        organisation: organisationNameWithAddress,
                                        paymentId:studentPayment.payment_id,
                                        regFee: studentPayment.net_payable_amount,
                                        approvedDate: studentPayment.final_approve_date.toLocaleDateString(),
                                        approver:studentPayment.final_approver
                             };
                             studentsList.push(student);
                             if(studentPaymentList.length== studentsList.length){
                               res.send(studentsList);
                             }
                          }
                        })
                      }
                    });

                  }
                })
              }
            })
          });
        }
      });
    }
  });
})

// coordinators payment details

router.get("/coordinators-payment-details", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, adminUser){
    if(err){
      console.log(err);
    }else{
      if(adminUser.usercategory==="Admin" && adminUser.userverificationstatus==="Verified"){
        let coordinatorList =[];
        userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"}, function(err, coordinators){
          if(err){
            console.log(err);
          }else if(coordinators.length==0){
            res.render("coordinators-payment-details", {loggedInUser: req.user.fullName, loggedInUserCategory:adminUser.usercategory, coordinatorList:coordinatorList});
          }else{
            let counter=0;
            coordinators.forEach(function(coordinator){
              let coordinatorFullName ;
              counter++;
              if(coordinator.fname && coordinator.mname && coordinator.lname){
                coordinatorFullName = coordinator.fname + " " + coordinator.mname + " " + coordinator.lname;
              }else{
                coordinatorFullName = coordinator.fname + " " + coordinator.lname;
              }
              coordinatorIdName = {coordinator_id:coordinator.userid, coordinatorName:coordinatorFullName};
              coordinatorList.push(coordinatorIdName);
              if(counter==coordinators.length){
                res.render("coordinators-payment-details", {loggedInUser: req.user.fullName, loggedInUserCategory:adminUser.usercategory, coordinatorList:coordinatorList});
              }
            });
            //end of coordinator forEach
          }
        });

      }
    }
  });

})


router.get("/get-coordinators-payment/:fromdate/:todate/:coordinatorId", function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, adminUser){
    if(err){
      console.log(err);
    }else{
      if(adminUser.userverificationstatus==="Verified" && adminUser.usercategory==="Admin"){
        let fromDate = req.params.fromdate;
        let toDate = req.params.todate;
        let coordinatorID = req.params.coordinatorId;
        let coordinatorPaymentList = [];

        coordinatorPayment.find({payment_date:{$gte: fromDate, $lte:toDate}, coordinator_id:coordinatorID}, function(err, paymentList){
          if(err){
            console.log(err);
          }else if(paymentList.length == 0){
            res.send("No transaction found");
          }else{
            //console.log(paymentList);
            paymentList.forEach(function(payment){
              let referenceNo;
              if(payment.payment_mode=="CASH"){
                referenceNo=' ';
              }else{
                referenceNo=payment.upi_ref_number;
              }
              payDetail = {coordinatorPaymentId:payment.coordinator_payment_id, paymentMode:payment.payment_mode, referenceNo:referenceNo, paymentDate:payment.payment_date.toLocaleDateString(), studentRegNo:payment.student_id, amount:payment.amount};
              coordinatorPaymentList.push(payDetail);
              if(paymentList.length==coordinatorPaymentList.length){
              res.send(coordinatorPaymentList);
              }
            });

          }
        })
      }
    }
  });
});

router.get("/print-event-wise-participation-list", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, user){
    if(err){
      console.log(err);
    }else if(user.usercategory==="Admin" && user.userverificationstatus==="Verified"){
      eventDetail.find({},{event_id:1, event_name:1,_id:0}).sort({event_name:1})
        .exec(function (err, eventsList) {
        res.render("print-event-wise-participation-list", {loggedInUser: req.user.fullName, loggedInUserCategory:user.usercategory,eventsList:eventsList});
      });
    }else{
      res.redirect("logout");
    }
  });
});

router.get("/new-student-registration-by-coordinator", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, coordinator){
    if(err){
      console.log(err);
    }else if(coordinator.usercategory==="Coordinator" && coordinator.userverificationstatus==="Verified"){
      let academicClassList = constValues.academicClass;
      organisationDetail.find().sort({organisation_name:1}).exec(function(err, organisations){
        if(err){
          console.log("Error in loading organisation details.")
        }else{
          let coordinatorId = coordinator.userid;

          res.render("new-student-registration-by-coordinator", {loggedInUser: req.user.fullName,coordinatorId:coordinatorId,
            loggedInUserCategory:coordinator.usercategory, academicClassList:academicClassList, organisationList:organisations,
            successMessage:successMsg, errorMessage:errMsg});
          }
        });
      //end of organisationDetail.find()

    }else{
      res.redirect("logout");
    }
    });
});
router.get("/carnival-event-list/:group", function(req, res){
  console.log(req.params.group);
  let group = req.params.group;
  if(group == "JUNIOR GROUP"){
    eventDetail.find({junior_group:"YES"}).sort({event_name:1}).exec(function(err, eventList){
      if(err){
        console.log(err);
      }else{
        res.send(eventList);
      }
      //end of eventDetailfind() else
    });
    //end of eventDetailfind()

  }else if(group == "SENIOR GROUP"){
    eventDetail.find({senior_group:"YES"}).sort({event_name:1}).exec(function(err, eventList){
      if(err){
        console.log(err);
      }else{
        res.send(eventList);
      }
      //end of eventDetailfind() else
    });
    //end of eventDetailfind()
  }else{
    eventDetail.find({super_senior_group:"YES"}).sort({event_name:1}).exec(function(err, eventList){
      if(err){
        console.log(err);
      }else{
        res.send(eventList);
      }
      //end of eventDetailfind() else
    });
    //end of eventDetailfind()
  }

});


router.post("/new-student-registration-by-coordinator", redirectLogin, function(req, res){
  errMsg = [];
  successMsg = [];
  userDetail.findOne({username:req.user.username}, function(err, coordinator){
    if(err){
      console.log(err);
    }else if(coordinator.usercategory==="Coordinator" && coordinator.userverificationstatus==="Verified"){

      userDetail.findOne().sort({userid:-1})  // give me the max
        .exec(function (err, Id) {
          if(err)
          console.log(error);
          else{
            let username,userPass;
            let dob = new Date(req.body.studentdob)
            let dd = dob.getDate();
            let mm = dob.getMonth()+1;
            let year = dob.getFullYear();
            if(dd<10){
              dd = "0" + dd;
            }
            if(mm<10){
              mm = "0" + mm;
            }
            username = req.body.studentfirstname.substring(0, 3).toLowerCase() + dd + mm+ year;
            userpass = "isc2019";
                bcrypt.hash(userpass, saltRounds, function(err, hashPassword) {
                  let lastMaxUserId = Id.userid
                	const user = new userDetail({
              			fname: req.body.studentfirstname,
              			mname: req.body.studentmiddlename,
              			lname: req.body.studentlastname,
              			username: username,
                    userid:lastMaxUserId+1,
                    usercategory: "Student",
              			password: hashPassword,
                    whatsAppNumber:req.body.studentwhatsappnumber,
              			mobilenumber: req.body.studentmobilenumber,
              			email: req.body.studentemail,
                    account_creation_date:Date.now(),
              			securityquestion: "WHAT IS YOUR FAVOURITE SUBJECT?",
              			securityanswer:"COMPUTER",
                    userverificationstatus: "Auto verified",
                    registeredby:coordinator.userid
                  });

                  user.save(function(err, userSaveresult){
                    if(err){
                      errMsg=[];
                      console.log(err);
                      errMsg.push("The username created by system already exist");
                      res.redirect("new-student-registration-by-coordinator");

                    }else{
                      const userid=userSaveresult.userid;
                      const userName = userSaveresult.username;
                      const userPassword =userPass;
                      const studentAcademic = new studentAcademicDetail({
                        user_id : userid,
                        class: req.body.studentclass,
                        dob: req.body.studentdob,
                        gender: req.body.studentgender,
                        organisation_id: req.body.studentorganisation
                      });
                      //end of student academic
                      studentAcademic.save(function(err, studAcademicSaveresult){
                        if(err){
                          errMsg=[];
                          console.log(err);
                          errMsg.push("Failed to save student academic details.");
                          res.redirect("new-student-registration-by-coordinator");
                        }else{
                          const parent = new parentDetail({
                            user_id: userid,
                            f_fname: req.body.fatherfirstname,
                            f_mname : req.body.fathermiddlename,
                            f_lname: req.body.fatherlastname,
                          });
                          parent.save(function(err, parentSaveResult){
                            if(err){
                              console.log(err);
                              errMsg = [];
                              errMsg.push(err);
                            }else{
                              let today = new Date();
                              let currentYear = today.getFullYear();
                              const eventRegister = new eventRegistration({
                                user_id : userid,
                                participating_category : req.body.eventRegistrationCategory,
                                student_group: req.body.participationgGroup,
                                individual_events: req.body.IndividualEventList,
                                group_events: req.body.GroupEventList,
                                coordinator_id: req.body.coordinator,
                                participating_through_coordinator:"YES",
                                team_members:req.body.teamMember,
                                year: currentYear
                              });
                              eventRegister.save(function(err, eventRegistrationSaveResult){
                                if(err){
                                  console.log(err);
                                  errMsg = [];
                                  errMsg.push(err);
                                }else{
                                  eventRegistration.findOne({user_id: userid},function(err, eventDetails){
                                    if(err){
                                      console.log(err);
                                    }else if(eventDetails==null){
                                      errMsg = [];
                                      errMsg.push("You haven't registered for any event.");
                                      res.redirect("new-student-registration-by-coordinator");
                                    }else{
                                      let totalIndividualEvents = 0;
                                      let totalGroupEvents = 0;
                                      let totalEvents = 0;
                                      let totalAmount = 0;
                                      let discountedAmount = 0;
                                      let netPayableAmount = 0 ;
                                      if(eventDetails!=null){
                                        if(eventDetails.individual_events){
                                          totalIndividualEvents = eventDetails.individual_events.length;
                                        }
                                        if(eventDetails.group_events){
                                          totalGroupEvents = eventDetails.group_events.length;
                                        }
                                        totalEvents= totalIndividualEvents + totalGroupEvents;

                                        if(totalEvents==1){
                                          totalAmount = totalEvents * 100;
                                          netPayableAmount = 100;
                                          discountedAmount = 0;
                                        }else if(totalEvents==2){
                                          totalAmount = totalEvents * 100;
                                          netPayableAmount = 150;
                                          discountedAmount = totalAmount-netPayableAmount;
                                        } else if(totalEvents==3){
                                          totalAmount = totalEvents * 100;
                                          netPayableAmount = 200;
                                          discountedAmount = totalAmount-netPayableAmount;
                                        }else {
                                          totalAmount = totalEvents * 100;
                                          netPayableAmount = 350;
                                          discountedAmount = totalAmount-netPayableAmount;

                                        }
                                        if(req.body.carnival_tshirt_radio=="Y"){
                                          totalAmount = totalAmount + 150;
                                          netPayableAmount = netPayableAmount + 150
                                        }
                                        //For apex students fee =100
                                        if(req.body.studentorganisation==1){
                                          if(totalEvents==1){
                                            netPayableAmount=50;
                                          }else{
                                            netPayableAmount=100;
                                          }

                                        }
                                        const payment = new paymentDetail({
                                          user_id: userid,
                                          payment_mode: "CASH",
                                          payment_current_status: "PENDING WITH COORDINATOR",
                                          total_amount: totalAmount,
                                          discount_amount: discountedAmount,
                                          net_payable_amount: netPayableAmount

                                          });
                                        payment.save(function(err, paymentSaveResult){
                                          if(err){
                                            console.log(err);
                                          }else{
                                            if(req.body.carnival_tshirt_radio=="Y"){
                                              const tshirt = new tshirtDetail({
                                                student_id: userid,
                                                tshirt_required: req.body.carnival_tshirt_radio,
                                                tshirt_size:req.body.carnival_tshirt_size_radio
                                              });
                                              tshirt.save(function(err, tshirtSaveResult){
                                                if(err){
                                                  console.log(err);
                                                }else{
                                                  let userIdPassword = "Succesfully registered student. Registration number: " + userid +" ,username: " + username + " ,password:isc2019. Please keep the details." ;
                                                  successMsg.push(userIdPassword);
                                                  res.redirect("new-student-registration-by-coordinator");

                                                }
                                              })
                                            }else{
                                                  let userIdPassword = "Succesfully registered student. Registration number: " + userid +", username: " + username + ", password:isc2019. Please keep the details." ;
                                                  successMsg.push(userIdPassword);
                                                  res.redirect("new-student-registration-by-coordinator");
                                            }
                                          }
                                        });

                                      }
                                      }
                                  });
                                  //end of eventRegistration findOne method
                                }
                              });
                              //end of event registration save result
                            }
                          });
                          //end of parent save result
                        }
                      });
                      //end of student academic
                    }
                    //end of else
                  });
                  //end of user save

                  });
                  //end of bcrypt
              }
  			//end of else
  	  });
    //end of .exec function

    //  res.redirect("coordinator-dashboard");
    }else{
      res.redirect("logout");
    }
    });
});

router.get("/view-student-credentials", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, coordinator){
    if(err){
      console.log(err);
    }else if(coordinator.usercategory==="Coordinator" && coordinator.userverificationstatus==="Verified"){
      userDetail.find({registeredby:coordinator.userid},{userid:1, mname:1, fname:1, lname:1, username:1}, function(err, studentsList ){
        if(err){
          console.log(err);
        }else{
          res.render("view-student-credentials", {loggedInUser: req.user.fullName,loggedInUserCategory:coordinator.usercategory,
            studentsList:studentsList});
        }
      })

    }else{
      res.redirect("logout");
    }
    });
});
var studentsList = [];
//function to find the list of students participated in particular group
function studentEventParticipatedList(group){
  return new Promise(function(resolve, reject){
    if(group=="ALL"){
      eventRegistration.find({}, function(err, studentsEventParticipationList){
          if(!err){
            resolve(studentsEventParticipationList);
          }
        });
    }else{
      eventRegistration.find({student_group:group}, function(err, studentsEventParticipationList){
          if(!err){
            resolve(studentsEventParticipationList);
          }
        });

    }
  });
}
function checkPaymentStatus(studentId, feeStatus){
  return new Promise(function(resolve, reject){
    paymentDetail.findOne({user_id:studentId, payment_current_status:feeStatus},{payment_current_status:1,payment_mode:1, _id:0}, function(err, paymentWithStatus){
      if(!err){
        //console.log("Pay="+paymentWithStatus);
        resolve(paymentWithStatus);
      }
    });
  })
}
function getOrganisationId(studentId){
  return new Promise(function(resolve, reject){
    studentAcademicDetail.findOne({user_id:studentId},{_id:0, organisation_id:1},function(err, organisationId){
      if(!err){
        resolve(organisationId);
      }
    })
  })
}
function getOrganisationName(orgId){
  return new Promise(function(resolve, reject){
    organisationDetail.findOne({organisation_id:orgId}, function(err, org){
      if(!err){
        let orgName = org.organisation_name + ", " + org.organisation_address;
        resolve(orgName);
      }
    });
  })
}
function getStudentName(userId){
  return new Promise ( function(resolve, reject){
    userDetail.findOne({userid:userId}, {fname:1, mname:1, lname:1}, function(err, user){
      if(!err){
        let fullName;
        if(user.fname && user.mname && user.lname){
          fullName = user.fname + " " + user.mname + " " + user.lname;
          resolve(fullName);
        }else {
          fullName = user.fname + " " + user.lname;
          resolve(fullName);
        }

      }
    });
  })
}
function getEventName(eventId){
  return new Promise(function(resolve, reject){
    eventDetail.findOne({event_id:eventId}, function(err, event){
      if(!err){
        resolve(event.event_name);
      }
    })
  });
}
router.get("/get-event-participation-and-student-list/:eventId/:studentGroupDdl/:feeStatusDdl", function(req, res){
  let eventId = parseInt(req.params.eventId);
  let studentGroup = req.params.studentGroupDdl;
  let feeStatus = req.params.feeStatusDdl;
  async function main(){
    let studentsEventsParticipatedList = await studentEventParticipatedList(studentGroup);
    var studentsList = [];
    try {
      if(studentsEventsParticipatedList.length>0){
        for(let index=0; index<studentsEventsParticipatedList.length;index++){
          //console.log("started"+":"+studentsEventsParticipatedList[index].user_id);
          let studentPaymentStatus = await checkPaymentStatus(studentsEventsParticipatedList[index].user_id, feeStatus);
          if(studentPaymentStatus!=null){
          console.log(studentsEventsParticipatedList[index].user_id);
            if(studentsEventsParticipatedList[index].individual_events.includes(eventId) || studentsEventsParticipatedList[index].group_events.includes(eventId) ){
              let studentOrgId = await getOrganisationId(studentsEventsParticipatedList[index].user_id);
              let studOrgName = await getOrganisationName(studentOrgId.organisation_id);
              let studName =  await getStudentName(studentsEventsParticipatedList[index].user_id);
              let eventName = await getEventName(eventId);
              student =  {
                regNo:studentsEventsParticipatedList[index].user_id,
                name: studName,
                eventName:eventName,
                organisation:studOrgName,
                group:studentsEventsParticipatedList[index].student_group,
                payMode:studentPaymentStatus.payment_mode,
                payStatus: studentPaymentStatus.payment_current_status
              }
              studentsList.push(student);
              if(index==(studentsEventsParticipatedList.length-1)){
                res.send(studentsList);
              }
            }else{
              if(index==(studentsEventsParticipatedList.length-1)){
                res.send(studentsList);
              }
            }
          }else{
            if(index==(studentsEventsParticipatedList.length-1)){
              res.send(studentsList);
            }
          }
        }
        //end of forEach
      }else{
        res.send(studentsList);
      }
    } catch (e) {
      console.log(e);
    }
  }
  main();
})


router.get("/coordinator-wise-participants-list",redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, admin){
    if(admin.usercategory=="Admin" && admin.userverificationstatus==="Verified"){
      userDetail.find({usercategory:"Coordinator", userverificationstatus:"Verified"},{userid:1, fname:1,mname:1, lname:1}).sort({userid:1}).exec(function(err, verifiedCoordinators){
        if(err){
          console.log(err);
        }else {
          res.render("coordinator-wise-participants-list",{loggedInUser: req.user.fullName, loggedInUserCategory:admin.usercategory, verifiedCoordinators:verifiedCoordinators});
        }
      })
    }else{
      res.redirect("logout");
    }
  });
})


router.get("/find-coordinator-wise-participants-list/:Id", function(req, res){
  let studentList = [];
  let coordinatorId= parseInt(req.params.Id);
        eventRegistration.find({coordinator_id:coordinatorId}).sort({user_id:1}).exec(function(err, eventParticipationDetail){
          if(err){
            console.log(err);
          }else if(eventParticipationDetail==null || eventParticipationDetail.length==0){
            res.send("No students found");
          }else{
            eventParticipationDetail.forEach(function(student, index){
              studentAcademicDetail.findOne({user_id:student.user_id}, function(err, studentAcademic){
                if(err || studentAcademic==null){
                  console.log(err);
                }else{
                    organisationDetail.findOne({organisation_id:studentAcademic.organisation_id}, function(err, organisation){
                    if(err){
                      console.log(err);
                    }else{
                      userDetail.findOne({userid:student.user_id}, function(err, studentData){
                        if(err){
                          console.log(err);
                        }else{
                          paymentDetail.findOne({user_id:student.user_id}, function(err, payment){
                            if(err){
                              console.log(err);
                            }else{
                              let studentClass;
                              let studentFullName;
                              let organistionNameWithAddress = organisation.organisation_name + ", " + organisation.organisation_address;
                              let paymentMode, paymentAmount, paymentStatus;
                              let classKey = Object.keys(constValues.academicClass);
                              let classValue = Object.values(constValues.academicClass)
                              for(let i=0; i< classKey.length; i++){
                                if(studentAcademic.class==classKey[i]){
                                  studentClass = classValue[i];
                                }
                              }
                              if(studentData.fname && studentData.mname && studentData.fname){
                                  studentFullName = studentData.fname + " " + studentData.mname + " " + studentData.lname;
                              }else{
                                studentFullName= studentData.fname + " " + studentData.lname;
                              }
                              if(payment==null){
                                paymentMode = "PAYMENT NOT INITIATED";
                                paymentAmount = 0;
                                paymentStatus = "PENDING WITH STUDENT";
                              }else{
                                if(payment.payment_current_status=="FINAL APPROVED BY ORGANISER"){
                                  paymentAmount = payment.net_payable_amount;
                                }else{
                                  paymentAmount = 0;
                                }
                                paymentMode = payment.payment_mode;
                                paymentStatus = payment.payment_current_status;
                              }

                              function studentFunction(regNo, name, sClass, org, payMode, fee, status ){
                                this.registrationNo = regNo;
                                this.name = name;
                                this.studentClass = sClass;
                                this.organistion = org;
                                this.paymentMode = payMode;
                                this.registrationFee = fee;
                                this.regFeeCurrentStatus = status
                              }

                              student = new studentFunction(studentData.userid, studentFullName, studentClass, organistionNameWithAddress, paymentMode, paymentAmount, paymentStatus);
                              studentList.push(student);
                             if(studentList.length==eventParticipationDetail.length){
                                res.send(studentList);
                              }
                            }
                          });
                        }
                        //end of userDetailfindOne else
                      });
                      //end of userDetailfindOne
                    }
                    //end of orreganisationDetail else
                  });
                  //end of organisation findOne
                }
              });
              //end of student academic detail
            });
            //end of forEach loop
          }
        });
        //end of event registration find

});
function validUser(uname){
  return new Promise(function(resolve, reject){
    userDetail.findOne({username:uname},{_id:0, usercategory:1, userverificationstatus:1 },function(err, user){
      if(!err){
        resolve(user);
      }
    })
  })
}
function TshirtPurchasedStudentsList(uname){
  return new Promise(function(resolve, reject){
    tshirtDetail.find().sort({student_id:1}).exec(function(err, tshirtsDetailsList){
      if(!err){
        resolve(tshirtsDetailsList);
      }
    })
  })
}
function checkStudentPaymentStatus(studentId){
  return new Promise(function(resolve, reject){
    paymentDetail.findOne({user_id:studentId},{payment_current_status:1, _id:0}, function(err, paymentWithStatus){
      if(!err){
        //console.log("Pay="+paymentWithStatus);
        resolve(paymentWithStatus);
      }
    });
  })
}
router.get("/tshirt-details", redirectLogin, function(req, res){

  async function main(){
    let userstatus = await validUser(req.user.username);
    if(userstatus.usercategory==="Admin" && userstatus.userverificationstatus==="Verified"){
      let tshirtsDetailsList = await TshirtPurchasedStudentsList();
      let studentsList = [];
      if(tshirtsDetailsList.length==0){
            res.render("tshirt-details",{loggedInUser: req.user.fullName, loggedInUserCategory:userstatus.usercategory, studentsList:studentsList});
          }else{
             for(let index=0; index<tshirtsDetailsList.length; index++){
              let fullName = await getStudentName(tshirtsDetailsList[index].student_id);
              let payStatus = await checkStudentPaymentStatus(tshirtsDetailsList[index].student_id);

              if(payStatus!=null){
                if(payStatus.payment_current_status=="FINAL APPROVED BY ORGANISER"){
                  studentTshirt ={
                    regNo:tshirtsDetailsList[index].student_id,
                    size:tshirtsDetailsList[index].tshirt_size,
                    name:fullName
                  }
                  studentsList.push(studentTshirt);
                  if(index==(tshirtsDetailsList.length-1)){
                    res.render("tshirt-details",{loggedInUser: req.user.fullName, loggedInUserCategory:userstatus.usercategory, studentsList:studentsList});
                  }
              }else{
                if(index==(tshirtsDetailsList.length-1)){
                  res.render("tshirt-details",{loggedInUser: req.user.fullName, loggedInUserCategory:userstatus.usercategory, studentsList:studentsList});
                }
              }
              }else{

                if(index==(tshirtsDetailsList.length-1)){
                  res.render("tshirt-details",{loggedInUser: req.user.fullName, loggedInUserCategory:userstatus.usercategory, studentsList:studentsList});
                }
              }
          }
      }
    }else{
      res.redirect("/logout");
    }
  }
  main();

});

function findUserFrequency(){
  return new Promise(function(resolve, reject){
    userDetail.aggregate([{$group : {_id :{userCategory:"$usercategory", userVerificationStatus:"$userverificationstatus"} , total : { $sum : 1 }}}], function(err, userFrequencyWithCategory){
      if(!err){
        let verifiedAdmins=0,unVerifiedAdmins=0,verifiedCoordinators=0,notVerifiedCoordinator=0,students=0;
        for(let index=0;index<userFrequencyWithCategory.length; index++){
          if(userFrequencyWithCategory[index]._id.userCategory=="Admin" && userFrequencyWithCategory[index]._id.userVerificationStatus=="Verified" ){
            verifiedAdmins = userFrequencyWithCategory[index].total;
          }else if(userFrequencyWithCategory[index]._id.userCategory=="Admin" && userFrequencyWithCategory[index]._id.userVerificationStatus=="Not Verified" ){
            unVerifiedAdmins=userFrequencyWithCategory[index].total;
          }else if(userFrequencyWithCategory[index]._id.userCategory=="Coordinator" && userFrequencyWithCategory[index]._id.userVerificationStatus=="Verified" ){
            verifiedCoordinators=userFrequencyWithCategory[index].total;
          }else if(userFrequencyWithCategory[index]._id.userCategory=="Coordinator" && userFrequencyWithCategory[index]._id.userVerificationStatus=="Not Verified" ){
            notVerifiedCoordinator=userFrequencyWithCategory[index].total;
          }
          else if(userFrequencyWithCategory[index]._id.userCategory=="Student" ){
            students=userFrequencyWithCategory[index].total;
          }
          if(index==(userFrequencyWithCategory.length-1)){
            result={verifiedAdmins:verifiedAdmins,unVerifiedAdmins:unVerifiedAdmins,
              verifiedCoordinators:verifiedCoordinators,notVerifiedCoordinator:notVerifiedCoordinator,students:students};
            resolve(result);
          }
        }
      }
    });
  })
}

function findPaymentStatusFrequency(){
  return new Promise(function(resolve, reject){
    paymentDetail.aggregate([{$group : {_id :{paymentStatus:"$payment_current_status"} , total : { $sum : 1 }}}], function(err, result){
      if(!err){
        let pendingWithCoordinators=0,pendingWithOrganizers=0, finalApprovedByOrganiser=0,pendingWithStudent=0;

        for(i=0;i<result.length;i++){
          if(result[i]._id.paymentStatus=="PENDING WITH COORDINATOR"){
            pendingWithCoordinators=result[i].total;
          }else if(result[i]._id.paymentStatus=="PENDING WITH ORGANISER FOR VERIFICATION"){
            pendingWithOrganizers=result[i].total;
          }else if(result[i]._id.paymentStatus=="FINAL APPROVED BY ORGANISER"){
            finalApprovedByOrganiser=result[i].total;
          }else{
            pendingWithStudent=result[i].total;
          }
          if(i==(result.length-1)){
            payStatus={pendingWithStudent:pendingWithStudent,pendingWithCoordinators:pendingWithCoordinators,pendingWithOrganizers:pendingWithOrganizers,finalApprovedByOrganiser:finalApprovedByOrganiser}
            resolve(payStatus);
          }
        }

      }
    });
  })
}
//get page for checking the stats of participants and users
router.get("/check-stats",redirectLogin, function(req, res){
  async function checkStats(userCategory){
      let userFrequencyWithCategory = await findUserFrequency();
      let paymentFrequencyWithStatus = await findPaymentStatusFrequency();
      let verifiedCoordinators= userFrequencyWithCategory.verifiedCoordinators;
      let notVerifiedCoordinator=userFrequencyWithCategory.notVerifiedCoordinator;
      let students=userFrequencyWithCategory.students;
      let verifiedAdmins=userFrequencyWithCategory.verifiedAdmins;
      let unVerifiedAdmins=userFrequencyWithCategory.unVerifiedAdmins;
      let pendingWithStudent=paymentFrequencyWithStatus.pendingWithStudent;
      let pendingWithCoordinators=paymentFrequencyWithStatus.pendingWithCoordinators;
      let pendingWithOrganizers=paymentFrequencyWithStatus.pendingWithOrganizers;
      let finalApprovedByOrganiser=paymentFrequencyWithStatus.finalApprovedByOrganiser;
      res.render("check-stats",{loggedInUser: req.user.fullName, loggedInUserCategory:userCategory, verifiedAdmins:verifiedAdmins,unVerifiedAdmins:unVerifiedAdmins,
        verifiedCoordinators:verifiedCoordinators,notVerifiedCoordinator:notVerifiedCoordinator,students:students,pendingWithStudent:pendingWithStudent,
       pendingWithCoordinators:pendingWithCoordinators,pendingWithOrganizers:pendingWithOrganizers,finalApprovedByOrganiser:finalApprovedByOrganiser});
  }
  userDetail.findOne({username:req.user.username}, function(err, adminUser){
    if(err){
      console.log(err);
    }else if(adminUser.userverificationstatus=="Verified" && adminUser.usercategory=="Admin"){
      checkStats(adminUser.usercategory);
    }else{
      res.redirect("/logout");
    }
  });

});

//view user Details
router.get("/view-user-details", redirectLogin, function(req, res){
  userDetail.findOne({username:req.user.username}, function(err, adminUser){
    if(err){
      console.log(err);
    }else if(adminUser.userverificationstatus=="Verified" && adminUser.usercategory=="Admin"){
      userDetail.find({},{_id:0,userid:1, fname:1, mname:1, lname:1, usercategory:1,whatsAppNumber:1,mobilenumber:1, email:1, userverificationstatus:1},function(err, userList){
        if(err){
          console.log(err);
        }else{

          res.render("view-user-details", {loggedInUser: req.user.fullName, loggedInUserCategory:adminUser.usercategory, userList:userList});
        }
      });
    }else{
      res.redirect("/logout");
    }
  });
})

//check individual Status
router.get("/check-individual-details", function(req, res){
  res.render("check-individual-details");
});


router.post("/check-individual-details", function(req, res){
  let studentId = parseInt(req.body.studId);
  userDetail.findOne({userid:studentId},{username:0,password:0,user_category:0}, function(err, user){
    let studentFullName;
    if(err){
      console.log(err);
    }else if(user==null){
      errMsg.push("Invalid User");
    }else{
      if(user.fname && user.mname && user.lname){
          studentFullName = user.fname+ " " + user.mname + " " + user.lname;
      }else{
          studentFullName = user.fname+ " " + user.lname;
      }
      paymentDetail.findOne({user_id:studentId}, function(err, payDetail){
        if(err){
          console.log(err);
        }else if(payDetail==null){
          errMsg.push("Payment Deatils Not Found");
        }else{
          let payment_current_status = payDetail.payment_current_status;
          let net_payable_amount = payDetail.net_payable_amount;
          console.log(payDetail);
          console.log("asdasd:"+studentId);
          res.render("view-individual-student-details",{studentId:studentId, studentFullName:studentFullName, payCurrStatus:payment_current_status, netAmnt:net_payable_amount});
        }
      });
    }
  });

})

app.use('/', router);
