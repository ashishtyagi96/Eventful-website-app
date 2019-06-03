'use strict';
var schedule=require('node-schedule');
var nodemailer = require('nodemailer');
var smtpConfig = {
    service: 'Gmail',

    auth: {
        user: 'eventfullmailer@gmail.com',
        pass: 'eventfull#2017'
    }

};

var transporter = nodemailer.createTransport(smtpConfig);

var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'); //config file contains all tokens and other private info

// MongoDB connection information
var mongodbUrl = 'mongodb://' + config.mongodbHost + ':27017/users';
var MongoClient = require('mongodb').MongoClient;

exports.change_email=function (user,q) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        collection.findOne({'username':user}).then(function (result) {
            collection.update({'username':user},{$set:{"username":q.re_enter}});
            console.log("changed");
        })
    });
};
exports.searching_events=function (q,loc,dat,callback) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('events');
        var app=collection.find();
        var obj=[];
        var l=loc.split(',');
        var newdate=new Date().toString().replace(/T/, ':').replace(/\.\w*/, '');
        var newdate1=newdate.substring(4,24);
        var s=newdate1.split(" ");
        var c_month=s[0];
        var c_date=parseInt(s[1]);
        app.forEach(function (result) {
            var m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var str=result.event_name.toUpperCase();
            var str1=result.event_location.toUpperCase();
            var str2=result.event_date;
            var date_e=parseInt(str2.split(',')[1].split(' ')[1]);
            var month_e=str2.split(',')[1].split(' ')[0];
            var i=m.indexOf(c_month);
            console.log(dat,month_e,c_month,date_e,c_date);
            if(dat===''){

                if(((q==='')||(str.includes(q.toUpperCase())===true))&&((str1.includes(l[0].toUpperCase())===true)||(str1.includes(l[1].toUpperCase())))){

                    obj.push(result);
                }
            }
            else if((dat==='today')&&(month_e===c_month)&&(date_e===c_date)){
                console.log("today");
                if(((q==='')||(str.includes(q.toUpperCase())===true))&&((str1.includes(l[0].toUpperCase())===true)||(str1.includes(l[1].toUpperCase())))){

                    obj.push(result);
                }
            }
            else if((dat==='tomorrow')&&(month_e===c_month)&&(date_e===c_date+1)){
                console.log("tomorrow");
                if(((q==='')||(str.includes(q.toUpperCase())===true))&&((str1.includes(l[0].toUpperCase())===true)||(str1.includes(l[1].toUpperCase())))){

                    obj.push(result);
                }
            }
            else if ((dat === 'next_month')&&(m[i+1]===month_e)){
                console.log("next month");
                if(((q==='')||(str.includes(q.toUpperCase())===true))&&((str1.includes(l[0].toUpperCase())===true)||(str1.includes(l[1].toUpperCase())))){

                    obj.push(result);
                }
            }

        });

        setTimeout(function () {
            callback(obj);
        },1000);
    });
};
exports.updating_upcoming=function (user) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        var newdate=new Date().toString().replace(/T/, ':').replace(/\.\w*/, '');
        var newdate1=newdate.substring(4,24);
        var s=newdate1.split(" ");
        var c_month=s[0];
        var c_date=parseInt(s[1]);
        collection.update({username:user},{$set:{"upcoming_events.count":0}});
        collection.update({username:user},{$set:{"upcoming_events.events":[]}});
        collection.update({username:user},{$set:{"past_events.events":[]}});
        collection.findOne({'username':user}).then(function (result) {
            var rs=result.payments;
            var savedd=[];
            var saved=[];
            var count=0;

            rs.forEach(function (r) {

                var b=r.event_info.time;
                var month=b.split(',')[1].split(' ')[0];
                var dat=parseInt(b.split(',')[1].split(' ')[1]);
                if(c_month===month){
                    console.log("enter");
                    if(c_date===dat){
                        console.log("send mail for today is the event");
                    }
                    else if (dat<c_date){
                        console.log("past event");

                        savedd.push({
                            event_date:r.event_info.time,
                            event_name:r.event_info.name,
                            event_location:r.event_info.location,
                            img_link:r.event_info.img,
                            n_tic:r.event_info.number_of_tickets
                        });
                        collection.update({username:user},{$set:{"past_events.events":savedd}});
                    }
                    else if(dat>c_date){
                        console.log("upcoming");
                        saved.push({
                            event_date:r.event_info.time,
                            event_name:r.event_info.name,
                            event_location:r.event_info.location,
                            img_link:r.event_info.img,
                            n_tic:r.event_info.number_of_tickets
                        });
                        count++;
                        collection.update({username:user},{$set:{"upcoming_events.count":count}});
                        collection.update({username:user},{$set:{"upcoming_events.events":saved}});
                    }
                }
                else{

                    console.log("upcoming");
                    saved.push({
                        event_date:r.event_info.time,
                        event_name:r.event_info.name,
                        event_location:r.event_info.location,
                        img_link:r.event_info.img,
                        n_tic:r.event_info.number_of_tickets
                    });
                    count++;
                    collection.update({username:user},{$set:{"upcoming_events.count":count}});
                    collection.update({username:user},{$set:{"upcoming_events.events":saved}});

                }
            })
        })
    });
};
exports.adding_bought_event=function (user,data) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        collection.findOne({'username':user}).then(function (result) {

        })
    });
};
exports.adding_payment=function (user,data) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        var info={
            "email":data.source.name,
            "mode":data.source.object,
            "funding":data.source.funding,
            "last_4":data.source.last4,
            "card_type":data.source.brand,
            "amount":(data.amount)/100,
            "event_info":data.metadata,
            "reminder_mail":false
        };
        var pay=[];
        var mailOptions = {
            from: '"Eventfull" <eventfullmailer@gmail.com',
            to: data.source.name,
            subject: 'PAYMENT DONE',
            text: 'TICKETS',
            html:'<h2>Payment successful</h2>' +
            '<h3>Event Information:-</h3>' +
            '<h4>Event Name:-</h4>' +data.metadata.name+
            '<h4>Event Location:-</h4>' +data.metadata.location+
            '<h4>Event Time:-</h4>' +data.metadata.time+
            '<h4>Number of Tickets:-</h4>'+ data.metadata.number_of_tickets+'<br>'
        };
        var mailOptions1={
            from: '"Eventfull" <eventfullmailer@gmail.com',
            to: data.source.name,
            subject: 'REMINDER',
            text: 'TICKETS',
            html:'<h2>Your Event is here</h2>'+
            '<h3>Event Information:-</h3>' +
            '<h4>Event Name:-</h4>' +data.metadata.name+
            '<h4>Event Location:-</h4>' +data.metadata.location+
            '<h4>Event Time:-</h4>' +data.metadata.time+
            '<h4>Number of Tickets:-</h4>'+ data.metadata.number_of_tickets+'<br>'
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
        var mon=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var t=data.metadata.time;
        var ti=t.split(',')[1].split(' ');
        var mo=ti[0];
        var da=parseInt(ti[1]);
        var i=mon.indexOf(mo);

        var viewDate = new Date(2017,i+1,da,12,7,0);

        //region of code where I setup scheduled email.
        // I get no errors, however it is not sending an email either.
        var j = schedule.scheduleJob(viewDate, function () {
            console.log('Sending  reminder Email.');
            transporter.sendMail(mailOptions1, function(error, info){
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
        });
        collection.findOne({'username':user}).then(function (result) {
            pay=result.payments;
            pay.push(info);
            collection.update({username:user},{$set:{"payments":pay}});
        });
    });
};
exports.adding_event = function (data,l) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('events');
        // console.log("insert hogaya");
        var i;
        if(data.length===l){
            l=data.length;
        }
        for(i=0;i<l;i++){
            collection.insert(data[i]);
        }
    });
};
//used in local-signup strategy
exports.localReg = function (username, password,first_name,last_name) {
    var deferred = Q.defer();

    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');

        //check if username is already assigned in our database
        collection.findOne({'username' : username})
            .then(function (result) {
                if (null !== result) {
                    console.log("USERNAME ALREADY EXISTS:", result.username);
                    deferred.resolve(false); // username exists
                }
                else  {
                    var hash = bcrypt.hashSync(password, 8);
                    var newdate=new Date().toString().replace(/T/, ':').replace(/\.\w*/, '');
                    var newdate1=newdate.substring(4,24);
                    var user = {
                        "username": username,
                        "password": hash,
                        "first_name":first_name,
                        "last_name":last_name,
                        "date_account_created":newdate1,
                        "upcoming_events":{
                            "count":0,
                            "events":[]
                        },
                        "saved_events":{
                            "count":0,
                            "events":[]
                        },
                        "past_events":{
                            "events":[]
                        }
                    };

                    console.log("CREATING USER:", username);

                    collection.insert(user)
                        .then(function () {
                            db.close();
                            deferred.resolve(user);
                        });
                }
            });
    });

    return deferred.promise;
};



