var herokuHost = "cryptic-badlands-6090.herokuapp.com";
var herokuUrl = window.location.protocol + "//" + herokuHost + "/";

var devEnv = (window.location.host != herokuHost) || false;
//var iframeEnv = (window.location.pathname == "/get_temporary_allowance")
$("#listThreadsButton").prop("disabled", false);

/* ------------------------------------------------------------------------------------------------------------- */

var lastThreadDate = new Date().getTime() + 3600; // +1h in case the function isn't called right after script execution
FB.threadList = {};
var increment = 0;

function listThreads()
{
	FB.api('/me/threads?fields=id,participants&limit=100&until=' + lastThreadDate, function(response)
	{
		until = getParam(response.paging.next, "until");
		if (until != lastThreadDate) //there are older threads left
		{
			$.each(response.data, function()
			{
				FB.threadList[this.id] = this;
			});
			
			lastThreadDate = until;
			$('#listThreadsIndicator').html("Hole Thread " + increment * 100 + "–" + ++increment * 100 + "…");
			listThreads();
		}
		else
		{
			$("#listThreadsButton").prop("disabled", true);
			processThreadList();
		}
	});
}

function processThreadList()
{
	FB.threadCount = 0;
	$.each(FB.threadList, function()
	{
		FB.threadCount++;
	});
	
	$('#listThreadsIndicator').html("fertig. Anzahl: " + FB.threadCount);
	
	var appendString;
	$.each(FB.threadList, function(index, thread)
	{
		var threadId = thread.id;
		
		appendString = $("<div>",
		{
			class: "threadDiv",
			id: splitId(threadId)
		});
		
		FB.threadList[threadId].sendersDateHash = {};
		$.each(thread.participants.data, function(index, participant)
		{
			FB.threadList[threadId].sendersDateHash[participant.name] = {};
			$(appendString).append(participant.name + (index < thread.participants.data.length - 1 ? ", " : ""));
		});
		
		$("body").append(appendString);
	});
	$('#listFullThreadsButton').show();
	
	if (iFrameEnv)
	{
		listFullThreads();
	}
}

/* ------------------------------------------------------------------------------------------------------------- */

//send stuff to rails
function sendThreadsToRails()
{
	$.ajax(
	{
		url : herokuUrl + "post_thread_data",
		dataType: 'json',
		type: "POST",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({
			"user_id" : FB.me.id, 
			"threads" : FB.threadList
		}),
		complete: function(xhr, textStatus)
		{
			if (xhr.status == 200) {
				$('#sendThreadsToRailsIndicator').html("gespeichert");
				if (devEnv) console.log(textStatus);
			}
			else
			{
				$('#sendThreadsToRailsIndicator').html("FEHLER: " + textStatus);
				$('#notice').html("Fehler: " + textStatus);
			}
		}
	});
}

function sendSingleThreadToRails(threadId)
{
	$.ajax(
	{
		url : herokuUrl + "post_single_thread",
		dataType: 'json',
		cache: false,
		type: "POST",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({
			"user_id" : FB.me.id,
			"thread_id" : threadId,
			"data" : FB.threadList[threadId]
		}),
		complete: function(xhr, textStatus)
		{
			if (xhr.status == 200) {
				// $('#sendThreadsToRailsIndicator').html("gespeichert");
				if (devEnv) console.log(JSON.parse(xhr.responseText).message);
			}
			else
			{
				if (devEnv) console.log(xhr.responseText);
				if (xhr.responseText !== undefined)
				{
					$('#notice').html("Fehler: " + JSON.parse(xhr.responseText).message);
				}
				else
				{
					$('#notice').html("Fehler: (keine Fehlerbeschreibung)");
				}
			}
		}
	});
}

/* ------------------------------------------------------------------------------------------------------------- */

var fetchList = [];
var fullThreadIncrement = 0;
var fullThreadsTimeout = 0;
var lastMessageDate;
var messageIncrement;

var fetchStop = false;

function listFullThreads()
{
	fetchStop = false;
	$("#listFullThreadsButton").attr("onclick", "stopFullFetch()").html("abbrechen");
	
	$.each(FB.threadList, function(index, item)
	{
		item.fullThread = [];			
		fetchList.push(item.id);
	})
	
	fetchNextThread();
}

