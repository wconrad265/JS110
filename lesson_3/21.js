const readline = require('readline-sync');
const CARDS = [
  ['2', 2], ['3', 3], ['4', 4], ['5', 5], ['6', 6], ['7', 7], ['8', 8], ['9', 9], ['10', 10], // number cards
  ['Jack', 10], ['Queen', 10], ['King', 10],                               // face cards
  ['Ace', [1, 11]]];                                                       // Ace
const NUMBER_LIMIT = 21;
const DEALER_STOP = 17;
const HIT = ['h', 'hit'];
const STAY = ['s', 'stay'];
const HIT_OR_STAY = HIT.concat(STAY);
const ROUNDS_WIN = 3;

const prompt = (msg) => console.log('\x1b[37m%s\x1b[0m', `=> ${msg}`);        // white
const promptError = (msg) => console.log('\x1b[31m%s\x1b[0m', `=> ${msg}`);   // red
const promptScoreBoard = (msg) => console.log('\x1b[36m%s\x1b[0m', `${msg}`); // cyan
const promptWin = (msg) => console.log('\x1b[33m%s\x1b[0m', `=> ${msg}`);     // yellow
const dashBreak = () => promptScoreBoard('|----------------------|');
const promtWinGame = (msg) => console.log('\x1b[32m%s\x1b[0m', `=> ${msg}`);  // green

function clearLastLines(count) {
  process.stdout.moveCursor(0, -count);
  process.stdout.clearScreenDown();
}

function joinOr(arr, delimiter  = ', ', end = 'or') {
  if (!arr.length || arr.length === 1) return arr.toString();

  return `${arr.slice(0, arr.length - 1).join(delimiter)} ${end} ${arr.slice(-1)}`;
}

function welcomeMessage() {
  console.clear();
  console.log('');
  asciiArt();
  prompt('Welcome to 21!\n');
  prompt('The first player or dealer to win 3 rounds will, win the match.');
  prompt('Press enter to begin.');
  readline.question();
}

function asciiArt() {
  console.log(`
  .------------------.  .----------------. 
  | .--------------. || .--------------. |
  | |    _____     | || |     __       | |
  | |   / ___ \`.   | || |    /  |      | |
  | |  |_/___) |   | || |    \`| |      | |
  | |   .'____.'   | || |     | |      | |
  | |  / /____     | || |    _| |_     | |
  | |  |_______|   | || |   |_____|    | |
  | |              | || |              | |
  | '--------------' || '--------------' |
  '------------------'  '----------------' `);
}

function initializeScores() {
  return {
    player: 0,
    dealer: 0,
    roundsCompleted: 1,
  };
}

function createShuffledDeck() {
  let cardsCopy = JSON.parse(JSON.stringify(CARDS));
  let playingDeck = Array.from({ length: 4 }, () => cardsCopy).flat();

  shuffle(playingDeck);

  return playingDeck;
}

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index--) {
    let otherIndex = Math.floor(Math.random() * (index + 1)); // 0 to index
    [array[index], array[otherIndex]] = [array[otherIndex], array[index]]; // swap elements
  }
}

function dealCard(person, playingDeck) {
  person.push(playingDeck.pop());
}

function dealInitialHand(playerHand, dealerHand, playingDeck) {
  dealCard(playerHand, playingDeck);
  dealCard(playerHand, playingDeck);

  dealCard(dealerHand, playingDeck);
  dealCard(dealerHand, playingDeck);
}

function combineHand(hand) {
  return joinOr(hand.map((card) => card[0]), ', ','and');
}

function outputPlayerHand(playerHand, playerTotal) {
  prompt(`You have: ${combineHand(playerHand)} for a total of ${playerTotal}\n`);
}

function outputDealerFirstCard(dealerHand) {
  prompt(`Dealer has: ${dealerHand[0][0]} and unknown card`);
}

function total(hand) {
  if (hand.some((card) => card[0] === 'Ace')) {
    let total = calculateWithoutAce(hand);
    let acesInHand =  filterAces(hand);

    for (let idx = 0; idx < acesInHand.length; idx++) {
      if (total > 10)  total += acesInHand[idx][1][0];
      if (total <= 10) total += acesInHand[idx][1][1];
    }
    return total;
  }
  return hand.reduce((acc, curr) => acc + curr[1], 0);
}

