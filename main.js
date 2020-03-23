const request = require('request-promise');

const BASE_URL = 'https://us-central1-rival-chatbot-challenge.cloudfunctions.net';
const HEADERS = {'content-type': 'application/json'};

let register_options = {
  url: `${BASE_URL}/challenge-register`,
  headers: HEADERS,
  method: 'POST',
  json: {
    'name': 'Taher Dameh',
    'email': 'tdameh@gmail.com'      
  }
};

let conversation_options = {
  url: `${BASE_URL}/challenge-conversation`,
  headers: HEADERS,
  method: 'POST',
  json: {
    'user_id': null   
  }
};

let question_options = {
  url: `${BASE_URL}/challenge-behaviour`,
  headers: HEADERS,
  method: 'GET',
};

let reply_options = {
  url: `${BASE_URL}/challenge-behaviour`,
  headers: HEADERS,
  method: 'POST',
  json: {
    content: null   
  }
};

function get_items_list(question) {
  parts = question.split(':');
  items = parts[1].substring(1, parts[1].length - 1);
  items = items.split(', ');
  return items;
}

function generate_answer(question) {
  if (question.includes('Are you')) {
    return 'yes';
  }

  if (question.startsWith('What is the sum')) {
    numbers = get_items_list(question);
    result = 0;
    numbers.forEach(number => {
      result += parseInt(number);
    });
    return result.toString();
  }

  if (question.startsWith('What is the largest')) {
    numbers = get_items_list(question);
    max = parseInt(numbers[0]);
    numbers.forEach(number => {
      if (parseInt(number) > max) max = parseInt(number);
    });
    return max.toString();
  }

  if (question.includes('even number of letters')) {
    words = get_items_list(question);
    result = [];
    words.forEach(word => {
      if (word.length % 2 == 0) result.push(word);
    });
    return result.join(',');
  }

  if (question.includes('alphabetize')) {
    words = get_items_list(question);
    words.sort((a, b) => {
      return a.localeCompare(b);
    });
    return words.join(',');
  }

  return 'I don\'t know';
}

async function get_a_new_question() {
  res = await request(question_options);
  res = JSON.parse(res);
  res.messages.forEach((message) => {
    console.log(`ChatBot: ${message.text}`);
  });

  return res.messages[res.messages.length - 1].text;
}

async function start_program() {
  try {
    let res = await request(register_options);
    console.log('User Registered...');
    conversation_options.json.user_id = res.user_id;
    res = await request(conversation_options);
    console.log('Conversation Started...');
    question_options.url = `${question_options.url}/${res.conversation_id}`
    reply_options.url = `${reply_options.url}/${res.conversation_id}`
    res = {correct: true};
    while (res.correct) {
      question = await get_a_new_question();
      answer = generate_answer(question);
      console.log(`Taher: ${answer}`);
      reply_options.json.content = answer
      res = await request(reply_options);
    }
    console.log('ENDED...');
  } catch (e) {
    console.log('Error while running the program, Exit ...');
    console.log(e.message);
  }
}

start_program();
