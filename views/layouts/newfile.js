/**
 * Created by ashishtyagi9622 on 16/9/17.
 */



function navigation(q) {

}
function done_d() {
    $('#bodybox').toggle('slow');
}
nlp = window.nlp_compromise;
var messages = [], //array that hold the record of each string in chat
    lastUserMessage = "", //keeps track of the most recent input string from the user
    botMessage = "", //var keeps track of what the chatbot is going to say
    botName = 'ChatBot ', //name of the chatbot
    talking = true; //when false the speach function doesn't work

function chatbotResponse() {
    talking = true;
    //the default message

    if (lastUserMessage === 'hi' || lastUserMessage ==='hello') {
        const hi = ['hi','howdy','hello'];
        botMessage = hi[Math.floor(Math.random()*(hi.length))];
    }

    else if (lastUserMessage === 'name') {
        botMessage = 'My name is ' + botName;
    }

    else{

        $.ajax({

            type:'POST',
            async:false,
            url:'http://localhost:3000/askFaq',
            dataType:'json',
            data:{
                "ques":lastUserMessage
            }

        }).done(function (data) {
            console.log("hello",data);
            botMessage=data.answer;
        });
    }

}

function newEntry() {
    //if the message from the user isn't empty then run
    if (document.getElementById("chatbox").value !== "") {
        //pulls the value from the chatbox ands sets it to lastUserMessage
        lastUserMessage = document.getElementById("chatbox").value;
        //sets the chat box to be clear
        document.getElementById("chatbox").value = "";
        //adds the value of the chatbox to the array messages
        messages.push(lastUserMessage);
        //Speech(lastUserMessage);  //says what the user typed outloud
        //sets the variable botMessage in response to lastUserMessage
        chatbotResponse();
        //add the chatbot's name and message to the array messages
        messages.push("<b>" + botName + ":</b> " + botMessage);
        // says the message using the text to speech function written below
        Speech(botMessage);
        //outputs the last few array elements of messages to html
        for (var i = 1; i < 8; i++) {
            if (messages[messages.length - i])
                document.getElementById("chatlog" + i).innerHTML = messages[messages.length - i];
        }
    }
}

function Speech(say) {
    if ('speechSynthesis' in window && talking) {
        var utterance = new SpeechSynthesisUtterance(say);

        speechSynthesis.speak(utterance);
    }
}

document.onkeypress = keyPress;

function keyPress(e) {
    var x = e || window.event;
    var key = (x.keyCode || x.which);
    if (key === 13 || key === 3) {
        //runs this function when enter is pressed
        newEntry();
    }
    if (key === 38) {
        console.log('hi')
    }
}

function placeHolder() {
    document.getElementById("chatbox").placeholder = "";
}

