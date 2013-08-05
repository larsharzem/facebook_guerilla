$(window).load(initFB());

var iFrameEnv = false;

var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
var pass  = "";

for(x = 0; x < 20; x++)
{
	i = Math.floor(Math.random() * 62);
	pass += chars.charAt(i);
}

function initFB()
{
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
				
				$("#headline").html("Hallo, " + FB.me.name + "!");
				$("#content").show();
				$("#listThreadsButton").prop("disabled", false);
			});
		}
		else if (response.status === 'not_authorized')
		{
			console.log("not_authorized");
			$("#headline").html("Please allow Pop-Ups for this site and then add MyChatHistory to your Facebook Apps.");
			login();
		}
		else
		{
			console.log("not_logged_in");
			$("#headline").html("Please log into Facebook or allow Pop-Ups for this site.");
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
				
				$("#headline").html("Hallo, " + FB.me.name + "!");
				$("#content").show();
				$("#listThreadsButton").prop("disabled", false);
			});
		}
		else
		{
			// cancelled
			$("#headline").html("Error connection to Facebok. Please check if JavaScript is allowed for this site.");
		}
	}, {scope: 'user_likes,read_mailbox'});
}

function sendAccessTokenToRails(at, id)
{
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