function fetchSingleThread(id)
{
	if (fetchStop) return
	
	FB.api('/messages?id=' + id + '&limit=100&fields=from&until=' + lastMessageDate, function(response)
	{
		if (response.error !== undefined) // some error occured
		{
			console.log("error in thread:" + id + ", at iteration: " + messageIncrement);
			fetchSingleThread(id); //try again
		}
		else if (response.paging === undefined) // happens when a thread ends precisely after one "limit" block
		{
			processFullThread(id);
	
			// only do this when on heroku (and if threads hasn't been fetched from heroku to begin with)
			if (!devEnv)
			{
				sendSingleThreadToRails(id);
			}
			
			fetchNextThread();
		}
		else // normal case
		{
			until = getParam(response.paging.next, "until");
			if (until != lastMessageDate) // there's more data
			{
				FB.threadList[id].fullThread = $.merge(FB.threadList[id].fullThread, response.data);
				lastMessageDate = until;
				fetchSingleThread(id);
			}
			else // we've reached the end
			{
				processFullThread(id);
	
				// only do this when on heroku (and if thread hasn't been fetched from heroku to begin with)
				if (!devEnv) sendSingleThreadToRails(id);
				
				fetchNextThread();
			}
		}
	});
}

function fetchNextThread()
{
	if (fetchList.length == 0) return
	
	var nextId = fetchList.shift();
	
	$.ajax(
	{
		url: herokuUrl + "get_single_thread_updated_time",
		data:
		{
			"user_id" : FB.me.id,
			"thread_id" : nextId,
			"pass" : pass
		},
		type: "GET",
		dataType: "jsonp",
		contentType: "application/json",
		success: function(response)
		{
			if (response.status == 200) // everything ok
			{
				if (FB.threadList[nextId].updated_time > response.updated_time)
				{
					if (devEnv) console.log("thread on FB is newer than or not present on heroku");
					fullThreadIncrement++;
					lastMessageDate = new Date().getTime();
					messageIncrement = 0;
					fetchSingleThread(nextId);
				}
				else
				{
					console.log("got to point of heroku-saved threads"); // stop fetching
					if (!iFrameEnv)
					{
						getAllThreadsFromHeroku();
					}
				}
			}
			else
			{
				$('#notice').html("Fehler: " + response.message);
				$("#" + splitId(nextId)).append("Fehler: " + response.message);
				
				//fetch next thread anyways
				fullThreadIncrement++;
				lastMessageDate = new Date().getTime();
				messageIncrement = 0;
				fetchSingleThread(nextId);
			}
		}
	});
}

function getFullThreadFromHeroku(id)
{
	if (fetchStop) return;
	
	$.ajax(
	{
		url: herokuUrl + "get_single_thread",
		data:
		{
			"user_id" : FB.me.id,
			"thread_id" : id,
			"pass" : pass
		},
		type: "GET",
		dataType: "jsonp",
		success: function(response)
		{
			if (response.status != 200)
			{
				$('#notice').html("Fehler: " + response.message);
				$("#" + splitId(id)).append("Fehler: " + response.message);
			}
			else
			{
				fullThreadIncrement++;
				FB.threadList[id] = response.data;
				processFullThread(id);
				fetchNextThread();
			}
		}
	});
}

function getAllThreadsFromHeroku()
{
	if (fetchStop) return;
	
	$.ajax(
	{
		url: herokuUrl + "get_all_threads",
		data:
		{
			"user_id" : FB.me.id,
			"pass" : pass
		},
		type: "GET",
		dataType: "jsonp",
		success: function(response)
		{
			if (response.status != 200)
			{
				$('#notice').html("Fehler: " + response.message);
				$("#" + splitId(id)).append("Fehler: " + response.message);
			}
			else
			{
				var i = 0; // count one for the first thread
				$.each(response.data, function(index, item)
				{
					FB.threadList[index] = item;
					fullThreadIncrement++;
					fetchList.splice(fetchList.indexOf(index), 1); // remove this item
					i++;
					setTimeout(function()
					{
						processFullThread(index)
					}, i * 200);
				});
				
				console.log("remaining threads to fetch: " + fetchList);
				if (fetchList.length > 0)
				{
					setTimeout(function()
					{
						fetchNextThread(); // continue in case there are any threads left
					}, i * 200);
				}
				else
				{
					fullThreadIncrement = FB.threadCount;
				}
			}
		}
	});
}

