/*
A memory game Alexa Skill optimized for Echo Show
*/

'use strict';

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
  try {
      console.log("event.session.application.applicationId=" + event.session.application.applicationId);

      /**
       * Uncomment this if statement and populate with your skill's application ID to
       * prevent someone else from configuring a skill that sends requests to this function.
       */

  if (event.session.application.applicationId !== "amzn1.ask.skill.39a0551b-e17b-443e-b04f-df92805f0a62") {
      context.fail("Invalid Application ID");
   }

      if (event.session.new) {
          onSessionStarted({requestId: event.request.requestId}, event.session);
      }

      if (event.request.type === "LaunchRequest") {
          onLaunch(event.request,
              event.session,
              function callback(sessionAttributes, speechletResponse) {
                  context.succeed(buildResponse(sessionAttributes, speechletResponse));
              });
      } else if (event.request.type === "IntentRequest") {
          onIntent(event.request,
              event.session,
              function callback(sessionAttributes, speechletResponse) {
                  context.succeed(buildResponse(sessionAttributes, speechletResponse));
              });
      } else if (event.request.type === "SessionEndedRequest") {
          onSessionEnded(event.request, event.session);
          context.succeed();
      }
  } catch (e) {
      context.fail("Exception: " + e);
  }
};

/**
* Called when the session starts.
*/
function onSessionStarted(sessionStartedRequest, session) {
  console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
      + ", sessionId=" + session.sessionId);

  // add any session init logic here
}

/**
* Called when the user invokes the skill without specifying what they want.
*/
function onLaunch(launchRequest, session, callback) {
  console.log("onLaunch requestId=" + launchRequest.requestId
      + ", sessionId=" + session.sessionId);

  getWelcomeResponse(callback);
}

/**
* Called when the user specifies an intent for this skill.
*/
function onIntent(intentRequest, session, callback) {
  console.log("onIntent requestId=" + intentRequest.requestId
      + ", sessionId=" + session.sessionId);

  var intent = intentRequest.intent,
      intentName = intentRequest.intent.name;

  // dispatch custom intents to handlers here
  if ("GuessIntent" === intentName) {
      handleGuessRequest(intent, session, callback);
  } else if ("AMAZON.StopIntent" === intentName) {
      handleEndRequest(intent, session, callback);
  } else if ("AMAZON.CancelIntent" === intentName) {
      handleEndRequest(intent, session, callback);
  } else if ("AMAZON.HelpIntent" === intentName) {
      handleGetHelpRequest(intent, session, callback);
  } else {
      throw "Invalid intent";
  }
}

/**
* Called when the user ends the session.
* Is not called when the skill returns shouldEndSession=true.
*/
function onSessionEnded(sessionEndedRequest, session) {
  console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
      + ", sessionId=" + session.sessionId);

  // Add any cleanup logic here
}

// ------- Skill specific business logic -------

var CARD_TITLE = "Memory Zoo"; // Be sure to change this for your skill.

function getWelcomeResponse(callback) {
  var sessionAttributes = {},
	speechOutput = "Check out this list template",
	shouldEndSession = false,
	repromptText = "Reprompt";

  callback(sessionAttributes,
      buildListSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function handleGuessRequest(intent, session, callback) { //handling the users response. it could be the question answer or i dont know or cancel, etc.
  
  let speechOutput;
  let shouldEndSession = true;
  

  // intent.slots.animal.value

    speechOutput = "";

    speechOutput = "Sorry, I did not understand your request.  I know the records for passing, rushing, receiving, sacks, and interceptions.  Please try another question or say 'Help'";
    shouldEndSession = false;

  var sessionAttributes = {};
  var repromptText = "";
          callback(sessionAttributes,
              buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
  
}

function handleEndRequest(intent, session, callback) { //handling the users response. it could be the question answer or i dont know or cancel, etc.
  var speechOutput = "Goodbye";
  var sessionAttributes = {};
  var repromptText = "";
          callback(sessionAttributes,
              buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, true));
  
}

function handleGetHelpRequest(intent, session, callback) {
  
  // Ensure that session.attributes has been initialized
  if (!session.attributes) {
      session.attributes = {};
  }

  // Set a flag to track that we're in the Help state.
  session.attributes.userPromptedToContinue = true;

  var speechOutput = "This is an easy game. Why do you need help?",
	repromptText = "";
	var shouldEndSession = false;
  callback(session.attributes,
      buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

// ------- Helper functions to build responses -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
      outputSpeech: {
          type: "PlainText",
          text: output
      },
      card: {
          type: "Simple",
          title: title,
          content: output
      },
      reprompt: {
          outputSpeech: {
              type: "PlainText",
              text: repromptText
          }
      },
      shouldEndSession: shouldEndSession
  };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
  return {
      outputSpeech: {
          type: "PlainText",
          text: output
      },
      reprompt: {
          outputSpeech: {
              type: "PlainText",
              text: repromptText
          }
      },
      shouldEndSession: shouldEndSession
  };
}

function buildResponse(sessionAttributes, speechletResponse) {
  return {
		version: "1.0",
		sessionAttributes: sessionAttributes,
		response: speechletResponse
  };
}

function buildListSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
		outputSpeech: {
				type: "PlainText",
				text: output
		},
		card: {
				type: "Simple",
				title: title,
				content: output
		},
		reprompt: {
				outputSpeech: {
						type: "PlainText",
						text: repromptText
				},
		},
		directives: [
			{
				type: "Display.RenderTemplate",
				template: {
					type: "BodyTemplate2",
					token: "A2079",
					backButton: "VISIBLE",
					backgroundImage: {
						contentDescription: "Textured grey background",
						sources: [
							{
								"url": "https://www.example.com/background-image1.png"
							}
						],
						title: "My Favorite Car",
						image: {
							contentDescription: "My favorite car",
							sources: [
								{
									"url": "https://www.example.com/my-favorite-car.png"
								}
							]
						},
						textContent: {
							primaryText: {
								text: "See my favorite car",
								type: "PlainText"
							},
							secondaryText: {
								text: "Custom-painted",
								type: "PlainText"
							},
							tertiaryText: {
								text: "By me!",
								type: "PlainText"
							}
						}
					}
				}
			}	
		],
		shouldEndSession: shouldEndSession
	}
}