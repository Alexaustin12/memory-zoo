/*
A memory game Alexa Skill optimized for Echo Show
*/

'use strict';

const Alexa = require('alexa-sdk');
const ImageUtils = require('alexa-sdk').utils.ImageUtils;
const TextUtils = require('alexa-sdk').utils.TextUtils;

exports.handler = function(event, context, callback){
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = process.env.APP_ID;
  alexa.registerHandlers(newSessionHandlers, guessModeHandlers, preGuessModeHandlers);
  alexa.execute()
};

// Module vars
const animals = ['Bear', 'Elephant', 'Giraffe', 'Hippo', 'Monkey', 'Panda', 'Penguin', 'Tiger', 'Zebra'];
let levelAnimals = [];
let levelArr = [];
let lowercaseZoo = [];
let gameLevel, startTime, endTime;
const speechCons = ['bada bing bada boom', 'bazinga', 'bingo', 'booya', 'bravo', 'cha ching',
                        'cowabunga', 'dynomite', 'giddy up', 'hurray', 'huzzah', 'kazaam', 'ooh la la',
                        'righto', 'ta da', 'vroom', 'wahoo', 'way to go', 'well done', 'woo hoo', 'wowza',
                        'yay', 'yippee', 'yowza'];

// Functions
let randAnimal = (animalArr) => animalArr[Math.floor(Math.random() * animalArr.length)];

