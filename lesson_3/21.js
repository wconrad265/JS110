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
  asciiArt();
  prompt('Welcome to 21!\n');
  prompt('The first player or dealer to win 3 rounds will win the match.');
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
    tie: 0,
    roundsCompleted: 1,
    playerMatches: 0,
    dealerMatches: 0,
    MatchesPlayed: 1
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

function outputHand(hand) {
  return joinOr(hand.map((card) => card[0]), ', ','and');
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

  // eslint-disable-next-line max-len
  playerTotal = playerTurnLoop(playerHand, playingDeck, dealerHand, playerTotal, scores);

  return playerTotal;
}

// eslint-disable-next-line max-len
function playerTurnLoop(playerHand, playingDeck, dealerHand, playerTotal, scores) {
  while (true) {
    let answer = getUserInput(playerHand, playerTotal, dealerHand, scores);

    playerTotal = playerHit(answer, playerHand, playerTotal, playingDeck);

    if (STAY.includes(answer) || busted(playerTotal)) break;

    clearLastLines(4);
  }
  return playerTotal;
}

function getUserInput(playerHand, playerTotal, dealerHand, scores) {
  playerInputMessage(playerHand, playerTotal, dealerHand, scores);
  let answer = readline.question().toLowerCase();

  // eslint-disable-next-line max-len
  answer = playerInputError(answer, playerHand, playerTotal, dealerHand, scores);

  return answer;
}

function playerInputErrorMessage() {
  promptError('Invalid input detected');
}

function playerInputMessage(playerHand, playerTotal, dealerHand, scores) {
  console.clear();
  winCountPrint(scores);
  outputDealerFirstCard(dealerHand);
  displayCards(playerHand, playerTotal);
  prompt("hit or stay? (h/s)");
}

function displayCards(playerHand, playerTotal) {
  if (playerHand.length > 2) {
    console.log('');
    prompt('You chose to hit!');
    prompt(`Your cards are now: ${outputHand(playerHand)}`);
    prompt(`Your total is now: ${playerTotal}\n`);
  } else {
    prompt(`You have: ${outputHand(playerHand)} for a total of ${playerTotal}\n`);
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

function playerBustedMessage(playerHand, playerTotal) {
  console.log('');
  promptError(`You busted, your hand of ${outputHand(playerHand)} for a total of ${playerTotal} is greater than ${NUMBER_LIMIT}\n`);
}

function playerBust(playerHand, playerTotal, scores) {
  playerBustedMessage(playerHand, playerTotal);
  updateScores(scores, 'dealer');
}

function dealerTurn(dealerHand, playingDeck) {
  let dealerTotal = total(dealerHand);

  while (dealerTotal < DEALER_STOP) {
    dealCard(dealerHand, playingDeck);
    dealerTotal = total(dealerHand);
  }
  return dealerTotal;
}

// eslint-disable-next-line max-len
function outputInformation(dealerHand, dealerTotal, playerHand, playerTotal, scores) {
  console.clear();
  winCountPrint(scores);
  prompt(`Dealer has: ${outputHand(dealerHand)} for a total of ${dealerTotal}`);
  prompt(`You have: ${outputHand(playerHand)} for a total of ${playerTotal}\n`);

  prompt('You choose to stay\n');
}

function didDealerBust(dealerTotal) {
  return (dealerTotal > NUMBER_LIMIT);
}

function dealerBustMessage(dealerTotal, dealerHand) {
  promptWin(`The dealer has busted with ${outputHand(dealerHand)}, you win with a value of ${dealerTotal}\n`);
}

function dealerBust(dealerTotal, dealerHand, scores) {
  dealerBustMessage(dealerTotal, dealerHand);
  updateScores(scores, 'player');
}

function findWinnder(playerTotal, dealerTotal) {
  if (playerTotal === dealerTotal) return 'tie';
  return (playerTotal > dealerTotal) ? 'player' : 'dealer';
}

// eslint-disable-next-line max-len
function displayWinner(playerHand, playerTotal, dealerHand, dealerTotal, winner) {
  if (winner === 'player') {
    promptWin(`You won with ${outputHand(playerHand)} for a total of ${playerTotal}\n`);
  } else if (winner === 'dealer') {
    promptError(`Dealer won with: ${outputHand(dealerHand)} for a total of ${dealerTotal}\n`);
  } else {
    prompt('It is a tie');
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
  scores[winner] += 1;
  scores.roundsCompleted += 1;
}

function playNextRound() {
  prompt(`Press enter to play next round`);
  readline.question();
}

function winMatchMessage(scores) {
  if (scores.player === ROUNDS_WIN) {
    promtWinGame(`You are the first to win ${ROUNDS_WIN} rounds, and have won the match!\n`);
  } else if (scores.dealer === ROUNDS_WIN) {
    promtWinGame(`The Dealer was the first to win ${ROUNDS_WIN} rounds, and has won the match!\n`);
  }
}

function winCheck(scores) {
  return (scores.player === ROUNDS_WIN) || (scores.dealer === ROUNDS_WIN);
}

function TwentyOneGame(playerHand, dealerHand, playingDeck, scores) {
  dealInitialHand(playerHand, dealerHand, playingDeck);

  let playerTotal = playerTurn(playerHand, playingDeck, dealerHand, scores);

  if (busted(playerTotal)) {
    playerBust(playerHand, playerTotal, scores);
    return;
  }

  let dealerTotal = dealerTurn(dealerHand, playingDeck);

  outputInformation(dealerHand, dealerTotal, playerHand, playerTotal, scores);

  if (didDealerBust(dealerTotal)) {
    dealerBust(dealerTotal, dealerHand, scores);
    return;
  }

  let winner = findWinnder(playerTotal, dealerTotal);

  updateScores(scores, winner);

  displayWinner(playerHand, playerTotal, dealerHand, dealerTotal, winner);
}

function gameLoop(scores) {
  while (true) {
    let dealerHand = [];
    let playerHand = [];

    let playingDeck = createShuffledDeck();

    TwentyOneGame(playerHand, dealerHand, playingDeck, scores);

    if (winCheck(scores)) break;

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
  prompt('Thank you for playing');
}

programLoop();