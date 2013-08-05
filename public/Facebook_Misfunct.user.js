// ==UserScript==
// @name           Facebook Misfunct
// @namespace      http://cryptic-badlands-6090.herokuapp.com/
// @description	   Show the functionality of the Facebook apparatus
// @icon           http://fb.harzem.de/facebook_eraser.png
// @version        0.1
// @grant          metadata
// @include        htt*://*.facebook.com/*
// @match          http://*.facebook.com/*
// @match          https://*.facebook.com/*
// @exclude        htt*://*channel*.facebook.com*
// @exclude        htt*://*static*.facebook.com*
// @exclude        htt*://upload.facebook.com/*
// @exclude        htt*://*.facebook.com/ajax/*
// @exclude				 http*://www.facebook.com/ai.php*
// @require				 https://ajax.googleapis.com/ajax/libs/jquery/2.0.1/jquery.min.js
// ==/UserScript==

var fbMisfunctContent = function()
{
	// set global variables
	this.debugMode = false;
	
	this.externHrefStart = "/l.php?u=";
	this.initialized = false;
	this.reachedEndOfScript = false;
	this.pass = "";
	this.friendMessageCount = {};
	this.storyKeyData = {};
	this.sortedKeyData = [];
	
	this.globalDivTarget = "#contentCol"; // #home_stream
	
	this.activeHrefAttr = "href";
	this.inactiveHrefAttr = "stashed-href";
	this.activeHovercardAttr = "data-hovercard";
	this.inactiveHovercardAttr = "stashed-hovercard";
	this.activeAjaxifyAttr = "data-ajaxify";
	this.inactiveAjaxifyAttr = "stashed-ajaxify";
	this.activeMouseOverAttr = "onmouseover";
	this.inactiveMouseOverAttr = "stashed-onmouseover";
	
	this.init = function()
	{
		console.log("init");
		
		if ($("#misfunctMenuButton").length != 0)
		{
			console.log("present menu");
			$("#misfunctMenuButton").show();
			fbMisfunct.initialized = true;
		}
		else if (fbMisfunct.addMenu())
		{
			fbMisfunct.initialized = true;
		}
	};
	
	this.addMenu = function()
	{
		console.log("adding menu");
		/* Bluebar Button */
		var li = $("<li>",
		{
			class: "navItem lastItem",
			id: "misfunctMenuButton"
		});
		
		var a = $("<a>",
		{
			style: "margin-right: 50px", 
			class: "navLink",
			onClick: "$('#misfunctMenu').toggle()"
		});
		a.appendTo(li);
		
		var span = $("<span>", 
		{
			class: "headerTinymanName",
			html: "Facebook Misfunct"
		});
		span.appendTo(a);
		
		$("#pageNav li:first-child").before(li);

		/* Dropdown menu */
		var div = $("<div>",
		{
			id: "misfunctMenu",
			css:
			{
				display: "none",
				position: "fixed",
				padding: "0 8px",
				color: "#FFFFFF",
				"background-color": "#3B5998"
			}
		});
		
		var ul = $("<ul>");
		ul.appendTo(div);
		
		/* Remove Like and Share buttons */		
		var hideLikesBtn = $("<li>",
		{
			html: "Like & Share-Buttons ausblenden",
			id: "hideLikesBtn",
			css:
			{
				"padding-top": "3px"
			}
		});
		
		var hideLikesBox = $("<input>",
		{
			type: "checkbox",
			id: "hideLikesBox",
			name: "hideLikesBox",
			onclick: "javascript:fbMisfunct.hideLikesToggle()",
			css:
			{
				"margin-left": "-3px"
			}
		});
		$(hideLikesBtn).prepend(hideLikesBox);
		$(ul).append(hideLikesBtn);
		
		/* Hide external links button */		
		var hideLinksBtn = $("<li>",
		{
			html: "Externe Medien ausblenden",
			id: "hideLinksBtn",
			css:
			{
				"padding-top": "3px"
			}
		});
		
		var hideLinksBox = $("<input>",
		{
			type: "checkbox",
			id: "hideLinksBox",
			name: "hideLinksBox",
			onclick: "javascript:fbMisfunct.hideLinksToggle()",
			css:
			{
				"margin-left": "-3px"
			}
		});
		$(hideLinksBtn).prepend(hideLinksBox);
		$(ul).append(hideLinksBtn);
		
		/* Hide external links story container button */		
		var hideLinksStoryBtn = $("<li>",
		{
			html: "den ganzen Beitrag ausbleden",
			id: "hideLinksStoryBtn",
			css:
			{
				"padding-top": "3px"
			}
		});
		
		var hideLinksStoryBox = $("<input>",
		{
			type: "checkbox",
			id: "hideLinksStoryBox",
			name: "hideLinksStoryBox",
			onclick: "javascript:fbMisfunct.hideLinksToggle()",
			disabled: true,
			css:
			{
				"margin-left": "12px"
			}
		});
		$(hideLinksStoryBtn).prepend(hideLinksStoryBox);
		$(ul).append(hideLinksStoryBtn);
		
		/* Remove hrefs button */
		var removeHrefsBtn = $("<li>",
		{
			html: "Alle Links deaktivieren",
			css:
			{
				"padding-top": "3px"
			}
		});
		
		var removeHrefsBox = $("<input>",
		{
			type: "checkbox",
			id: "removeHrefsBox",
			name: "removeHrefsBox",
			onclick: "javascript:fbMisfunct.hideHrefToggle()",
			css:
			{
				"margin-left": "-3px"
			}
		});
		$(removeHrefsBtn).prepend(removeHrefsBox);
		$(ul).append(removeHrefsBtn);
		
		/* Invert News Feed Button */
		var invertNewsFeedBtn = $("<li>",
		{
			html: "News-Feed umsortieren",
			css:
			{
				"padding-top": "3px"
			}
		});
		
		var invertNewsFeedBox = $("<input>",
		{
			type: "checkbox",
			id: "invertNewsFeedBox",
			name: "invertNewsFeedBox",
			onclick: "javascript:fbMisfunct.invertNewsFeedToggle()",
			css:
			{
				"margin-left": "-3px"
			}
		});
		$(invertNewsFeedBtn).prepend(invertNewsFeedBox);
		$(ul).append(invertNewsFeedBtn);
		
		div.appendTo($("#misfunctMenuButton"));
		
		return true;
	};
	
	/* --------------------------------------------------------------------------------------------------------------------------------- */
	
	this.loadSettings = function()
	{
		// console.log("loadSettings");
		if (fbMisfunct.getCookie("likesHidden") == "true")
		{
			fbMisfunct.hideLikes();
			$("#hideLikesBox").attr("checked", "checked");
		}
		
		if (fbMisfunct.getCookie("linksHidden") == "1")
		{
			fbMisfunct.hideLinks(false);
			$("#hideLinksStoryBox").attr("disabled", false);
			$("#hideLinksBox").attr("checked", "checked");
		}
		else if (fbMisfunct.getCookie("linksHidden") == "2")
		{
			fbMisfunct.hideLinks(true);
			$("#hideLinksStoryBox").attr("disabled", false);
			$("#hideLinksBox").attr("checked", "checked");
			$("#hideLinksStoryBox").attr("checked", "checked");
		}
		
		if (fbMisfunct.getCookie("hrefsHidden") == "true")
		{
			$("input#removeHrefsBox").attr("checked", "checked");
			fbMisfunct.hideHrefToggle();
		}
		
		if (fbMisfunct.getCookie("invertedNewsFeed") == "true")
		{
			fbMisfunct.invertNewsFeed();
			$("input#invertNewsFeedBox").attr("checked", "checked");
		}
	};
	
	/* --------------------------------------------------------------------------------------------------------------------------------- */
	
	this.hideLikesToggle = function()
	{
		if ($("#hideLikesBox").prop("checked"))
		{
			fbMisfunct.hideLikes();
			fbMisfunct.addCookie("likesHidden", true);
		}
		else
		{
			fbMisfunct.showLikes();
			fbMisfunct.addCookie("likesHidden", false);
		}
	};
	
	this.hideLikes = function()
	{
		$(fbMisfunct.globalDivTarget).find("a.UFILikeLink").hide();
		$(fbMisfunct.globalDivTarget).find("a.share_action_link").hide();
		
		// add listener
		$(fbMisfunct.globalDivTarget).on('DOMNodeInserted', fbMisfunct.hideLikesListener);
	};
	
	this.showLikes = function()
	{
		$(fbMisfunct.globalDivTarget).find("a.UFILikeLink").show();
		$(fbMisfunct.globalDivTarget).find("a.share_action_link").show();
			
		// remove listener
		$(fbMisfunct.globalDivTarget).off('DOMNodeInserted', fbMisfunct.hideLikesListener);
	};
	
	this.hideLikesListener = function(event)
	{
		$(event.target).find("a.UFILikeLink").hide();
		$(event.target).find("a.share_action_link").hide();
	};
	
	/* --------------------------------------------------------------------------------------------------------------------------------- */

	this.hideLinksToggle = function()
	{
		if ($("#hideLinksBox").prop("checked"))
		{
			if ($("#hideLinksStoryBox").prop("checked"))
			{
				fbMisfunct.hideLinks(true);
				$("#hideLinksStoryBox").attr("disabled", false);
				fbMisfunct.addCookie("linksHidden", 2);
			}
			else
			{
				fbMisfunct.showLinks(false);
				fbMisfunct.hideLinks(false);
				$("#hideLinksStoryBox").attr("disabled", false);
				fbMisfunct.addCookie("linksHidden", 1);
			}
		}
		else
		{
			$("#hideLinksStoryBox").attr("disabled", true);
			fbMisfunct.showLinks(true);
			fbMisfunct.addCookie("linksHidden", 0);
		}
	};
	
	this.showLinks = function(makeAllVisible)
	{
		if (makeAllVisible == undefined)
		{
			makeAllVisible = true;
		}
		console.log("showLinks " + makeAllVisible);
		if (makeAllVisible)
		{
			$("div.shareRedesign").each(function()
			{
				$(this).parent().find("p.replacedContent").remove();
				
				$(this).show();
			
				$(this).closest("li.uiUnifiedStory.uiStreamStory.genericStreamStory").show(); // in case the whole story element was hidden
			});
			
			$("span.photoWrap").each(function()
			{
				$(this).closest("div.clearfix").parent().parent().find("p.replacedContent").remove();
				
				$(this).closest("div.clearfix").parent().show();
				$(this).show();
			
				$(this).closest("li.uiUnifiedStory.uiStreamStory.genericStreamStory").show(); // in case the whole story element was hidden
			});
			
			// remove listener
			$(fbMisfunct.globalDivTarget).off('DOMNodeInserted', fbMisfunct.hideLinksListener);
		}
		else
		{
			$("li.uiUnifiedStory.uiStreamStory.genericStreamStory").show();
		}
	};
	
	this.hideLinks = function(hideStoryContainer)
	{
		if (hideStoryContainer == undefined)
		{
			hideStoryContainer = false;
		}
		// console.log("hideLinks, hide all:" + hideStoryContainer);
		// embedded photos/videos
		$("div.shareRedesign").each(function()
		{
			fbMisfunct.hideEmbeddedLinks(this, hideStoryContainer);
		});
		
		// external links/articles/photos
		$("span.photoWrap").each(function()
		{
			fbMisfunct.hideExternalLinks(this, hideStoryContainer)
		});
		
		// add listener
		$(fbMisfunct.globalDivTarget).on('DOMNodeInserted', fbMisfunct.hideLinksListener);
	};
	
	this.hideEmbeddedLinks = function(elem, hideStoryContainer)
	{
		if (hideStoryContainer == undefined)
		{
			hideStoryContainer = false;
		}
		// console.log("hideEmbeddedLinks");
		// console.log($(elem));
		if (hideStoryContainer)
		{
			$(elem).closest("li.uiUnifiedStory.uiStreamStory.genericStreamStory").hide();
		}
		
		if ($(elem).parent().find("p.replacedContent").length > 0)
		{
			return;
		}
		
		var externHref = $(elem).find("a").last().attr("href");
		if (externHref.indexOf(fbMisfunct.externHrefStart) != -1)
		{
			externHref = externHref.substring(externHref.indexOf(fbMisfunct.externHrefStart) + fbMisfunct.externHrefStart.length, externHref.length - 1);
		}
		
		var p = $("<p>", 
		{
			class: "replacedContent",
			css:
			{
				color: "#AAAAAA"
			},
			html: "Externer Inhalt: " + decodeURIComponent(externHref)
		});
		$(elem).parent().append(p);
		
		$(elem).hide();
	};
	
	this.hideExternalLinks = function(elem, hideStoryContainer)
	{
		if (hideStoryContainer == undefined)
		{
			hideStoryContainer = false;
		}
		// console.log("hideExternalLinks");
		// console.log($(elem));
		if (hideStoryContainer)
		{
			$(elem).closest("li.uiUnifiedStory.uiStreamStory.genericStreamStory").hide();
		}
			
		var elemToModify = $(elem).closest("div.clearfix").parent();
		if ($(elemToModify).parent().find("p.replacedContent").length > 0)
		{
			return;
		}
		
		var externHref = $(elemToModify).find("a").last().attr("href");
		if (externHref.indexOf(fbMisfunct.externHrefStart) != -1)
		{
			externHref = externHref.substring(externHref.indexOf(fbMisfunct.externHrefStart) + fbMisfunct.externHrefStart.length, externHref.length - 1);
		}
		
		var p = $("<p>", 
		{
			class: "replacedContent",
			css:
			{
				color: "#AAAAAA"
			},
			html: "Externer Inhalt: " + decodeURIComponent(externHref)
		});
		$(elemToModify).parent().append(p);
		
		$(elemToModify).hide();
	};
	
	this.hideLinksListener = function(event)
	{
		var targetArticle = event.target;
		if ($(event.target).is("li.uiUnifiedStory.uiStreamStory.genericStreamStory"))
		{
			$(event.target).find("div[role='article']").on('DOMNodeInserted', function(event) 
			{
				// embedded photos/videos
				$(targetArticle).find("div.shareRedesign").each(function()
				{
					fbMisfunct.hideEmbeddedLinks(this, $("#hideLinksStoryBox").prop("checked"));
				});
				
				// external links/articles/photos
				$(targetArticle).find("span.photoWrap").each(function()
				{
					fbMisfunct.hideExternalLinks(this, $("#hideLinksStoryBox").prop("checked"));
				});
			});
		}
	};
	
	/* --------------------------------------------------------------------------------------------------------------------------------- */
	
	this.hideHrefToggle = function()
	{
		var formerActive = fbMisfunct.activeHrefAttr;
		fbMisfunct.activeHrefAttr = fbMisfunct.inactiveHrefAttr;
		fbMisfunct.inactiveHrefAttr = formerActive;
		
		formerActive = fbMisfunct.activeHovercardAttr;
		fbMisfunct.activeHovercardAttr = fbMisfunct.inactiveHovercardAttr;
		fbMisfunct.inactiveHovercardAttr = formerActive;
		
		formerActive = fbMisfunct.activeAjaxifyAttr;
		fbMisfunct.activeAjaxifyAttr = fbMisfunct.inactiveAjaxifyAttr;
		fbMisfunct.inactiveAjaxifyAttr = formerActive;
		
		formerActive = fbMisfunct.activeMouseOverAttr;
		fbMisfunct.activeMouseOverAttr = fbMisfunct.inactiveMouseOverAttr;
		fbMisfunct.inactiveMouseOverAttr = formerActive;
		
		if ($("#removeHrefsBox").prop("checked"))
		{
			fbMisfunct.toggleHrefs();
			fbMisfunct.addCookie("hrefsHidden", true);
			$(fbMisfunct.globalDivTarget).on('DOMNodeInserted', fbMisfunct.removeHrefsListener);
		}
		else
		{
			fbMisfunct.toggleHrefs();
			fbMisfunct.addCookie("hrefsHidden", false);
			$(fbMisfunct.globalDivTarget).off('DOMNodeInserted', fbMisfunct.removeHrefsListener);
		}
	};
	
	this.toggleHrefs = function()
	{
		
		$("a").each(function()
		{
			fbMisfunct.toggleHrefAndHovercard(this);
		});
		
		$("div[" + fbMisfunct.inactiveAjaxifyAttr + "]").each(function()
		{
			fbMisfunct.toggleAjaxify(this);
		});
	};
	
	this.removeHrefsListener = function(event)
	{
		$(event.target).find("a").each(function()
		{
			fbMisfunct.toggleHrefAndHovercard(this);
		});
		
		// $(event.target).find("a").removeAttr("data-ajaxify"); not necessary, only exists in sidebar
	};
	
	this.toggleHrefAndHovercard = function(elem)
	{		
		var href = $(this).attr(fbMisfunct.inactiveHrefAttr);
		if (href != "")
		{
			$(elem).attr(fbMisfunct.activeHrefAttr, href).removeAttr(fbMisfunct.inactiveHrefAttr);
		}
		
		var hovercard = $(elem).attr(fbMisfunct.inactiveHovercardAttr);
		if (hovercard != "")
		{
			$(elem).attr(fbMisfunct.activeHovercardAttr, hovercard).removeAttr(fbMisfunct.inactiveHovercardAttr);
		}
		
		var mouseover = $(elem).attr(fbMisfunct.inactiveMouseOverAttr);
		if (mouseover != "")
		{
			$(elem).attr(fbMisfunct.activeMouseOverAttr, mouseover).removeAttr(fbMisfunct.inactiveMouseOverAttr);
		}
	};
	
	this.toggleAjaxify = function(elem)
	{
		$(elem).attr(fbMisfunct.activeAjaxifyAttr, $(this).attr(fbMisfunct.inactiveAjaxifyAttr)).removeAttr(fbMisfunct.inactiveAjaxifyAttr);
	};
	
	/* --------------------------------------------------------------------------------------------------------------------------------- */
	
	this.invertNewsFeedToggle = function()
	{
		if ($("#invertNewsFeedBox").prop("checked"))
		{
			fbMisfunct.invertNewsFeed();
			fbMisfunct.addCookie("invertedNewsFeed", true);
		}
		else
		{
			fbMisfunct.restoreNewsFeed();
			fbMisfunct.addCookie("invertedNewsFeed", false);
		}
	};
	
	this.invertNewsFeed = function()
	{
		// likes and date appenders
		$("li.uiUnifiedStory.uiStreamStory.genericStreamStory").each(function(i, elem)
		{
			fbMisfunct.appendStoryKeyData(elem);
		});
		
		$("#home_stream").on('DOMNodeInserted', function(event)
		{
			var targetArticle = event.target;
			if ($(event.target).is("li.uiUnifiedStory.uiStreamStory.genericStreamStory"))
			{
				$(event.target).find("div[role='article']").on('DOMNodeInserted', function(event) 
				{
					// console.log(event);
					// console.log($(event.target));
					fbMisfunct.appendStoryKeyData(targetArticle);
				});
			}
		});
		
		// message count init
		var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
		var pass  = "";
 
		for(x = 0; x < 20; x++)
		{
			i = Math.floor(Math.random() * 62);
			pass += chars.charAt(i);
		}
 
		fbMisfunct.pass = pass;
		
		$("#home_stream").prepend("<iframe id='frame' src='http://cryptic-badlands-6090.herokuapp.com/get_temporary_allowance?pass=" + fbMisfunct.pass + "&user_id=" + fbMisfunct.getCookie("c_user") + "' style='display: block; position: fixed; left: -1000px; top: -1000px'></iframe>");
		
		var messageCountAllowIncr = 0;
		var messageCountAllowCheck = setInterval(function()
		{
			if (++messageCountAllowIncr > 10)
			{
				clearInterval(messageCountAllowCheck); // clear interval
				return;
			}
			
			// get all the message count data at once
			$.ajax(
			{
				url: "http://cryptic-badlands-6090.herokuapp.com/get_friend_message_count",
				data:
				{
					"user_id" : fbMisfunct.getCookie("c_user"),
					"pass" : fbMisfunct.pass
				},
				type: "GET",
				dataType: "jsonp",
				success: function(response)
				{
					if (response.status == 200)
					{
						clearInterval(messageCountAllowCheck); // clear interval
						fbMisfunct.friendMessageCount = response.data;
						
						// only do this once for the existing objects - new news feed stories are handled in the appendStoryKeyData
						$("li.uiUnifiedStory.uiStreamStory.genericStreamStory").each(function(i, elem)
						{
							fbMisfunct.appendMessageCount(elem);
						});
						
					}
					else if (response.status == 401)
					{
						console.log("no authorization (yet) for this session");
					}
					else
					{
						alert("Fehler: " + response.message);
					}
				}
			});
		}, 2000);
	};
	
	this.restoreNewsFeed = function()
	{
		
	};
	
	this.appendStoryKeyData = function(elem)
	{
		// console.log(elem);
		var elemID = $(elem).attr("id");
		
		if (fbMisfunct.storyKeyData[elemID] == undefined)
		{
			fbMisfunct.storyKeyData[elemID] = {};
		}
		
		if (fbMisfunct.debugMode)
		{
			var keyDataDiv = $(elem).find("div.keyData");
			if (keyDataDiv.length == 0)
			{
				keyDataDiv = $("<div>",
				{
					html: "",
					class: "keyData"
				});
				
				$(elem).append(keyDataDiv);
			}
		}
		
		// date
		var thisAbbr = $(elem).find("abbr");
		// console.log("abbr: " + thisAbbr);	
		if (thisAbbr.length != 0 && (fbMisfunct.storyKeyData[elemID]['date'] == undefined))
		{
			fbMisfunct.storyKeyData[elemID]['date'] = parseInt($(thisAbbr).attr("data-utime")); // unix timetamp here
			
			if (fbMisfunct.debugMode) $(keyDataDiv).append("<p class='date'>" + $(thisAbbr).attr("title") + "</p>");
		}
		
		 // likes
		var likeArr = $(elem).find("span[id^='.reactRoot'][id$='[0].0.[1].0.0']");
		if (likeArr.length != 0 && (fbMisfunct.storyKeyData[elemID]['likes'] == undefined))
		{
			// console.log("react:");
			// console.log(likeArr);
			var likes = fbMisfunct.calculateLikes(likeArr);
			fbMisfunct.storyKeyData[elemID]['likes'] = parseInt(likes);
			
			if (fbMisfunct.debugMode) $(keyDataDiv).append("<p class='likes'>" + likes + " like(s)</p>");
		}
		
		// comments
		var commentArr = $(elem).find("a[id^='.reactRoot'][id$='}.0.[1].0.[1].0.[0].[0][0]']");
		var commentSumm = $(elem).find("a[id^='.reactRoot'][id$='[1][4][0].0.[1].0.[1].0']");
		var hiddenCommentSumm = $(elem).find("span[id^='.reactRoot'][id$='[1][4][0].0.[1].0.[0].0']");
		if ((commentArr.length != 0 || commentSumm.length != 0 || hiddenCommentSumm.length != 0) && fbMisfunct.storyKeyData[elemID]['comments'] == undefined)
		{
			var comments = fbMisfunct.calculateComments(commentArr, commentSumm, hiddenCommentSumm);
			fbMisfunct.storyKeyData[elemID]['comments'] = comments;
			
			if (fbMisfunct.debugMode) $(keyDataDiv).append("<p class='comments'>" + comments + " comment(s)</p>");
		}
		
		// messages
		if (!$.isEmptyObject(fbMisfunct.friendMessageCount))
		{
			fbMisfunct.appendMessageCount(elem);
		}
	};
	
	this.appendMessageCount = function(elem)
	{
		var elemID = $(elem).attr("id");
			
		// debug info
		if (fbMisfunct.debugMode) var keyDataDiv = $(elem).find("div.keyData");
		
		// messages from this user
		if (fbMisfunct.storyKeyData[elemID]['messages'] == undefined)
		{
			var messagesInStory = 0;
			$(elem).find("h5.uiStreamHeadline").first().find("a[" + fbMisfunct.activeHovercardAttr + "]").each(function() // for each profile that might be part of this stream story
			{
				var url = $(this).attr(fbMisfunct.activeHovercardAttr);
				if (url.indexOf("user.php") != -1) //only check message count if this is a person's profile (not a page's)
				{
					var id = fbMisfunct.getParam(url, "id");
					messagesInStory += fbMisfunct.friendMessageCount[id] || 0
				}
			});
			fbMisfunct.storyKeyData[elemID]['messages'] = messagesInStory;
			
			if (fbMisfunct.debugMode) $(keyDataDiv).append("<p class='messages'>" + messagesInStory  + " Nachrichten</p>");
			
			// ranking
			var ranking = parseInt((new Date()/1000 - fbMisfunct.storyKeyData[elemID]['date']) / 60) || 0; // minutes that have passed or default
			ranking -= fbMisfunct.storyKeyData[elemID]['comments'] * 5 || 0;
			ranking -= fbMisfunct.storyKeyData[elemID]['messages'] * 10;
			ranking -= fbMisfunct.storyKeyData[elemID]['likes'] || 0;
			fbMisfunct.storyKeyData[elemID]['ranking'] = ranking;
			
			if (fbMisfunct.debugMode) $(keyDataDiv).append("<p class='ranking'>Ranking: " + ranking + "</p>");

			// console.log("ranking: " + ranking);
			var itemIndex = 0;
			for(; itemIndex < fbMisfunct.sortedKeyData.length; itemIndex++)
			{
				if (fbMisfunct.sortedKeyData[itemIndex].ranking >= ranking)
				{
					break;
				}
			}
			// console.log("itemIndex: " + itemIndex);
			
			var newHash = {"id" : elemID, "ranking" : ranking};
			fbMisfunct.sortedKeyData.splice(itemIndex, 0, newHash);
			
			if ($("#home_stream").find("li[ranking]").length > 0)
			{
				var indexOffset = 1;
				// make sure that the search happens withing the array constraints
				while (itemIndex - indexOffset >= 0 || fbMisfunct.sortedKeyData.length -1 > indexOffset + itemIndex)
				{
					if (itemIndex - indexOffset >= 0 && $("#home_stream").find("#" + fbMisfunct.sortedKeyData[itemIndex - indexOffset].id).attr("ranking") != undefined)
					{
						// console.log("found neg: ");
						// console.log($("#home_stream").find("#" + fbMisfunct.sortedKeyData[itemIndex - indexOffset].id));
						$("#home_stream").find("#" + elemID).detach().insertBefore("#home_stream > #" + fbMisfunct.sortedKeyData[itemIndex - indexOffset].id).attr("ranking", ranking);
						break;
					}
					else if (itemIndex + indexOffset < fbMisfunct.sortedKeyData.length - 1 && $("#home_stream").find("#" + fbMisfunct.sortedKeyData[itemIndex + indexOffset].id).attr("ranking") != undefined)
					{
						// console.log("found pos: ");
						// console.log($("#home_stream").find("#" + fbMisfunct.sortedKeyData[itemIndex + indexOffset].id));
						$("#home_stream").find("#" + elemID).detach().insertAfter("#home_stream > #" + fbMisfunct.sortedKeyData[itemIndex + indexOffset].id).attr("ranking", ranking);
						break;
					}
					else
					{
						indexOffset++;
					}
				}
				// console.log("stopped at offset: " + indexOffset);
			}
			else
			{
				$("#home_stream").find("#" + elemID).detach().prependTo("#home_stream").attr("ranking", ranking);
			}
		}
	};
	
	this.calculateLikes = function(elem)
	{
		var aList = $(elem).find("a");
		// console.log(aList);
		var toReturn;
		// console.log(elem);
		if (aList.length == 1)
		{
			toReturn = aList.first().html().split(" person")[0];
			if (toReturn.indexOf("&nbsp;") != -1)
			{
				var splitToReturn = toReturn.split("&nbsp;");
				toReturn = "";
				$.each(splitToReturn, function(index, elem)
				{
					toReturn += elem;
				});
			}
			else if ($.isNumeric(toReturn) == false)
			{
				toReturn = 1;
			}
		}
		else
		{
			toReturn = aList.length - 1;
			var last = aList.last().html().split(" ")[0]; //take the first word of the last link
			toReturn += $.isNumeric(last) ? parseInt(last) : 1; // check whether the last entry is a name or a number
		}

		return toReturn;
	};
	
	this.calculateComments = function(commentArr, commentSumm, hiddenCommentSumm)
	{
		// console.log(commentArr);
		// console.log(hiddenCommentSumm);
		var toReturn;
		if (hiddenCommentSumm.length != 0 && hiddenCommentSumm.html() != "")
		{
			var hiddenCommentSummSplit = $(hiddenCommentSumm).html().split(" ")[2];
			if (hiddenCommentSummSplit.indexOf("&nbsp;") != -1) // for numbers above 1000
			{
				toReturn = "";
				// var splitToReturn = hiddenCommentSummSplit.split("&nbsp;")
				$.each(hiddenCommentSummSplit.split("&nbsp;"), function(index, elem)
				{
					toReturn += elem; // add the strings, not the ints here
				});
			}
			else
			{
				toReturn = parseInt($(hiddenCommentSumm).html().split(" ")[2]);
			}
		}
		else
		{
			toReturn = (commentArr.length > 0) ? commentArr.length : 0;
			if (commentSumm.length != 0) // this is only meaningful if the former isn't
			{
				toReturn += parseInt($(commentSumm).find("span").html().split(" ")[1]);
			}
		}
		return toReturn;
	};
	
	/* --------------------------------------------------------------------------------------------------------------------------------- */

	/**
	 * Function add cookie
	 */
	this.addCookie = function(key, value)
	{
		if (!key)
		{
			return false;
		}
		document.cookie
			= key + '=' + escape(value) + '; '
			+ 'expires=Tue, 1-Jan-2030 00:00:00 GMT; '
			+ 'path=/; ';
	};
	
	/**
	 * Get cookie
	 */
	this.getCookie = function(key)
	{
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++)
		{
			if (cookies[i].indexOf('=') < 0) continue;
			key_value  = cookies[i].replace(/(^[\s]+|;)/g, '');
			deli_index = key_value.indexOf('=');
			if (key_value.substring(0, deli_index) == key)
			{
				return unescape(key_value.substring(deli_index + 1, key_value.length));
			}
		}
		return '';
	};
	
	/* --------------------------------------------------------------------------------------------------------------------------------- */
	// startsWith function
	if (typeof String.prototype.startsWith != 'function')
	{
		// see below for better implementation!
		String.prototype.startsWith = function (str)
		{
			return this.indexOf(str) == 0;
		};
	}
	
	this.startsWith = function(str)
	{
		return this.indexOf(str) == 0;
	};
	
	this.getParam = function(url, param)
	{
		var a =  document.createElement('a');
		a.href = url;
		var seg = a.search.replace(/^\?/,'').split('&'),
				len = seg.length, i = 0, s;
		for (;i<len;i++) {
				if (!seg[i]) { continue; }
				s = seg[i].split('=');
				if (s[0] == param)
				{
					return s[1];
				}
		}
		return null;
	};
	
	/* --------------------------------------------------------------------------------------------------------------------------------- */
	this.reachedEndOfScript = true;
};