function calculateWithoutAce(hand) {
  return hand.filter((card) => card[0] !== 'Ace').reduce((acc, curr) => acc + curr[1], 0);
}

function filterAces(hand) {
  return hand.filter((card) => card[0] === 'Ace');
}

function playerTurn(playerHand, playingDeck, dealerHand, scores) {
  let playerTotal = total(playerHand);

  while (true) {
    let answer = getUserInput(playerHand, playerTotal, dealerHand, scores);

    playerTotal = playerHit(answer, playerHand, playerTotal, playingDeck);

    if (STAY.includes(answer) || busted(playerTotal)) break;
  }
  return playerTotal;
}

function getUserInput(playerHand, playerTotal, dealerHand, scores) {
  playerInputMessage(playerHand, playerTotal, dealerHand, scores);
  let answer = readline.question().toLowerCase();

  answer = playerInputError(answer, playerHand, playerTotal, dealerHand,
    scores);

  return answer;
}

function playerInputErrorMessage() {
  promptError('Invalid input detected');
}

function playerInputMessage(playerHand, playerTotal, dealerHand, scores) {
  console.clear();
  winCountPrint(scores);
  outputDealerFirstCard(dealerHand);
  displayPlayerCards(playerHand, playerTotal);
  prompt("hit or stay? (h/s)");
}

function displayPlayerCards(playerHand, playerTotal) {
  if (playerHand.length > 2) {
    console.log('');
    prompt('You chose to hit!');
    prompt(`Your cards are now: ${combineHand(playerHand)}`);
    prompt(`Your total is now: ${playerTotal}\n`);
  } else {
    outputPlayerHand(playerHand, playerTotal);
  }
}

function playerInputError(answer, playerHand, playerTotal, dealerHand, scores) {
  while (!HIT_OR_STAY.includes(answer)) {
    playerInputMessage(playerHand, playerTotal, dealerHand, scores);
    playerInputErrorMessage();
    answer = readline.question().toLowerCase();
  }
  return answer;
}

function playerHit(answer, playerHand, playerTotal, playingDeck) {
  if (HIT.includes(answer)) {
    dealCard(playerHand, playingDeck);
    return total(playerHand);
  }
  return playerTotal;
}

function busted(playerTotal) {
  return playerTotal > NUMBER_LIMIT;
}

function dealerTurn(dealerHand, playingDeck) {
  let dealerTotal = total(dealerHand);

  while (dealerTotal < DEALER_STOP) {
    dealCard(dealerHand, playingDeck);
    dealerTotal = total(dealerHand);
  }
  return dealerTotal;
}

function outputInformation(dealerHand, dealerTotal, playerHand, playerTotal,
  scores, winner) {

  if (winner === 'playerBust') {
    console.clear();
    winCountPrint(scores);
    outputDealerFirstCard(dealerHand);
    outputPlayerHand(playerHand, playerTotal);

  } else {
    console.clear();
    winCountPrint(scores);
    prompt(`Dealer has: ${combineHand(dealerHand)} for a total of ${dealerTotal}`);
    outputPlayerHand(playerHand, playerTotal);
  }
}

function findWinnder(playerTotal, dealerTotal) {
  if (playerTotal > NUMBER_LIMIT) return 'playerBust';

  if (dealerTotal > NUMBER_LIMIT) return 'dealerBust';

  if (playerTotal === dealerTotal) return 'tie';

  return (playerTotal > dealerTotal) ? 'player' : 'dealer';
}

function chooseToStayMessage() {
  console.log('');
  prompt('You choose to stay');
}

function playerBustedMessage(playerHand, playerTotal) {
  displayPlayerCards(playerHand, playerTotal);
  promptError(`You busted, your hand of ${combineHand(playerHand)} for a total of ${playerTotal}.\n`);
}

function dealerBustMessage(dealerTotal, dealerHand) {
  chooseToStayMessage();
  console.log('');
  promptError(`The dealer has busted with ${combineHand(dealerHand)}, with a value of ${dealerTotal}.\n`);
}

function dealerWinMessage(dealerTotal, dealerHand) {
  chooseToStayMessage();
  console.log('');
  promptError(`Dealer won with: ${combineHand(dealerHand)} for a total of ${dealerTotal}.\n`);
}

