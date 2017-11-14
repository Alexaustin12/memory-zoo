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

// Module vars
const animals = ['Bear', 'Elephant', 'Giraffe', 'Hippo', 'Monkey', 'Panda', 'Penguin', 'Tiger', 'Zebra'];
let levelAnimals = [];
let levelArr = [];
let lowercaseZoo = [];
const speechCons = ['bada bing bada boom', 'bazinga', 'bingo', 'booya', 'bravo', 'cha ching',
                        'cowabunga', 'dynomite', 'giddy up', 'hurray', 'huzzah', 'kazaam', 'ooh la la',
                        'righto', 'ta da', 'vroom', 'wahoo', 'way to go', 'well done', 'woo hoo', 'wowza',
                        'yay', 'yippee', 'yowza'];

// Functions
const randAnimal = () => animals[Math.floor(Math.random() * animals.length)];

const getAnimals = (level) => {
  let i;
  for (i = 0; i < level; i++) {
    levelAnimals.push(randAnimal());
  }
  return levelAnimals; 
}

const createLevel = (level) => {
  levelAnimals = [];
  levelArr = [];
  levelAnimals = getAnimals(level);
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
  let levelObj = {"levelArr": levelArr, "levelAnimals": levelAnimals};
  return levelObj;
}

const randSpeechCon = () => speechCons[Math.floor(Math.random() * speechCons.length)];

// Request handlers
const handlers = {
  'LaunchRequest': function () {
    this.attributes.level = 1;
    let levelObj = createLevel(this.attributes.level);
    let listItems = levelObj.levelArr;
    this.attributes.zoo = levelObj.levelAnimals;
    lowercaseZoo = this.attributes.zoo.map(x => x.toLowerCase());    
    const builder = new Alexa.templateBuilders.ListTemplate2Builder();    

    const template = builder.setTitle('Memory Zoo')
                            .setToken('listTemplate')
                            .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Savannah.jpg'))
                            .setListItems(listItems)
                            .build();
    
    this.response.speak("<audio src='https://s3.amazonaws.com/memory-zoo/audio/Splashing_Around_edit.mp3' />Welcome to the Memory Zoo!  Can you remember all the animals you see?  Say zoo time when you're ready for level 1.")
      .listen("Come on. Let's play. Say zoo time when you're ready")
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
    console.log('intentObj.slots', intentObj.slots);
    const animalSlots = ['animal_one', 'animal_two', 'animal_three', 'animal_four', 'animal_five', 'animal_six', 'animal_seven',
                         'animal_eight', 'animal_nine', 'animal_ten', 'animal_eleven', 'animal_twelve'];
    const userGuess = [];
    let key;
    for (key in lowercaseZoo) {
      userGuess.push(intentObj.slots[animalSlots[key]].value);
    }
    let userCorrect = false;
    let i;
    for (i in lowercaseZoo) {
      userCorrect = true;
      if (userGuess[i] != lowercaseZoo[i]) {
          userCorrect = false;
          break;
      }
    }
    console.log('userGuess', userGuess);
    console.log('lowercaseZoo', lowercaseZoo);    

    if (userCorrect) {
      this.attributes.level++;
      let levelObj = createLevel(this.attributes.level);
      let listItems = levelObj.levelArr;
      this.attributes.zoo = levelObj.levelAnimals;
      lowercaseZoo = this.attributes.zoo.map(x => x.toLowerCase());       
      console.log('this.attributes.zoo', this.attributes.zoo);
      const builder = new Alexa.templateBuilders.ListTemplate2Builder();      
  
      const template = builder.setTitle('Memory Zoo')
                              .setToken('listTemplate')
                              .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Savannah.jpg'))
                              .setListItems(listItems)
                              .build();
      
      this.response.speak(`<audio src='https://s3.amazonaws.com/memory-zoo/audio/Rollanddrop_Sting_edit.mp3' />
                           <say-as interpret-as="interjection">${randSpeechCon()}</say-as><break time="1s"/>
                           Say zoo time when you're ready for level ${this.attributes.level}`)
        .listen("Come on. Let's play. Say zoo time when you're ready")
        .renderTemplate(template);
      this.emit(':responseReady');  
    } else {
      const speechOutput = "Wrong!";
      this.emit(':tell', speechOutput);
    }
  },
  'Unhandled': function () {
    const speechOutput = 'This is unhandled';
    this.emit(':tell', speechOutput);
  }
};