function searching_sub() {
    var q=document.getElementsByClassName('input1')[0].value;
    var loc=document.getElementsByClassName('input2')[0].value;
    var dat=document.getElementsByClassName('input3')[0].value;
    $.ajax({
        type:'POST',
        url:'http://localhost:3000/searching',
        data:{
            q:q,
            loc:loc,
            dat:dat
        },
        success:function (data) {
            console.log("new search---",data);
            var v=document.getElementById('page_succ');
            var m="";
            var n="";
            v.innerHTML="";
            data.forEach(function (d) {

                n="<div class='container1 demo-3'><ul class='grid cs-style-3'><li><figure><img class='img_div' src='"+d.img_link+"' alt='img01'><div class='info_div'><div class='time_div'>"+d.event_date+"</div><div class='name_div'><b>"+d.event_name+"</b></div><div class='location_div'>"+d.event_location+"</div></div><figcaption><h3><button type='button' class='btn btn-primary btn-sm ddt' onclick='buying(this)'><b>BUY TICKETS</b></button>  </h3><a><span class='glyphicon glyphicon-share-alt at'></span><span class='glyphicon glyphicon-bookmark bt' title='save' onclick='saved_function(this)'></span></a></figcaption></figure></li></ul></div>";
                m="<div class='block_i'><div class='content_i'><div class='img_div'><img src='"+d.img_link+"' class='image_d'></div><div class='info_div'><div class='time_div'>"+d.event_date+"</div><div class='name_div'><b>"+d.event_name+"</b></div><div class='location_div'>"+d.event_location+"</div></div></div></div>";
                // v.innerHTML+=m;
                v.innerHTML+=n;
            });
        }
    });
}
function change_pass() {
    document.getElementsByClassName('pass_change')[0].style.display="block";
}
function closing_re_enter() {
    document.getElementsByClassName('enter_email')[0].style.display="none";
}
function change_email() {
    document.getElementsByClassName('enter_email')[0].style.display="block";
}
function stripe_calling(){

    var v=$('.tic_count').text();
    $('.num_tic').val(v);
}
function subtract() {
    var c=parseInt($('.tic_count').text());
    var amount=parseInt($('.base_p').text());
    if(c!==0){
        c-=1;
        $('.tic_count').text(c);
        $('.multiple').text(c);
        amount=amount*c;
        $('.total_pay').text(amount);
        $('.total_pay').val(amount);
    }

    // $('.tic_count').text(c-1);
}
function adding() {
    var d=parseInt($('.tic_count').text());
    var amount=parseInt($('.base_p').text());
    if(d<5){
        d+=1;
        $('.tic_count').text(d);
        $('.multiple').text(d);
        amount=amount*d;
        $('.total_pay').text(amount);
        $('.total_pay').val(amount);
        $('.stripe-button').attr('data-amount',amount);
    }
    else{
        $('.mess').text("Cannot Add");
        $('.mess').fadeIn(600);
        $('.mess').fadeOut(2000,function () {
            $('.mess').text("Saved");
        });
    }

}
function closin(q) {
    $('.cen_buy1').fadeOut();
    $('.cen_buy').fadeOut(100);

}
function buying(q) {
    $('.stripe-button').attr('data-name',"EVENTFULL PAYMENT PORTAL");
    var x=$('.in_name').text();
    $('.stripe-button').attr('data-description',x);
    document.getElementsByClassName('stripe-button-el')[0].style.display='none';
    var im=q.parentNode.parentNode.previousSibling.previousSibling.getAttribute("src");
    var n=q.parentNode.parentNode.previousSibling.childNodes;
    var t=n[0].textContent;
    var na=n[1].textContent;
    var loc=n[2].textContent;
    $('.cen_buy1').fadeIn();
    $('.cen_buy').fadeIn(100);
    $('.img_check').attr("src",im);
    $('.in_time').text(t);
    $('.in_name').html("<b>"+na+"</b>");
    $('.in_location').text(loc);
    $('.time').val(t);
    $('.location').val(loc);
    $('.name').val(na);
    $('.send_img').val(im);




    // var doc=document.getElementsByClassName('cen_buy')[0];
    // var doc1=document.getElementsByClassName('cen_buy1')[0];
    // doc1.style.display='block';
    // console.log("hello",doc.style);
    // doc.style.display='block';
    // doc1.fadeIn();
}
function saved_function(q) {
    var s=q.previousSibling.parentNode.previousSibling.parentNode.previousSibling.childNodes;
    var img=q.previousSibling.parentNode.previousSibling.parentNode.previousSibling.previousSibling.getAttribute("src");
    var d=s[0].textContent;
    var n=s[1].textContent;
    var l=s[2].textContent;
    // document.getElementsByClassName('mess')[0].innerHTML="Saved";
    // $('.mess').text("Saved");
    $('.mess').fadeIn(800);
    $('.mess').fadeOut(2000);

    // setTimeout(2000,function () {
    //     $('.mess').style.display="none";
    // });
    $.ajax({
        type:'POST',
        url:'http://localhost:3000/saved',
        data:{date:d,
            name:n,
            loc:l,
            link:img
        },
        success:function (data) {
            console.log(data);
        }
    });
}

