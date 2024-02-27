var express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  expressValidator = require("express-validator"), 
  session = require("express-session"),
  methodOverride = require("method-override"),
  bodyparser = require("body-parser"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  // professor = require("./models/professor"),
  Warden = require("./models/warden"),
  Hod = require("./models/hod"),
  Leave = require("./models/leave");
  Professor =require("./models/professor");

var moment = require("moment");

var url =process.env.DATABASEURL|| "mongodb+srv://rushikeshphadtare2003:wgMbLiIHa8zBXji4@cluster0.yknf6j4.mongodb.net/LeaveApp";
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("connected to DB");
  })
  .catch(err => {
    console.log("Error:", err.message);
  });

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(expressValidator());

//passport config
app.use(
  require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(professor.authenticate()));
// passport.use(
//   new LocalStrategy(function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (!user) {
//         return done(null, false);
//       }
//       if (!user.verifyPassword(password)) {
//         return done(null, false);
//       }
//       return done(null, user);
//     });
//   })
// );

// passport.serializeUser(professor.serializeUser());
// passport.deserializeUser(professor.deserializeUser());
// app.use(
//   ev({
//     errorFormatter: function(param, msg, value) {
//       var namespace = param.split("."),
//         root = namespace.shift(),
//         formParam = root;

//       while (namespace.length) {
//         formParam += "[" + namespace.shift() + "]";
//       }
//       return {
//         param: formParam,
//         msg: msg,
//         value: value
//       };
//     }
//   })
// );
app.use(flash());
app.use((req, res, next) => {
  //   res.locals.currentUser = req.user;
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.user = req.user || null;
  next();
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You need to be logged in");
    res.redirect("/professor/login");
  }
}
app.get("/", (req, res) => {
  res.render("home");
});

//login logic for professor

//login logic for Hod

// passport.serializeUser(function(hod, done) {
//   done(null, hod.id);
// });

// passport.deserializeUser(function(id, done) {

// });

//registration form
app.get("/register", (req, res) => {
  res.render("register");
});
//registration logic
app.post("/professor/register", (req, res) => {
  var type = req.body.type;
  if (type == "Professor") {
    var name = req.body.name;
    var emailId = req.body.emailId;
    var password = req.body.password;
    var password2 = req.body.password2;
    var department = req.body.department;
    var mobileno = req.body.mobileno;
    var image = req.body.image;
    //validation
    
    req.checkBody("name", "name is required").notEmpty();
    req.checkBody("emailId", "email ID is required").notEmpty();
    req.checkBody("mobileno", "mobile no. is required").notEmpty();
    req.checkBody("department", "department is required").notEmpty();
    req.checkBody("password", "Password is required").notEmpty();
    req.checkBody("password2", "Password don't match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      // req.session.errors = errors;
      // req.session.success = false;
      console.log("errors: " + errors);
      console.log("Request Body: ", req.body);
      res.render("register", {
        errors: errors
      });
    } else {
      var newProfessor = new Professor({
        name: name,
        emailId: emailId,
        password: password,
        department: department,
        mobileno: mobileno,
        type: type,
        image: image
      });
      Professor.createProfessor(newProfessor, (err, professor) => {
        if (err) throw err;
        console.log(professor);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/professor/login");
    }
  } else if (type == "hod") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var department = req.body.department;
    var image = req.body.image;

    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "password is required").notEmpty();
    req.checkBody("department", "department is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        errors: errors
      });
    } else {
      var newHod = new Hod({
        name: name,
        username: username,
        password: password,
        department: department,
        type: type,
        image: image
      });
      Hod.createHod(newHod, (err, hod) => {
        if (err) throw err;
        console.log(hod);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/hod/login");
    }
  } else if (type == "warden") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var hostel = req.body.hostel;
    var image = req.body.image;

    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "password is required").notEmpty();
    req.checkBody("hostel", "hostel is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        errors: errors
      });
    } else {
      var newWarden = new Warden({
        name: name,
        username: username,
        password: password,
        hostel: hostel,
        type: type,
        image: image
      });
      Warden.createWarden(newWarden, (err, warden) => {
        if (err) throw err;
        console.log(warden);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/warden/login");
    }
  }
});

