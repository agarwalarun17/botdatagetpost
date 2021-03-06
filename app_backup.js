// This loads the environment variables from the .env file
require('dotenv-extended').load();
var request = require('request');
var builder = require('botbuilder');
var restify = require('restify');


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
}); 

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('askdata', function(session, args){ 
var isContainName = builder.EntityRecognizer.findEntity(args.intent.entities,'getname'); 
var isContainWhat = builder.EntityRecognizer.findEntity(args.intent.entities,'iswhat'); 

//session.send(isContainName.entity + "    "  + isContainWhat.entity);

if (isContainName && isContainWhat){ 
             var isName = isContainName.entity;
			 var isWhat = isContainWhat.entity;
			 
			 var dataname=session.message.text;
			 var url = "http://wanderer.cloud/bots/botgetsetdata/testData.php?strIsName=" + isName + "&strIsWhat=" + isWhat;
			 request(url,function(error,response,body){ 
			    body = JSON.parse(body);
				outputstatus=body.success;
			    if(response.statusCode == 200 && outputstatus=='true')
				{
			        temp = body.data;
					//session.send(body.success);
			        /*var msg = new builder.Message(session) 
                    .attachments([ 
                                   new builder.ThumbnailCard() 
			                       .title("Sample Read Write Data Demo")
								   .text("Data is: " + temp) 
								   
                
                                ]); */
								
                    session.send(temp);
			    }
				else
				{
				    session.send("Entered content is invalid...");
			    }
			});
	     }
		 else
		 {
			 session.send(isContainName.entity + "    "  + isContainWhat.entity);
			 
     		 builder.Prompts.text(session, 'Please enter like  \'what is your name\' or \'what name\' or \'what name is yours\' or \'my name is bob. what is your name\' or \'help\' to get response string'); 
		 } 
		 }).triggerAction({
    matches: 'askdata'
});

bot.dialog('Help', function (session) {
    session.endDialog('Hi! Try asking me things like  \'what is your name\' or \'what name\' or \'what name is yours\' or \'my name is bob. what is your name\' or \'help\' to get response string');
}).triggerAction({
    matches: 'Help'
});