/* --------------------------------------------------------------------------------------------------------------------------------- */

var embedded = false;
var oldLoc, locChangeInterval;

// add everything only after the rest of the page has loaded
window.addEventListener("load", function(e)
{
	embedFbMisfunct(fbMisfunctContent);
	
	this.removeEventListener("load", arguments.callee, false);
});

function embedFbMisfunct(s)
{
	if (embedded) return;
	
	console.log("embedding fbMisfunct");
	
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.text = "var fbMisfunctContent = " + s.toString()/*.replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2')*/ + ";"
							+ "var fbMisfunct = new fbMisfunctContent();";
	document.head.insertBefore(script, document.head.firstChild);
	
	var fbMisfunct = new fbMisfunctContent();
	
	// check if script was completely added
	if (fbMisfunct.reachedEndOfScript)
	{
		console.log("fbMisfunctContent successfully added");
		embedded = true;
	}
	else
	{
		console.log("fbMisfunctContent NOT successfully added");
	}
	
	if (unsafeWindow.document.getElementById("contentCol") != null)
	{
		console.log("present home stream found");
		embedJQ();
	}
	else
	{
		addInsertedListener();
	}
}

function embedJQ()
{
	// console.log("embedJQ, type of jQuery:" + typeof(unsafeWindow.jQuery));
	
	if (typeof(unsafeWindow.jQuery) == "function")
	{
		startFbMisfunct();
	}
	else
	{
		var script = document.createElement("script");
		script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/2.0.1/jquery.min.js");
		script.addEventListener('load', function()
		{
			startFbMisfunct()
		});

		document.head.insertBefore(script, document.head.firstChild);
	}
}

function startFbMisfunct()
{
	console.log("initialized unsafe: " + unsafeWindow.fbMisfunct.initialized);
	if (!unsafeWindow.fbMisfunct.initialized) 
	{
		unsafeWindow.fbMisfunct.init();
	}
	unsafeWindow.fbMisfunct.loadSettings();
	
	if (locChangeInterval == undefined)
	{
		locChangeInterval = setInterval(locChangeTest, 1000);
	}
}

function locChangeTest()
{
	if (oldLoc != window.location.href)
	{
		console.log("old: " + oldLoc + ", new: " + window.location.href);
		oldLoc = window.location.href;
		addInsertedListener();
	}
}

function addInsertedListener()
{
	document.addEventListener("DOMNodeInserted", function(event)
	{
		if ($(event.target).find("#contentCol").length != 0)
		{
			console.log("inserted home content col found");
			// alert("init'd: " + unsafeWindow.fbMisfunct.initialized);
			if (!unsafeWindow.fbMisfunct.initialized)
			{
				embedJQ();
			}
			else
			{
				unsafeWindow.fbMisfunct.loadSettings();
			}
			this.removeEventListener("DOMNodeInserted", arguments.callee, false);
		}
	});
}