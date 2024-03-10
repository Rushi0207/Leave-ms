var mongoose=require("mongoose");
var bcrypt=require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");

var professorSchema=new mongoose.Schema({
    name:String,
    type:String,
    emailId:String,
    password:String,
    department:String,
    mobileno:String,
    image:String,
    leaves:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Leave"
    }]
});
professorSchema.plugin(passportLocalMongoose);
var Professor=(module.exports = mongoose.model("Professor",professorSchema));

module.exports.createProfessor = function(newProfessor,callback) {
    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(newProfessor.password,salt,function(err,hash){
            newProfessor.password = hash;
            newProfessor.save(callback);
        });
    });
};

module.exports.getUserByEmail = function(emailId,callback){
    var query={emailId: emailId};
    Professor.findOne(query,callback);
};

module.exports.getUserById =  function(id,callback){
    Professor.findById(id,callback);
};

module.exports.comparePassword = function(candidatePassword,hash,callback){
    bcrypt.compare(candidatePassword, hash, function(err, passwordFound){
        if(err) throw err;
        callback(null,passwordFound);
    });
};