//stratergies
passport.use(
  "professor",
  new LocalStrategy((emailId, password, done) => {
    Professor.getUserByEmail(emailId, (err, professor) => {
      if (err) throw err;
      if (!professor) {
        return done(null, false, { message: "Unknown User" });
      }
      Professor.comparePassword(
        password,
        professor.password,
        (err, passwordFound) => {
          if (err) throw err;
          if (passwordFound) {
            return done(null, professor);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        }
      );
    });
  })
);

passport.use(
  "hod",
  new LocalStrategy((username, password, done) => {
    Hod.getUserByUsername(username, (err, hod) => {
      if (err) throw err;
      if (!hod) {
        return done(null, false, { message: "Unknown User" });
      }
      Hod.comparePassword(password, hod.password, (err, passwordFound) => {
        if (err) throw err;
        if (passwordFound) {
          return done(null, hod);
        } else {
          return done(null, false, { message: "Invalid Password" });
        }
      });
    });
  })
);

passport.use(
  "warden",
  new LocalStrategy((username, password, done) => {
    Warden.getUserByUsername(username, (err, warden) => {
      if (err) throw err;
      if (!warden) {
        return done(null, false, { message: "Unknown User" });
      }
      Warden.comparePassword(
        password,
        warden.password,
        (err, passwordFound) => {
          if (err) throw err;
          if (passwordFound) {
            return done(null, warden);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        }
      );
    });
  })
);

//srialize

passport.serializeUser(function(user, done) {
  // console.log(user.id);
  done(null, { id: user.id, type: user.type });
});

//deserialize

passport.deserializeUser(function(obj, done) {
  switch (obj.type) {
    case "professor":
      Professor.getUserById(obj.id, function(err, professor) {
        done(err, professor);
      });
      break;
    case "hod":
      Hod.getUserById(obj.id, function(err, hod) {
        done(err, hod);
      });
      break;
    case "warden":
      Warden.getUserById(obj.id, function(err, warden) {
        done(err, warden);
      });
      break;
    default:
      done(new Error("no entity type:", obj.type), null);
      break;
  }
});

app.get("/professor/login", (req, res) => {
  res.render("login");
});

app.post("/professor/login",
  passport.authenticate("professor", {
    successRedirect: "/professor/home",
    failureRedirect: "/professor/login",
    failureFlash: true
  }),
  (req, res) => {
    // console.log(professor);
    res.redirect("/professor/home");
  }
);

app.get("/professor/home", ensureAuthenticated, (req, res) => {
  var professor = req.user.emailId;
  console.log(professor);
  professor.findOne({ emailId: req.user.emailId })
    .populate("leaves")
    .exec((err, professor) => {
      if (err || !professor) {
        req.flash("error", "professor not found");
        res.redirect("back");
        console.log("err");
      } else {
        res.render("homeprof", {
          professor: professor,
          moment: moment
        });
      }
    });
});
app.get("/professor/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  professor.findById(req.params.id)
    .populate("leaves")
    .exec((err, foundprofessor) => {
      if (err || !foundprofessor) {
        req.flash("error", "professor not found");
        res.redirect("back");
      } else {
        res.render("profileprof", { professor: foundprofessor });
      }
    });
});
app.get("/professor/:id/edit", ensureAuthenticated, (req, res) => {
  professor.findById(req.params.id, (err, foundprofessor) => {
    res.render("editS", { professor: foundprofessor });
  });
});
app.put("/professor/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.professor);
  professor.findByIdAndUpdate(
    req.params.id,
    req.body.professor,
    (err, updatedprofessor) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Succesfully updated");
        res.redirect("/professor/" + req.params.id);
      }
    }
  );
});

app.get("/professor/:id/apply", ensureAuthenticated, (req, res) => {
  professor.findById(req.params.id, (err, foundProf) => {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.render("leaveApply", { professor: foundProf });
    }
  });
});