function unsaved_function(q) {
    var nam=q.parentNode.parentNode.parentNode.childNodes[3].childNodes[3].textContent;
    var del=q.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute("id");
    console.log(del);
    document.getElementsByClassName('mess')[0].innerHTML="Unsaved";
    $('.mess').fadeIn(800);
    $('.mess').fadeOut(2000);
    var ele=document.getElementById(del);
    ele.parentNode.removeChild(ele);
    var c=document.getElementsByClassName('count_s');
    c[0].innerHTML-=1;
    $.ajax({
        type:'POST',
        url:'http://localhost:3000/unsaved',
        data:{
            name:nam,
            index:del

        },
        success:function (data) {
            console.log(data);
        }
    });
}
function switching1() {
    var u_a=document.getElementsByClassName('upcoming_a')[0];
    var u_d=document.getElementsByClassName('up_div')[0];
    var s_a=document.getElementsByClassName('saved_a')[0];
    var s_d=document.getElementsByClassName('sa_div')[0];
    var p_a=document.getElementsByClassName('past_events_a')[0];
    var p_d=document.getElementsByClassName('pa_div')[0];
    console.log(u_a);
    console.log(u_d);
    console.log(s_a);
    console.log(s_d);
    console.log(p_a);
    console.log(p_d);

    u_a.style.display="block";
    u_d.style.display="block";
    s_a.style.display="none";
    s_d.style.display="none";
    p_a.style.display="none";
    p_d.style.display="none";


}
function switching2() {
    var u_a=document.getElementsByClassName('upcoming_a')[0];
    var u_d=document.getElementsByClassName('up_div')[0];
    var s_a=document.getElementsByClassName('saved_a')[0];
    var s_d=document.getElementsByClassName('sa_div')[0];
    var p_a=document.getElementsByClassName('past_events_a')[0];
    var p_d=document.getElementsByClassName('pa_div')[0];
    u_a.style.display="none";
    u_d.style.display="none";
    s_a.style.display="block";
    s_d.style.display="block";
    p_a.style.display="none";
    p_d.style.display="none";

}
function switching3() {
    var u_a=document.getElementsByClassName('upcoming_a')[0];
    var u_d=document.getElementsByClassName('up_div')[0];
    var s_a=document.getElementsByClassName('saved_a')[0];
    var s_d=document.getElementsByClassName('sa_div')[0];
    var p_a=document.getElementsByClassName('past_events_a')[0];
    var p_d=document.getElementsByClassName('pa_div')[0];
    u_a.style.display="none";
    u_d.style.display="none";
    s_a.style.display="none";
    s_d.style.display="none";
    p_a.style.display="block";
    p_d.style.display="block";
    console.log(u_a);
    console.log(u_d);
    console.log(s_a);
    console.log(s_d);
    console.log(p_a);
    console.log(p_d);

}
function clicked_toggle() {
    var a=$('#acc_buttt2')[0];
    var cn=a.getAttribute('class');
    var b=$('.acc_buttt')[0];
    console.log(cn,b);
    if(cn.includes('glyphicon-chevron-down'))
    {
        b.innerHTML=" ";
        b.innerHTML="<span class='glyphicon glyphicon-calendar acc_buttt1'></span>Payments<span class='glyphicon glyphicon-chevron-up' id='acc_buttt2'></span>";
        $(".dis2").toggle("slow");
    }
    else if(cn.includes('glyphicon-chevron-up'))
    {
        b.innerHTML=" ";
        b.innerHTML="<span class='glyphicon glyphicon-calendar acc_buttt1'></span>Payments<span class='glyphicon glyphicon-chevron-down' id='acc_buttt2'></span>";
        $(".dis2").toggle("slow");
    }
}
function clicked_toggle2() {
    var a=$('#acc_buttt22')[0];
    var cn=a.getAttribute('class');
    var b=$('.acc_buttt3')[0];
    console.log(cn,b);
    if(cn.includes('glyphicon-chevron-down'))
    {
        b.innerHTML=" ";
        b.innerHTML="<span class='glyphicon glyphicon-user acc_buttt1'></span>Account<span class='glyphicon glyphicon-chevron-up' id='acc_buttt22'></span>";
        $('.dis1').toggle("slow");
    }
    else if(cn.includes('glyphicon-chevron-up'))
    {
        b.innerHTML=" ";
        b.innerHTML="<span class='glyphicon glyphicon-user acc_buttt1'></span>Account<span class='glyphicon glyphicon-chevron-down' id='acc_buttt22'></span>";
        $('.dis1').toggle("slow");
    }
}
function set_color(q) {
    console.log(q.getAttribute("css"));
    q.style="background-color: #9ccc65;color: white;";
}
$( ".fil_but" ).click(function() {
    $( ".filter" ).slideToggle( "medium" );
});
function cancel_but() {
    var c=document.getElementById('close_but');
    c.style="display:block";
    var v=document.getElementById('output1');
    v.style="border:none";
}
function closing() {
    console.log("aagya");
    var v=document.getElementById('output1');
    v.value=" ";
    v.style="border:1px solid";
    var c=document.getElementById('close_but');
    c.style="display:none";
}
google.maps.event.addDomListener(window, 'load', initialize);
function initialize() {
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('location_2'));
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var data = autocomplete.getPlace();
        var length=parseInt(JSON.stringify(data['address_components']['length']));
        var local=JSON.stringify(data['address_components'][0]['long_name']);
        var s1=local.substring(1,local.length-1);
        var state1=JSON.stringify(data['address_components'][length-1]['long_name']);
        var s2=state1.substring(1,state1.length-1);
        var country1=JSON.stringify(data['address_components'][length-2]['long_name']);
        var s3=country1.substring(1,country1.length-1);
        var location = s1+", "+s2+", "+s3;
        var lo= document.getElementById('output1');
           lo.value=location;
        $.ajax({
            type:'POST',
            url:'http://localhost:3000/loca',
            data:{state:s1,
                country:s2
            },
            success:function (data) {
                console.log("success---",data);
                var v=document.getElementById('page_succ');
                var m="";
                var n="";
                v.innerHTML="";
                data.forEach(function (d) {

                    n="<div class='container1 demo-3'><ul class='grid cs-style-3'><li><figure><img class='img_div' src='"+d.img_link+"' alt='img01'><div class='info_div'><div class='time_div'>"+d.event_date+"</div><div class='name_div'><b>"+d.event_name+"</b></div><div class='location_div'>"+d.event_location+"</div></div><figcaption><h3><button type='button' class='btn btn-primary btn-sm ddt' onclick='buying(this)'><b>BUY TICKETS</b></button>  </h3><a><span class='glyphicon glyphicon-share-alt at'></span><span class='glyphicon glyphicon-bookmark bt' title='save' onclick='saved_function(this)'></span></a></figcaption></figure></li></ul></div>";
                    m="<div class='block_i'><div class='content_i'><div class='img_div'><img src='"+d.img_link+"' class='image_d'></div><div class='info_div'><div class='time_div'>"+d.event_date+"</div><div class='name_div'><b>"+d.event_name+"</b></div><div class='location_div'>"+d.event_location+"</div></div></div></div>";
                    // v.innerHTML+=m;
                    v.innerHTML+=n;
                });
            }
        });
    });
    var loctio=new google.maps.places.Autocomplete(document.getElementById('output1'));
    google.maps.event.addListener(loctio, 'place_changed', function () {
        var data = loctio.getPlace();
        var length=parseInt(JSON.stringify(data['address_components']['length']));
        var local=JSON.stringify(data['address_components'][0]['long_name']);
        var s1=local.substring(1,local.length-1);
        var state1=JSON.stringify(data['address_components'][length-1]['long_name']);
        var s2=state1.substring(1,state1.length-1);
        var country1=JSON.stringify(data['address_components'][length-2]['long_name']);
        var s3=country1.substring(1,country1.length-1);
        var location = s1+", "+s2+", "+s3;
        var lo= document.getElementById('location_2');
        lo.value=location;
        $.ajax({
            type:'POST',
            url:'http://localhost:3000/loca',
            data:{state:s1,
                country:s2
            },
            success:function (data) {
                console.log("success---",data);
                var v=document.getElementById('page_succ');
                var m="";
                var n="";
                v.innerHTML="";
                data.forEach(function (d) {

                    n="<div class='container1 demo-3'><ul class='grid cs-style-3'><li><figure><img class='img_div' src='"+d.img_link+"' alt='img01'><div class='info_div'><div class='time_div'>"+d.event_date+"</div><div class='name_div'><b>"+d.event_name+"</b></div><div class='location_div'>"+d.event_location+"</div></div><figcaption><h3><button type='button' class='btn btn-primary btn-sm ddt' onclick='buying(this)'><b>BUY TICKETS</b></button></h3><a><span class='glyphicon glyphicon-share-alt at' title='share'></span><span class='glyphicon glyphicon-bookmark bt' title='save' onclick='saved_function(this)'></span></a></figcaption></figure></li></ul></div>";
                    m="<div class='block_i'><div class='content_i'><div class='img_div'><img src='"+d.img_link+"' class='image_d'></div><div class='info_div'><div class='time_div'>"+d.event_date+"</div><div class='name_div'><b>"+d.event_name+"</b></div><div class='location_div'>"+d.event_location+"</div></div></div></div>";
                    // v.innerHTML+=m;
                    v.innerHTML+=n;
                });
            }
        });
    });
}
var currentBackground = 0;

