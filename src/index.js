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
  alexa.registerHandlers(handlers);
  alexa.execute()
};

// Module vars
// Removed Panda and Zebra
const animals = ['Bear', 'Elephant', 'Giraffe', 'Hippo', 'Monkey', 'Penguin', 'Tiger', 'Zebra'];
const lowercaseAnimals = animals.map(x => x.toLowerCase());
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

const createAudioLevel = (levelAnimals) => {
  let animalListSpeech = "";
  let animal;
  for (animal in levelAnimals) {
    animalListSpeech += levelAnimals[animal] + ", "
  }
  return animalListSpeech;
}

const randSpeechCon = () => speechCons[Math.floor(Math.random() * speechCons.length)];

const handlers = { 
  'LaunchRequest': function () {
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
    const audioLevel = createAudioLevel(levelObj.levelAnimals);
    const noDisplaySpeech = `<audio src='https://s3.amazonaws.com/memory-zoo/audio/Splashing_Around_edit.mp3' />Welcome to the Memory Zoo! Here is your first animal to remember: ${audioLevel}. Say zoo time when you're ready for level 1.`; 
    const repromptSpeech = "Come on. Let's play. Say zoo time when you're ready";

    this.response.speak("<audio src='https://s3.amazonaws.com/memory-zoo/audio/Splashing_Around_edit.mp3' />Welcome to the Memory Zoo!  Can you remember all the animals you see?  Say zoo time when you're ready for level 1.")
                 .listen(repromptSpeech)
                 .renderTemplate(template)
                 .hint('zoo time');
    
    if (this.event.context.System.device.supportedInterfaces.Display) {
      this.emit(':responseReady');
    } else {
      this.emit(':ask', noDisplaySpeech, repromptSpeech);
    }
  },
  'ReadyIntent': function () {
    // When testing, gameLevel will be blank, this sets it
    if (!gameLevel) {
      gameLevel = this.attributes.level;
    }
    const builder = new Alexa.templateBuilders.BodyTemplate6Builder();
    const template = builder.setToken('bodyTemplate6')
                            .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/Stripes2.jpg'))
                            .setBackButtonBehavior('HIDDEN')                            
                            .build();
    let speechOutput, repromptSpeech;
    if (gameLevel == 1) {
      speechOutput = "<audio src='https://s3.amazonaws.com/memory-zoo/audio/Baila_Mi_Cumbia_edit.mp3' />Now tell me what animal is in the zoo.";
      repromptSpeech = "What animal is in the zoo?";
    } else {
      speechOutput = "<audio src='https://s3.amazonaws.com/memory-zoo/audio/Baila_Mi_Cumbia_edit.mp3' />Now tell me the animals in the zoo.";
      repromptSpeech = "Which animals are in the zoo?";
    }

    this.response.speak(speechOutput)
                 .listen(repromptSpeech)
                 .renderTemplate(template);

    if (this.event.context.System.device.supportedInterfaces.Display) {
      this.emit(':responseReady');
    } else {
      this.emit(':ask', speechOutput, repromptSpeech);
    }
  },
  'GuessIntent': function () {
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

    // Get the user input from the slots and put into an array
    for (let key in intentObj.slots) {
      userGuess.push(intentObj.slots[key].value);
    }
    // Remove slot values that are not animals
    for (let i=0; i<userGuess.length; i++) {
      if (lowercaseAnimals.indexOf(userGuess[i]) == -1) {
        console.log('i', i);
        console.log('userGuess[i]', userGuess[i]);
        console.log('pre userGuess', userGuess);
        userGuess.splice(i, 1);
        console.log('post userGuess', userGuess);
        i--;
      }
    }
    let userCorrect = false;
    for (let i in lowercaseZoo) {
      userCorrect = true;
      if (lowercaseZoo.indexOf(userGuess[i]) == -1) {
          userCorrect = false;
          break;
      }
    }
    console.log('userGuess', userGuess);
    console.log('lowercaseZoo', lowercaseZoo);    

    if (userCorrect && gameLevel !=6) {
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
      const audioLevel = createAudioLevel(levelObj.levelAnimals);                              
      let instructions;

      // At level 3, you need to swipe to see all the animals      
      if (gameLevel == 3 && this.event.context.System.device.supportedInterfaces.Display) {
        instructions = "You've made it to level 3. You may need to swipe to see all the animals.  Wake your device and say zoo time when you're ready. "
      } else if (gameLevel != 3 && this.event.context.System.device.supportedInterfaces.Display) {
        instructions = `Say zoo time when you're ready for level ${gameLevel}`;        
      } else {
        instructions = `Now the zoo has ${gameLevel} animals. The animals are: ${audioLevel}. Say zoo time when you're ready for level ${gameLevel}`;
      }
      
      const speechOutput = `<audio src='https://s3.amazonaws.com/memory-zoo/audio/Rollanddrop_Sting_edit.mp3' />
                            <say-as interpret-as="interjection">${randSpeechCon()}</say-as><break time="1s"/> ${instructions}`;
      const repromptSpeech = "Come on. Let's play. Say zoo time when you're ready";

      this.response.speak(speechOutput)
                   .listen(repromptSpeech)
                   .renderTemplate(template)
                   .hint('zoo time');
      
      if (this.event.context.System.device.supportedInterfaces.Display) {
        this.emit(':responseReady');
      } else {
        this.emit(':ask', speechOutput, repromptSpeech);
      }

    // After correctly completing level 6, you are a champion
    } else if (userCorrect && gameLevel == 6) {
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
      const noDisplaySpeech = `<say-as interpret-as="interjection">${randSpeechCon()}</say-as>. Congratulations, you are a champion! 
                              You completed Memory Zoo in ${gameMin} minutes and ${gameSec} seconds
                              <audio src='https://s3.amazonaws.com/memory-zoo/audio/Classique_edit.mp3' />`;
      this.response.speak(`<say-as interpret-as="interjection">${randSpeechCon()}</say-as><break time="1s"/>
                           <audio src='https://s3.amazonaws.com/memory-zoo/audio/Classique_edit.mp3' />`)
                   .renderTemplate(template);

      if (this.event.context.System.device.supportedInterfaces.Display) {
        this.emit(':responseReady');
      } else {
        this.emit(':tell', noDisplaySpeech);
      }
    // Display and output when user is incorrect
    } else {
      const builder = new Alexa.templateBuilders.BodyTemplate1Builder();
      const template = builder.setToken('bodyTemplate1')
                              .setBackgroundImage(ImageUtils.makeImage('https://s3.amazonaws.com/memory-zoo/images/gameover.jpg'))
                              .setTextContent(TextUtils.makeRichText(`<b><font size="5"> Thanks for playing Memory Zoo</font><br/>Great job! You reached level ${gameLevel}</b>`))
                              .setBackButtonBehavior('HIDDEN')                              
                              .build();
      const speechOutput = `<audio src='https://s3.amazonaws.com/memory-zoo/audio/Skip_With_My_Creole_Band_Sting_edit.mp3' />
                            <say-as interpret-as="interjection">aw man</say-as><break time="1s"/> Thanks for hanging out at the memory zoo. 
                            Wake your device and say open memory zoo to play again.`;
      this.response.speak(speechOutput)
                   .renderTemplate(template);
      if (this.event.context.System.device.supportedInterfaces.Display) {
        this.emit(':responseReady');
      } else {
        this.emit(':tell', speechOutput);
      }
    }
  },
  'AMAZON.HelpIntent': function () {
    this.response.speak("Say enter the zoo to begin. You are tasked with memorizing the animals you encounter. To complete the zoo, repeat back all the animals in the correct order.")
                 .listen("Say enter the zoo to begin.");
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function () {
    this.response.speak("Thanks for visiting the memory zoo. Come back soon!")
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function () {
    this.emit('AMAZON.CancelIntent');
  },
  'StartIntent': function () {
    this.emit('LaunchRequest');
  },
  'Unhandled': function () {
    this.response.speak("There's no time to pet the animals! We have a game to play!")
                 .listen("Let's get back to the game!");
    this.emit(':responseReady');
  },
}