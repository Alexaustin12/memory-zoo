/*
A memory game Alexa Skill optimized for Echo Show
*/

'use strict';

const Alexa = require('alexa-sdk');
const ImageUtils = require('alexa-sdk').utils.ImageUtils;

exports.handler = function(event, context, callback){
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = process.env.APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute()
};

const animals = ['Bear', 'Elephant'];


const handlers = {
  'LaunchRequest': function () {
    const builder = new Alexa.templateBuilders.ListTemplate2Builder();
    const listItems = [
      {
        "token": "1",
        "image": ImageUtils.makeImage("https://s3.amazonaws.com/memory-zoo/images/Bear.png"),
        "textContent": {
          "primaryText": {
            "text": "<b>Bear</b>",
            "type": "RichText"
          }
        }
      },
      {
        "token": "2",
        "image": ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Elephant.png'),
        "textContent": {
          "primaryText": {
            "text": "<b>Elephant</b>",
            "type": "RichText"
          }
        }
      }
    ];
    const template = builder.setTitle('Memory Zoo')
                            .setToken('listTemplate')
                            .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Savannah.jpg'))
                            .setListItems(listItems)
                            .build();

    this.response.speak('Rendering a template!')
      .renderTemplate(template);
    this.emit(':responseReady');  
},
  'GuessIntent': function () {
    const intentObj = this.event.request.intent;
    const speechOutput = `Dude, it's a ${intentObj.slots.animal.value}`;
    this.emit(':tell', speechOutput);
  },
  'Unhandled': function () {
    const speechOutput = 'This is unhandled';
    this.emit(':tell', speechOutput);
  }
};