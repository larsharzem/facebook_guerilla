$(window).load(initFB());

var iFrameEnv = true;

function initFB()
{
	// console.log("initFB");
	
	FB.init({
		appId      : "320250034746634", // App ID
		status     : true, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		xfbml      : true, // parse XFBML
    channelUrl : "//cryptic-badlands-6090.herokuapp.com/"
	});
	
	FB.getLoginStatus(function(response)
	{
		// console.log("getLoginStatus: " + formatJSON(response));
		if (response.status === 'connected')
		{
			sendAccessTokenToRails(response.authResponse.accessToken, response.authResponse.userID);
			// connected
			FB.api('/me', function(me)
			{
				FB.me = me;
				
				listThreads();
			});
		}
		else if (response.status === 'not_authorized')
		{
			console.log("not_authorized");
			alert("Facebook Misfunct: Please allow Pop-Ups for this site and then add MyChatHistory to your Facebook Apps.");
			login();
		}
		else
		{
			console.log("not_logged_in"); // this should never happen here because the user needs to have FB open to open this site
			alert("Facebook Misfunct: Please log into Facebook or allow Pop-Ups for this site.");
			login();
		}
	}, true); //second argument forces a refresh from Facebook's server.
}

function login()
{
	FB.login(function(response)
	{
		// console.log("login: " + formatJSON(response));
		if (response.authResponse)
		{
			sendAccessTokenToRails(response.authResponse.accessToken, response.authResponse.userID);
			// connected
			FB.api('/me', function(me)
			{
				FB.me = me;
				
				listThreads();
			});
		}
		else
		{
			// cancelled, nothing to do here
			alert("Facebook Misfunct: Error connection to Facebok. Please check if JavaScript is allowed for this site.");
		}
	}, {scope: 'user_likes,read_mailbox'});
}

function sendAccessTokenToRails(at, id)
{
	if (id != user_id)
	{
		alert("Could not log in, given user id does not match with the one from Facebook.");
		return;
	}
	
	$.ajax(
	{
		url : window.location.protocol + "//cryptic-badlands-6090.herokuapp.com/post_access_token",
		dataType: 'json',
		type: "POST",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({
			"access_token" : at,
			"pass" : pass,
			"user_id" : id
			}),
		complete: function(xhr, textStatus)
		{
			if (xhr.status == 200) {
				// console.log(textStatus);
			}
			else
			{
				alert("Fehler: " + textStatus);
			}
		}
	});
}