var backgrounds = ['url(SING.jpg)','url(WINE.jpg)','url(party2.jpg)','url(bADIA.jpg)'];

function changeBackground() {

    currentBackground++;

    if(currentBackground > 3) currentBackground = 0;

    $('.back_pic').fadeOut(150,function() {
        $('.back_pic').css({
            'background-image' :  backgrounds[currentBackground]
        });
        $('.back_pic').fadeIn(150);
    });


    setTimeout(changeBackground, 6000);
}

$(document).ready(function() {

    setTimeout(changeBackground, 6000);

});

//code for sending location to server



//code for finding latitude and longitude and then converting lat long to geolocation
function geocode(){
    // var pin=document.getElementById("pin");
    if (!navigator.geolocation){
        output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
        return;
    }

    function displayLocation(latitude,longitude){
        var request = new XMLHttpRequest();


        var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude+'&sensor=true';

        var getJSON = function(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.onload = function() {
                var status = xhr.status;
                if (status === 200) {
                    callback(null, xhr.response);
                } else {
                    callback(status, xhr.response);
                }
            };
            xhr.send();
        };


        getJSON(url,
            function(err, data) {
                if (err !== null) {
                    alert('Something went wrong: ' + err);
                }
                else {

                    var length=parseInt(JSON.stringify(data['results'][0]['address_components']['length']));
                    var length1=length;

                    console.log(data);
                    var local=JSON.stringify(data['results'][0]['address_components'][length-5]['long_name']);

                    var s1=local.substring(1,local.length-1);
                    var state1=JSON.stringify(data['results'][0]['address_components'][length-3]['long_name']);
                    var s2=state1.substring(1,state1.length-1);
                    var country1=JSON.stringify(data['results'][0]['address_components'][length-2]['long_name']);
                    var s3=country1.substring(1,country1.length-1);
                    // var pin1=JSON.stringify(data['results'][0]['address_components'][9]['long_name']);

                        $.ajax({
                            type:'POST',
                            url:'http://localhost:3000/loca',
                            data:{state:s1
                                },
                            success:function (data) {
                                console.log("success---",data);
                                var v=document.getElementById('page_succ');
                                var m="";
                                var n="";
                                v.innerHTML="";
                                data.forEach(function (d) {

                                    n="<div class='container1 demo-3'><ul class='grid cs-style-3'><li><figure><img class='img_div' src='"+d.img_link+"' alt='img01'><div class='info_div'><div class='time_div'>"+d.event_date+"</div><div class='name_div'><b>"+d.event_name+"</b></div><div class='location_div'>"+d.event_location+"</div></div><figcaption><h3><button type='button' class='btn btn-primary btn-sm ddt' onclick='buying(this)'><b>BUY TICKETS</b></button></h3><a><span class='glyphicon glyphicon-share-alt at'></span><span class='glyphicon glyphicon-bookmark bt' title='save' onclick='saved_function(this)'></span></a></figcaption></figure></li></ul></div>";
                                    m="<div class='block_i'><div class='content_i'><div class='img_div'><img src='"+d.img_link+"' class='image_d'></div><div class='info_div'><div class='time_div'>"+d.event_date+"</div><div class='name_div'><b>"+d.event_name+"</b></div><div class='location_div'>"+d.event_location+"</div></div></div></div>";
                                    // v.innerHTML+=m;
                                    v.innerHTML+=n;
                                });
                            }
                        });
                    var loca=s1+", "+s2+", "+s3;
                    var loc=s1+", "+s3;
                    var input = document.getElementById("location_2");
                    var val= document.getElementById("output1");
                    input.value=loc;
                    val.value=loca;
                    // pin.innerHTML=pin1;

                }
            });


    }

    var successCallback = function(position){
        var x = position.coords.latitude;
        var y = position.coords.longitude;
        displayLocation(x,y);
    };

    var errorCallback = function(error){
        var errorMessage = 'Unknown error';
        switch(error.code) {
            case 1:
                errorMessage = 'Permission denied';
                break;
            case 2:
                errorMessage = 'Position unavailable';
                break;
            case 3:
                errorMessage = 'Timeout';
                break;
        }
        document.write(errorMessage);
    };

    var options = {
        enableHighAccuracy: true,
        timeout: 2000,
        maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback,options);
}
geocode();