//check if user exists
//if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
//if password matches take into website
//if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function (username, password) {
    var deferred = Q.defer();

    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');

        collection.findOne({'username' : username})
            .then(function (result) {
                if (null === result) {
                    console.log("USERNAME NOT FOUND:", username);

                    deferred.resolve(false);
                }
                else {
                    var hash = result.password;

                    console.log("FOUND USER: " + result.username);

                    if (bcrypt.compareSync(password, hash)) {
                        deferred.resolve(result);

                    } else {
                        console.log("AUTHENTICATION FAILED");
                        deferred.resolve(false);
                    }
                }

                db.close();
            });
    });

    return deferred.promise;
};
exports.get_user=function(data1,callback){
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        var app=collection.find({username:data1});
        app.forEach(function (result) {
            callback(result);
        });


    });
};
exports.delete_acc=function (user) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        var app=collection.findOne({username:user});
        collection.remove({"username":user});
    });
};
exports.saving_details=function (user,data) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        var app=collection.find({username:user});
        collection.update({username:user},{$set:{"account_settings.contact_info":data}});
    });
};
exports.change_password=function (user,data) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        var app=collection.find({username:user});
        // collection.update({username:user},{$set:{"account_settings.contact_info":data}});
    });
};
exports.unsaving=function (data1,data2) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        var app=collection.find({username:data2});
        app.forEach(function (result) {
            var count=result.saved_events.count;
            var saved=result.saved_events.events;
            var save=[];
            saved.forEach(function (result) {
                if(result.event_name===data1.name){

                }
                else{
                    save.push(result);
                }
            });
            count--;
            collection.update({username:data2},{$set:{"saved_events.count":count}});
            collection.update({username:data2},{$set:{"saved_events.events":save}});
        })

    });
};
exports.saving=function (data1,data2) {
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        var app=collection.find({username:data2});
        app.forEach(function (result) {
            var count=result.saved_events.count;
            var saved=result.saved_events.events;
            saved.push({
                event_date:data1.date,
                event_name:data1.name,
                event_location:data1.loc,
                img_link:data1.link
            });
            count++;
            collection.update({username:data2},{$set:{"saved_events.count":count}});
            collection.update({username:data2},{$set:{"saved_events.events":saved}});
        })

    });
};
exports.location_search = function (data,callback) {

    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('events');
        var app=collection.find();
        var obj=[];
        app.forEach(function (result) {
            var str=result.event_location.toUpperCase();
            if(str.includes(data.state.toUpperCase())===true){
                obj.push(result);
            }
        });

        setTimeout(function () {
            callback(obj);
        },1000);

    });
};