app.post("/professor/:id/apply", (req, res) => {
  professor.findById(req.params.id)
    .populate("leaves")
    .exec((err, professor) => {
      if (err) {
        res.redirect("/professor/home");
      } else {
        date = new Date(req.body.leave.from);
        todate = new Date(req.body.leave.to);
        year = date.getFullYear();
        month = date.getMonth() + 1;
        dt = date.getDate();
        todt = todate.getDate();

        if (dt < 10) {
          dt = "0" + dt;
        }
        if (month < 10) {
          month = "0" + month;
        }
        console.log(todt - dt);
        req.body.leave.days = todt - dt;
        console.log(year + "-" + month + "-" + dt);
        // req.body.leave.to = req.body.leave.to.substring(0, 10);
        console.log(req.body.leave);
        // var from = new Date(req.body.leave.from);
        // from.toISOString().substring(0, 10);
        // console.log("from date:", strDate);
        Leave.create(req.body.leave, (err, newLeave) => {
          if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
            console.log(err);
          } else {
            newLeave.Prof.id = req.user._id;
            newLeave.Prof.username = req.user.username;
            console.log("leave is applied by--" + req.user.username);

            // console.log(newLeave.from);
            newLeave.save();

            professor.leaves.push(newLeave);

            professor.save();
            req.flash("success", "Successfully applied for leave");
            res.render("homeprof", { professor: professor, moment: moment });
          }
        });
      }
    });
});
app.get("/professor/:id/track", (req, res) => {
  professor.findById(req.params.id)
    .populate("leaves")
    .exec((err, foundProf) => {
      if (err) {
        req.flash("error", "No professor with requested id");
        res.redirect("back");
      } else {
        
        res.render("trackLeave", { professor: foundProf, moment: moment });
      }
    });
});
app.get("/hod/login", (req, res) => {
  res.render("hodlogin");
});

app.post(
  "/hod/login",
  passport.authenticate("hod", {
    successRedirect: "/hod/home",
    failureRedirect: "/hod/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/hod/home");
  }
);
app.get("/hod/home", ensureAuthenticated, (req, res) => {
  Hod.find({}, (err, hod) => {
    if (err) {
      console.log("err");
    } else {
      res.render("homehod", {
        hod: req.user
      });
    }
  });
});
app.get("/hod/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  Hod.findById(req.params.id).exec((err, foundHod) => {
    if (err || !foundHod) {
      req.flash("error", "Hod not found");
      res.redirect("back");
    } else {
      res.render("profilehod", { hod: foundHod });
    }
  });
});
app.get("/hod/:id/edit", ensureAuthenticated, (req, res) => {
  Hod.findById(req.params.id, (err, foundHod) => {
    res.render("editH", { hod: foundHod });
  });
});
app.put("/hod/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.hod);
  Hod.findByIdAndUpdate(req.params.id, req.body.hod, (err, updatedHod) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      req.flash("success", "Succesfully updated");
      res.redirect("/hod/" + req.params.id);
    }
  });
});
app.get("/hod/:id/leave", (req, res) => {
  Hod.findById(req.params.id).exec((err, hodFound) => {
    if (err) {
      req.flash("error", "hod not found with requested id");
      res.redirect("back");
    } else {
      // console.log(hodFound);
      professor.find({ department: hodFound.department })
        .populate("leaves")
        .exec((err, professors) => {
          if (err) {
            req.flash("error", "professor not found with your department");
            res.redirect("back");
          } else {
            // professors.forEach(function(professor) {
            //   if (professor.leaves.length > 0) {
            // professor.leaves.forEach(function(leave) {
            //   console.log(leave);
            //   console.log("////////////");
            // Leave.findById(leave, (err, leaveFound) => {
            //   if (err) {
            //     req.flash("error", "leave not found");
            //     res.redirect("back");
            //   } else {
            //     // console.log(leaveFound.subject);
            res.render("hodLeaveSign", {
              hod: hodFound,
              professors: professors,
              // leave: leaveFound,
              moment: moment
            });
            //   }
            // });
            // });
            // }
            // Leave.find({ username: professor.username }, (err, leave) => {
            //   console.log(leave.username);
            // });
            // });
            // console.log(professors);
          }
        });
    }
    // console.log(req.body.hod);
  });
});