function prompt(window, pref, message, callback) {
    var branch = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefBranch);

    if (branch.getPrefType(pref) === branch.PREF_STRING) {
        switch (branch.getCharPref(pref)) {
            case "always":
                return callback(true);
            case "never":
                return callback(false);
        }
    }

    var done = false;

    function remember(value, result) {
        return function() {
            done = true;
            branch.setCharPref(pref, value);
            callback(result);
        }
    }

    var self = window.PopupNotifications.show(
        window.gBrowser.selectedBrowser,
        "geolocation",
        message,
        "geo-notification-icon",
        {
            label: "Share Location",
            accessKey: "S",
            callback: function(notification) {
                done = true;
                callback(true);
            }
        }, [
            {
                label: "Always Share",
                accessKey: "A",
                callback: remember("always", true)
            },
            {
                label: "Never Share",
                accessKey: "N",
                callback: remember("never", false)
            }
        ], {
            eventCallback: function(event) {
                if (event === "dismissed") {
                    if (!done) callback(false);
                    done = true;
                    window.PopupNotifications.remove(self);
                }
            },
            persistWhileVisible: true
        });
}

prompt(window,
    "extensions.foo-addon.allowGeolocation",
    "Foo Add-on wants to know your location.",
    function callback(allowed) {
        alert(allowed);
    });

//******************************************************