const getAnimals = (level) => {
  let creatures = animals.slice(0);
  let i;
  for (i = 0; i < level; i++) {
    let currentAnimal = randAnimal(creatures);
    levelAnimals.push(currentAnimal);
    creatures.splice(creatures.indexOf(currentAnimal), 1);
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

const states = {
  GUESSMODE: '_GUESSMODE', // User is trying to guess the animals
  PREGUESSMODE: '_PREGUESSMODE'  // User needs to say zoo time
};

const newSessionHandlers = { 
  'LaunchRequest': function () {
    console.log('this', this);
    this.handler.state = states.PREGUESSMODE;
    startTime = new Date();
    gameLevel = this.attributes.level = 1;
    let levelObj = createLevel(gameLevel);
    let listItems = levelObj.levelArr;
    this.attributes.zoo = levelObj.levelAnimals;
    lowercaseZoo = this.attributes.zoo.map(x => x.toLowerCase());    
    const builder = new Alexa.templateBuilders.ListTemplate2Builder();    

    const template = builder.setTitle('Memory Zoo')
                            .setToken('listTemplate')
                            .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Savannah.jpg'))
                            .setListItems(listItems)
                            .setBackButtonBehavior('HIDDEN')
                            .build();

    this.response.speak("<audio src='https://s3.amazonaws.com/memory-zoo/audio/Splashing_Around_edit.mp3' />Welcome to the Memory Zoo!  Can you remember all the animals you see?  Say zoo time when you're ready for level 1.")
      .listen("Come on. Let's play. Say zoo time when you're ready")
      .renderTemplate(template)
      .hint('zoo time');
    this.emit(':responseReady');  
  },
  'Unhandled': function () {
    const speechOutput = "Say zoo time when you're ready";
    const repromptSpeech = "Come on. Let's play. Say zoo time when you're ready";
    this.emit(':ask', speechOutput, repromptSpeech);
  }
};

const guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
  'GuessIntent': function () {
    this.handler.state = states.PREGUESSMODE;    
    const intentObj = this.event.request.intent;
    console.log('intentObj.slots', intentObj.slots);
    const animalSlots = ['animal_one', 'animal_two', 'animal_three', 'animal_four', 'animal_five', 'animal_six', 'animal_seven',
                         'animal_eight', 'animal_nine', 'animal_ten', 'animal_eleven', 'animal_twelve'];
    const userGuess = [];

    // When testing, lowercaseZoo will be an empty array, this populates it
    if (lowercaseZoo.length == 0) {
      lowercaseZoo = this.attributes.zoo.map(x => x.toLowerCase());
    }
    // When testing, gameLevel will be blank, this sets it
    if (!gameLevel) {
      gameLevel = this.attributes.level;
    }

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

    if (userCorrect && gameLevel !=8) {
      gameLevel++;
      let levelObj = createLevel(gameLevel);
      console.log('Logging level after user is correct', gameLevel);
      let listItems = levelObj.levelArr;
      this.attributes.zoo = levelObj.levelAnimals;
      lowercaseZoo = this.attributes.zoo.map(x => x.toLowerCase());       
      console.log('this.attributes.zoo', this.attributes.zoo);
      const builder = new Alexa.templateBuilders.ListTemplate2Builder();

      const template = builder.setTitle('Memory Zoo')
                              .setToken('listTemplate')
                              .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Savannah.jpg'))
                              .setListItems(listItems)
                              .setBackButtonBehavior('HIDDEN')                              
                              .build();
      
      let instructions;

      // At level 3, you need to swipe to see all the animals      
      if (gameLevel == 3) {
        instructions = "You've made it to level 3. You may need to swipe to see all the animals.  Wake your device and say zoo time when you're ready. "
      } else {
        instructions = `Say zoo time when you're ready for level ${gameLevel}`;        
      }

      this.response.speak(`<audio src='https://s3.amazonaws.com/memory-zoo/audio/Rollanddrop_Sting_edit.mp3' />
                           <say-as interpret-as="interjection">${randSpeechCon()}</say-as><break time="1s"/> ${instructions}`)
        .listen("Come on. Let's play. Say zoo time when you're ready")
        .renderTemplate(template)
        .hint('zoo time');
      this.emit(':responseReady');
    
    // After correctly completing level 8, you are a champion
    } else if (userCorrect && gameLevel == 8) {
      endTime = new Date();
      let gameTime = endTime - startTime;
      gameTime = gameTime / 1000;
      const gameMin = Math.floor(gameTime / 60);
      const gameSec = Math.round(gameTime) % 60;
      const builder = new Alexa.templateBuilders.BodyTemplate1Builder();
      const template = builder.setToken('bodyTemplateChamp')
                              .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/fireworks.jpg'))
                              .setTextContent(TextUtils.makeRichText(`<b>You are a champion!<br/>Memory Zoo completed in ${gameMin} minutes and ${gameSec} seconds</b>`))
                              .setBackButtonBehavior('HIDDEN')                              
                              .build();

      this.response.speak(`<say-as interpret-as="interjection">${randSpeechCon()}</say-as><break time="1s"/>
                           <audio src='https://s3.amazonaws.com/memory-zoo/audio/Classique_edit.mp3' />`)
                   .renderTemplate(template);
      this.emit(':responseReady'); 

    // Display and output when user is incorrect
    } else {
      const builder = new Alexa.templateBuilders.BodyTemplate1Builder();
      const template = builder.setToken('bodyTemplate1')
                              .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/gameover.jpg'))
                              .setTextContent(TextUtils.makeRichText(`<b><font size="5"> Thanks for playing Memory Zoo</font><br/>Great job! You reached level ${gameLevel}</b>`))
                              .setBackButtonBehavior('HIDDEN')                              
                              .build();

      this.response.speak(`<audio src='https://s3.amazonaws.com/memory-zoo/audio/Skip_With_My_Creole_Band_Sting_edit.mp3' />
                          <say-as interpret-as="interjection">aw man</say-as><break time="1s"/> Thanks for hanging out at the memory zoo. 
                          Wake your device and say play memory zoo to play again.`)
                   .renderTemplate(template);
      this.emit(':responseReady');  
    }
  },
  'Unhandled': function () {
    const speechOutput = "Say zoo time when you're ready";
    const repromptSpeech = "Come on. Let's play. Say zoo time when you're ready";
    this.emit(':ask', speechOutput, repromptSpeech);
  }
});

const preGuessModeHandlers = Alexa.CreateStateHandler(states.PREGUESSMODE, {
  'ReadyIntent': function () {
    this.handler.state = states.GUESSMODE;    
    const builder = new Alexa.templateBuilders.BodyTemplate6Builder();
    const template = builder.setToken('bodyTemplate6')
                            .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Stripes2.jpg'))
                            .setBackButtonBehavior('HIDDEN')                            
                            .build();

    this.response.speak("<audio src='https://s3.amazonaws.com/memory-zoo/audio/Baila_Mi_Cumbia_edit.mp3' />Now tell me the animals you have seen.")
                 .listen("Which animals did you see?")
                 .renderTemplate(template);
    this.emit(':responseReady');  
  },
  'Unhandled': function () {
    const speechOutput = "Which animals did you see?";
    const repromptSpeech = "Tell me the animals you have seen";
    this.emit(':ask', speechOutput, repromptSpeech);
  }
});