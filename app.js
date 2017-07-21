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
    //session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
	session.send("Hello, Welcome to the Bot Demo...");
}); 

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        });
    }
});

bot.dialog('askdata', function(session, args){ 
var isContainName = builder.EntityRecognizer.findEntity(args.intent.entities,'getname'); 
var isContainWhat = builder.EntityRecognizer.findEntity(args.intent.entities,'iswhat'); 
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
			 session.send('Please enter like  \'what is your name\' or \'what name\' or \'what name is yours\' or \'my name is bob. what is your name\' to get response string');
		 } 
		 }).triggerAction({
    matches: 'askdata'
});

bot.dialog('Help', function (session) {
    session.endDialog('Hi! Try asking me things like  \'what is your name\' or \'what name\' or \'what name is yours\' or \'my name is bob. what is your name\' or \'help\' to get response string');
}).triggerAction({
    matches: 'Help'
});

// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(function (text) {
                    session.message.text = text;
                    next();
                })
                .catch(function (error) {
                    console.error(error);
                    next();
                });
        }
    });
}