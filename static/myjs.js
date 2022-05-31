
var lastSentMessage = "";
var lastRecievedMessage = 1;
var ButtonClicked = false;
console.log("hello");

var DEFAULT_TIME_DELAY = 1000;

// Variable for the chatlogs div
var $chatlogs = $('.chatlogs');
	

$('document').ready(function(){
    $('.iconInner').click(function(e) {
		jQuery(this).parents('.botIcon').addClass('showBotSubject');
		$("[name='msg']").focus();
	});
    
    jQuery(document).on('click', '.closeBtn, .chat_close_icon', function(e) {
		jQuery(this).parents('.botIcon').removeClass('showBotSubject');
		jQuery(this).parents('.botIcon').removeClass('showMessenger');
	});
    speechResponse("Hi! I am Prashna! How may I help?");
	console.log("hello2");
	// Hide the switch input type button initially
	$("#switchInputType").toggle();

    	// Primary function sends the text which the user typed
	$("textarea").keypress(function(event) {
		
		// If the enter key is pressed
		if(event.which === 13 && this.value!="" ) {

			// Ignore the default function of the enter key(Dont go to a new line)
			event.preventDefault();

			ButtonClicked = false;

			// Call the method for sending a message, pass in the text from the user
			send(this.value);
			
			// reset the size of the text area
			$(".input").attr("rows", "1");

			// Clear the text area
			this.value = "";

			if($("#switchInputType").is(":visible")) {
				$("#switchInputType").toggle();
				$('.buttonResponse').remove();
			}

		}
	});

    $("#send").click(function(event) {
        if (document.getElementById("inputText").value != "")
		{send(document.getElementById("inputText").value);
        document.getElementById("inputText").value="" }
	});

  $("#rec").click(function(event) {
    console.log("recording started")
      $.get("/voice", {}).done(function(data) {
              send(data);
              console.log("recording sucessful")
      });
	}); 

});



    function send(text) {

        // Create a div with the text that the user typed in
        $chatlogs.append(
            $('<div/>', {'class': 'chat self'}).append(
                $('<p/>', {'class': 'chat-message', 'text': text})));
    
        // Find the last message in the chatlogs
        var $sentMessage = $(".chatlogs .chat").last();
        
        // Check to see if that message is visible
        checkVisibility($sentMessage);
    
        // update the last message sent variable to be stored in the database and store in database
        lastSentMessage = text;
        //storeMessageToDB();
    
        $.get("/get", { msg: text }).done(function(data) {
        
            newRecievedMessage(data);
        });
    }
    function checkVisibility(message)
    {
        // Scroll the view down a certain amount
        $chatlogs.stop().animate({scrollTop: $chatlogs[0].scrollHeight});
    }

    function newRecievedMessage(messageText) {

        // Variable storing the message with the "" removed
        var removedQuotes = messageText //.replace(/[""]/g,"");
    
        // update the last message recieved variable for storage in the database
        lastRecievedMessage = removedQuotes;
    
            // Show the typing indicator
            showLoading();
    
            // After 3 seconds call the createNewMessage function
            setTimeout(function() {
                createNewMessage(removedQuotes);
            }, DEFAULT_TIME_DELAY);
    }

    function createNewMessage(message) {

        // Hide the typing indicator
        hideLoading();
    
        // take the message and say it back to the user.
        speechResponse(message);
    
        // // Show the send button and the text area
        // $('#rec').css('visibility', 'visible');
        // $('textarea').css('visibility', 'visible');
    
        var html_message = $.parseHTML(message);

        // Append a new div to the chatlogs body
        $chatlogs.append(
            $('<div/>', {'class': 'chat friend'}).append(
                $('<div/>', {'class': 'user-photo'}).append($('<img src="../static/Images/R.jpg" />')), 
                $('<p/>', {'class': 'chat-message'}).append($(html_message))));
    
        // Find the last message in the chatlogs
        var $newMessage = $(".chatlogs .chat").last();
    
        // Call the method to see if the message is visible
        checkVisibility($newMessage);
    }    

    function showLoading()
{
	$chatlogs.append($('#loadingGif'));
	$("#loadingGif").show();

	// $('#rec').css('visibility', 'hidden');
	// $('textarea').css('visibility', 'hidden');

	//$('.chat-form').css('visibility', 'hidden');
 }

 function hideLoading()
{
	$('.chat-form').css('visibility', 'visible');
	$("#loadingGif").hide();

	// Clear the text area of text
	$(".input").val("");

	// reset the size of the text area
	$(".input").attr("rows", "1");
	
}
       
function speechResponse(message)
{

	var msg = new SpeechSynthesisUtterance();

	// These lines list all of the voices which can be used in speechSynthesis
	//var voices = speechSynthesis.getVoices();
	//console.log(voices);
	
	
	msg.default = false;
// 	msg.voiceURI = "Fiona";
	msg.name = "Microsoft Heera - English (India)";
	msg.localService = true;
  	msg.text = message;
  	msg.lang = "en-IN";
	msg.rate = .9;
	msg.volume = 100;
  	window.speechSynthesis.speak(msg);

}
    