function playerWinMessage(playerHand, playerTotal) {
  chooseToStayMessage();
  console.log('');
  promptWin(`You won with ${combineHand(playerHand)} for a total of ${playerTotal}.\n`);
}

function tieMessage() {
  console.log('');
  prompt('It is a tie');
}

function displayWinner(playerHand, playerTotal, dealerHand, dealerTotal,
  winner) {

  switch (winner) {
    case 'playerBust':
      playerBustedMessage(playerHand, playerTotal);
      break;
    case 'dealerBust':
      dealerBustMessage(dealerTotal, dealerHand);
      break;
    case 'player':
      playerWinMessage(playerHand, playerTotal);
      break;
    case 'dealer':
      dealerWinMessage(dealerTotal, dealerHand);
      break;
    case 'tie':
      tieMessage();
      break;
  }
}

function playAgain() {
  playAgainMessage();
  let answer = readline.question().toLowerCase();

  answer = playAgainError(answer);
  return (answer[0] !== 'y');
}

function playAgainMessage () {
  prompt('Do you want to play another match? (y/n)');
}

function playAgainErrorMessage() {
  promptError('Please enter "y" or "n"');
}

function playAgainError(answer) {
  while (answer !== 'n' && answer !== 'y') {
    clearLastLines(3);
    playAgainErrorMessage();
    playAgainMessage();
    answer = readline.question().toLowerCase();
  }
  return answer;
}

function winCountPrint(scores) {
  promptScoreBoard(` _______________________`);

  promptScoreBoard(`|      SCOREBOARD      |`);
  dashBreak();

  promptScoreBoard(`| Round: ${scores.roundsCompleted}             |`);
  dashBreak();
  promptScoreBoard(`| Current Rounds Won   |`);
  dashBreak();

  promptScoreBoard(`| User: ${scores.player}              |`);
  promptScoreBoard(`| Computer: ${scores.dealer}          |`);

  promptScoreBoard(`|______________________|\n`);
}

function updateScores(scores, winner) {
  switch (winner) {
    case 'playerBust':
      scores.dealer += 1;
      break;
    case 'dealerBust':
      scores.player += 1;
      break;
    case 'player':
      scores.player += 1;
      break;
    case 'dealer':
      scores.dealer += 1;
      break;
  }
  scores.roundsCompleted += 1;
}

function playNextRound() {
  prompt(`Press enter to play next round`);
  readline.question();
}

function winMatchCheck(scores) {
  return (scores.player === ROUNDS_WIN) || (scores.dealer === ROUNDS_WIN);
}

function winMatchMessage(scores) {
  if (scores.player === ROUNDS_WIN) {
    promtWinGame(`You are the first to win ${ROUNDS_WIN} rounds, and have won the match!\n`);
  } else if (scores.dealer === ROUNDS_WIN) {
    promtWinGame(`The Dealer was the first to win ${ROUNDS_WIN} rounds, and has won the match!\n`);
  }
}

function thankYouMessage() {
  console.log('');
  prompt('Thank you for playing');
}

function TwentyOneGame(playerHand, dealerHand, playingDeck, scores) {
  dealInitialHand(playerHand, dealerHand, playingDeck);

  let playerTotal = playerTurn(playerHand, playingDeck, dealerHand,scores);

  let dealerTotal = dealerTurn(dealerHand, playingDeck);

  let winner = findWinnder(playerTotal, dealerTotal);

  updateScores(scores, winner);

  outputInformation(dealerHand, dealerTotal,playerHand, playerTotal,
    scores, winner);

  displayWinner(playerHand, playerTotal, dealerHand, dealerTotal, winner);
}

function gameLoop(scores) {
  while (true) {
    let dealerHand = [];
    let playerHand = [];

    let playingDeck = createShuffledDeck();

    TwentyOneGame(playerHand, dealerHand, playingDeck, scores);

    if (winMatchCheck(scores)) break;

    playNextRound();
  }
}

function programLoop() {

  while (true) {
    const scores = initializeScores();

    welcomeMessage();

    gameLoop(scores);

    winMatchMessage(scores);

    if (playAgain()) break;
  }
  thankYouMessage();
}

programLoop();