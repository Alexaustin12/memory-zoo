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

const animals = ['Bear', 'Elephant', 'Giraffe', 'Hippo', 'Monkey', 'Panda', 'Penguin', 'Tiger', 'Zebra'];
const randAnimal = () => animals[Math.floor(Math.random() * animals.length)];

const levelAnimals = [];
const getAnimals = (level) => {
  let i;
  for (i = 0; i < level; i++) {
    levelAnimals.push(randAnimal());
  } 
}

const createLevel = (level) => {
  const levelArr =[];
  getAnimals(level);
  let i;
  for (i = 0; i < levelAnimals.length; i++) {
    let animalToken = String(i);    
    let animalImage = `https://s3.amazonaws.com/memory-zoo/images/${levelAnimals[i]}.png`;
    let animalText = `<b>${levelAnimals[i]}</b>`;
    let animalObj = {
      "token": animalToken,
      "image": ImageUtils.makeImage(animalImage),
      "textContent": {
        "primaryText": {
          "text": animalText,
          "type": "RichText"
        }
      }
    }
    levelArr.push(animalObj);
  }
  return levelArr;
}

const handlers = {
  'LaunchRequest': function () {
    const builder = new Alexa.templateBuilders.ListTemplate2Builder();
    this.attributes['level'] = 1;
    const listItems = createLevel(this.attributes['level']);

    const template = builder.setTitle('Memory Zoo')
                            .setToken('listTemplate')
                            .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Savannah.jpg'))
                            .setListItems(listItems)
                            .build();
    
    this.attributes['level']++;
    this.response.speak("<audio src='https://s3.amazonaws.com/memory-zoo/audio/Splashing_Around_edit.mp3' />Welcome to the Memory Zoo!  Can you remember all the animals you see?  Say ready when you're ready for level 1.")
      .listen("Come on. Let's play. Say ready when you're ready")
      .renderTemplate(template);
    this.emit(':responseReady');  
  },
  'ReadyIntent': function () {
    const builder = new Alexa.templateBuilders.BodyTemplate6Builder();
    const template = builder.setToken('bodyTemplate')
                            .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Stripes2.jpg'))
                            .build();

    this.response.speak("<audio src='https://s3.amazonaws.com/memory-zoo/audio/Splashing_Around_edit.mp3' />Now tell me the animals you have seen.")
                 .listen("Which animals did you see?")
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