function processFullThread(id)
{
	if (iFrameEnv) return;
	
	var divId = splitId(id);	
	if ($("#" + divId).find("div.plotDiv").length != 0)
	{
		console.log("thread already present, id: " + id + ", divId: " + divId);
		return; //already present plot
	}
	
	// process counter	
	$('#listFullThreadsIndicator').html((fullThreadIncrement / FB.threadCount * 100).toFixed(2) + "%");
	
	var firstDate, latestDate;
	
	$.each(FB.threadList[id].fullThread, function(index, item)
	{
		latestDate = $.datepicker.formatDate("yy-mm-dd", new Date(item.created_time));
		if (firstDate === undefined)
		{
			firstDate = latestDate;
		}
		
		// rescue
		if (FB.threadList[id].sendersDateHash[item.from.name] === undefined)
		{
			FB.threadList[id].sendersDateHash[item.from.name] = {};
			if (devEnv) console.log("name: " + item.from.name + " was not found in sender list of " + id);
		}
		
		if (FB.threadList[id].sendersDateHash[item.from.name][latestDate] !== undefined)
		{
			FB.threadList[id].sendersDateHash[item.from.name][latestDate]++
		}
		else
		{
			FB.threadList[id].sendersDateHash[item.from.name][latestDate] = 1;
		}
	});
	
	if (devEnv) $("#" + divId).append("<div>Oldest: " + latestDate + ", newest: " + firstDate + "</div>");

	$("#" + divId).append("<div id='plotDiv-" + divId + "' class='plotDiv'></div>");
	
	var plotArr = [];
	var plotSeries = [];
	var rescueDate;
	$.each(FB.threadList[id].sendersDateHash, function(index, item)
	{
		var senderArr = [];
		$.each(item, function(index, item)
		{
			senderArr.push([index, item]);
		});
		plotArr.push(senderArr);
		
		// store a date that already exists to attach it to the null-values later on
		if (rescueDate === undefined && senderArr.length != 0)
		{
			rescueDate = senderArr[0][0];
		}
		
		// always add participant to the plot list
		plotSeries.push({label: index});
	});
	
	$.each(plotArr, function(index, item)
	{
		if (item == "")
		{
			plotArr[index] = [[rescueDate, -1]];
		}
	});
	
  $.jqplot("plotDiv-" + divId, plotArr,
	{
		// seriesDefaults:{
			// renderer:$.jqplot.BarRenderer,
			// rendererOptions: {fillToZero: true}
		// },
		
		// Custom labels for the series are specified with the "label"
		// option on the series option.  Here a series option object
		// is specified for each series.
		series: plotSeries,
		
		// Show the legend and put it outside the grid, but inside the
		// plot container, shrinking the grid to accomodate the legend.
		// A value of "outside" would not shrink the grid and allow
		// the legend to overflow the container.
		legend: {
				show: true/*,
				placement: 'outsideGrid'*/
		},
		/*axesDefaults:
		{
			tickRenderer: $.jqplot.CanvasAxisTickRenderer,
			tickOptions:
			{
				angle: -45,
				fontSize: '10pt'
			}
    },*/
		axes: {
			xaxis: {
				renderer:$.jqplot.DateAxisRenderer,
				tickOptions: {
					formatString: '%#d %b %Y'
				},
				autoscale: true
			},
			yaxis:{
				min: 0,
				autoscale: true
			}
		},
		highlighter: {
			show: true,
			tooltipLocation: 'ne',
			fadeTooltip: false,
			// sizeAdjust: 7.5,
			bringSeriesToFront: true
		},
		cursor: {
			show: false
		}
  });
	// $("#" + divId).append("<pre>" + formatJSON(FB.threadList[id].fullThread) + "</pre>");
}

function stopFullFetch()
{
	fetchStop = true;
	$("#listFullThreadsButton").attr("onclick", "listFullThreads()").html("Inhalt aller Threads auflisten");
	$('#listFullThreadsIndicator').html("");
}