app.get("/hod/:id/leave/:Prof_id/info", (req, res) => {
  Hod.findById(req.params.id).exec((err, hodFound) => {
    if (err) {
      req.flash("error", "hod not found with requested id");
      res.redirect("back");
    } else {
      professor.findById(req.params.Prof_id)
        .populate("leaves")
        .exec((err, foundprofessor) => {
          if (err) {
            req.flash("error", "professor not found with this id");
            res.redirect("back");
          } else {
            res.render("moreinfoProf", {
              professor: foundprofessor,
              hod: hodFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.post("/hod/:id/leave/:Prof_id/info", (req, res) => {
  Hod.findById(req.params.id).exec((err, hodFound) => {
    if (err) {
      req.flash("error", "hod not found with requested id");
      res.redirect("back");
    } else {
      professor.findById(req.params.Prof_id)
        .populate("leaves")
        .exec((err, foundprofessor) => {
          if (err) {
            req.flash("error", "professor not found with this id");
            res.redirect("back");
          } else {
            if (req.body.action === "Approve") {
              foundprofessor.leaves.forEach(function(leave) {
                if (leave.status === "pending") {
                  leave.status = "approved";
                  leave.approved = true;
                  leave.save();
                }
              });
            } else {
              console.log("u denied");
              foundprofessor.leaves.forEach(function(leave) {
                if (leave.status === "pending") {
                  leave.status = "denied";
                  leave.denied = true;
                  leave.save();
                }
              });
            }
            res.render("moreinfoProf", {
              professor: foundprofessor,
              hod: hodFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.get("/warden/login", (req, res) => {
  res.render("wardenlogin");
});

app.post(
  "/warden/login",
  passport.authenticate("warden", {
    successRedirect: "/warden/home",
    failureRedirect: "/warden/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/warden/home");
  }
);
app.get("/warden/home", ensureAuthenticated, (req, res) => {
  Warden.find({}, (err, hod) => {
    if (err) {
      console.log("err");
    } else {
      res.render("homewarden", {
        warden: req.user
      });
    }
  });
});

app.get("/warden/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  Warden.findById(req.params.id).exec((err, foundWarden) => {
    if (err || !foundWarden) {
      req.flash("error", "Warden not found");
      res.redirect("back");
    } else {
      res.render("profilewarden", { warden: foundWarden });
    }
  });
});
app.get("/warden/:id/edit", ensureAuthenticated, (req, res) => {
  Warden.findById(req.params.id, (err, foundWarden) => {
    res.render("editW", { warden: foundWarden });
  });
});

app.put("/warden/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.warden);
  Warden.findByIdAndUpdate(
    req.params.id,
    req.body.warden,
    (err, updatedWarden) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Succesfully updated");
        res.redirect("/warden/" + req.params.id);
      }
    }
  );
});

app.get("/warden/:id/leave", (req, res) => {
  Warden.findById(req.params.id).exec((err, wardenFound) => {
    if (err) {
      req.flash("error", "hod not found with requested id");
      res.redirect("back");
    } else {
      // console.log(hodFound);
      professor.find({ hostel: wardenFound.hostel })
        .populate("leaves")
        .exec((err, professors) => {
          if (err) {
            req.flash("error", "professor not found with your department");
            res.redirect("back");
          } else {
            res.render("wardenLeaveSign", {
              warden: wardenFound,
              professors: professors,

              moment: moment
            });
          }
        });
    }
  });
});
app.get("/warden/:id/leave/:Prof_id/info", (req, res) => {
  Warden.findById(req.params.id).exec((err, wardenFound) => {
    if (err) {
      req.flash("error", "warden not found with requested id");
      res.redirect("back");
    } else {
      professor.findById(req.params.Prof_id)
        .populate("leaves")
        .exec((err, foundprofessor) => {
          if (err) {
            req.flash("error", "professor not found with this id");
            res.redirect("back");
          } else {
            res.render("WardenmoreinfoProf", {
              professor: foundprofessor,
              warden: wardenFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.post("/warden/:id/leave/:Prof_id/info", (req, res) => {
  Warden.findById(req.params.id).exec((err, wardenFound) => {
    if (err) {
      req.flash("error", "warden not found with requested id");
      res.redirect("back");
    } else {
      professor.findById(req.params.Prof_id)
        .populate("leaves")
        .exec((err, foundprofessor) => {
          if (err) {
            req.flash("error", "professor not found with this id");
            res.redirect("back");
          } else {
            if (req.body.action === "Approve") {
              foundprofessor.leaves.forEach(function(leave) {
                if (leave.wardenstatus === "pending") {
                  leave.wardenstatus = "approved";

                  leave.save();
                }
              });
            } else {
              console.log("u denied");
              foundprofessor.leaves.forEach(function(leave) {
                if (leave.wardenstatus === "pending") {
                  leave.wardenstatus = "denied";

                  leave.save();
                }
              });
            }
            res.render("WardenmoreinfoProf", {
              professor: foundprofessor,
              warden: wardenFound,
              moment: moment
            });
          }
        });
    }
  });
});
//logout for professor

app.get("/logout", (req, res) => {
  req.logout();
  // req.flash("success", "you are logged out");
  res.redirect("/");
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server started at port http://localhost:${port}`);
});
