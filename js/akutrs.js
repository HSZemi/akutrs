function fillPageWithData(data){
	if('pagetitle' in data){
		$('#pagetitle').text(data.pagetitle);
		emptyTextButtonRow();
		currentIssue = data.currentissue;
		$('#issuetitle').text(currentIssue);
		for (var i=0; i<data.issues[currentIssue].length; i++) {
			text = data.issues[currentIssue][i];
			addTextButton(text);
		}
	} else {
		alert("Fehler in der Konfigurationsdatei. Entweder ist der Server nicht erreichbar, oder er hat ein technisches Problem.\n\nNerv mal Sven, er soll sich das ansehen.");
	}
}

function emptyTextButtonRow(){
	$('#textbuttons').html('');
}

function buttonClicked(source){
	id = source.data('id');
	title = source.data('title');
	length = source.data('length');
	
	$('.articlebutton').removeClass('btn-primary');
	$('.articlebutton').addClass('btn-default');
	source.removeClass('btn-default');
	source.addClass('btn-primary');
	
	if($("#changeindicator").data("modified")){
		$('#changeWarning').modal('show');
		$('#modal-ignore').data('id', id);
		$('#modal-ignore').data('title', title);
		$('#modal-ignore').data('length', length);
		$('#modal-ignore').click(function(){ignoreWarning($(this));});
	} else {
		$('#texttitle').val(title);
		$('#textcontent').attr('maxlength',length);
		$('#textcontent').data('length',length);
		$('#charactersAllowed').text(length);
		$('#savebutton').data("id", id);
		$('#savebutton').data("title", title);
		$('#savebutton').data("length", length);
		$('#resetbutton').data("id", id);
		$('#resetbutton').data("title", title);
		$('#resetbutton').data("length", length);
		data = Object();
		data.issue = $('#issuetitle').text();
		data.id = id;
		data.action = "get";
		jQuery.getJSON("connector.php", data, function(retval){insertArticle(retval);});
		$('#texttitle').prop('disabled', false);
		$('#textcontent').prop('disabled', false);
		$('#resetbutton').prop('disabled', false);
		$('#savebutton').prop('disabled', false);
	}
}

function ignoreWarning(source){
	changeIndicatorOff();
	buttonClicked(source);
}


function changeIndicatorOn(){
	$("#changeindicator").show(500);
	$("#changeindicator").data("modified",true);
	$(".articlebutton").prop("disabled", true);
	$("#savedismissnotice").show(500);
}
function changeIndicatorOff(){
	$("#changeindicator").hide(500);
	$("#changeindicator").data("modified",false);
	$(".articlebutton").prop("disabled", false);
	$("#savedismissnotice").hide(500);
}

function insertArticle(data){
	if('title' in data && 'content' in data){
		if(data.title != ""){
			$('#texttitle').val(data.title);
		}
		$('#textcontent').val(data.content);
		$('#charactersLeft').text(($('#textcontent').data('length') - $("#textcontent").val().length));
		changeIndicatorOff();
	} else {
		alert("Artikel konnte nicht geladen werden. Sag mal Sven Bescheid.");
	}
}

function saveArticle(source){
	issue = $('#issuetitle').text();
	id = source.data("id");
	title = $('#texttitle').val();
	content = $('#textcontent').val();
	
	data = Object();
	data.issue = issue;
	data.id = id;
	
	jsonObject = Object();
	jsonObject.title = title;
	jsonObject.content = content;
	
	data.json = JSON.stringify(jsonObject);
	
	jQuery.post("connector.php?action=save", data, function(retval){showAlert(retval)} );
	changeIndicatorOff();
}

function showAlert(data){
	info = JSON.parse(data);
	var uniqid = Date.now();
	if(info.title == "ERFOLGREICH"){
		$('#alertbox').append('<div class="alert alert-success" id="'+uniqid+'" role="alert" style="display: none;"><b>'+info.title+'</b> '+info.content+'</div>');
	} else {
		$('#alertbox').append('<div class="alert alert-error" id="'+uniqid+'" role="alert" style="display: none;"><b>'+info.title+'</b> '+info.content+'</div>');
	}
	$('#'+uniqid).slideDown();
	setTimeout( function(){$('#'+uniqid).hide(500);}  , 5000 );
}

function updateTextCount(){
	$('#charactersLeft').text(($('#textcontent').data('length') - $("#textcontent").val().length));
	changeIndicatorOn();
}

function addTextButton(text){
	$('#textbuttons').append('<button class="btn btn-default articlebutton" type="button">'+text.title+' <span class="badge">'+text.length+'</span></button> ');
	currentbutton = $('#textbuttons button').last();
	currentbutton.data("id",text.id);
	currentbutton.data("title",text.title);
	currentbutton.data("length",text.length);
	currentbutton.click(function(){buttonClicked($(this));});
}

$(function(){
	$('#texttitle').prop('disabled', true);
	$('#textcontent').prop('disabled', true);
	$('#resetbutton').prop('disabled', true);
	$('#savebutton').prop('disabled', true);
	$('#texttitle').val('');
	$('#textcontent').val('');
	jQuery.getJSON( "config/config.json", function(data){fillPageWithData(data);} );
	$('#texttitle').on('keyup', function(){changeIndicatorOn();});
	$('#textcontent').on('keyup', function(){updateTextCount();});
	$('#resetbutton').click(function(){buttonClicked($(this));});
	$('#savebutton').click(function(){saveArticle($(this));});
	$("#savedismissnotice").hide();
	changeIndicatorOff();
});