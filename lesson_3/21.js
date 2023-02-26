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
const dashBreak = () => promptScoreBoard('|----------------------|           |--------------------------------|');
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
  prompt('The first player or dealer to win 3 rounds of 21, will win the game.');
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

function initalizePerson() {
  return {
    hand: [],
    total: 0
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

function dealInitialHand(player, dealer, playingDeck) {
  dealCard(player.hand, playingDeck);
  dealCard(player.hand, playingDeck);

  dealCard(dealer.hand, playingDeck);
  dealCard(dealer.hand, playingDeck);
}

function combineHand(hand) {
  return joinOr(hand.map((card) => card[0]), ', ','and');
}

function outputPlayerHand(player) {
  prompt(`You have: ${combineHand(player.hand)} for a total of ${player.total}\n`);
}

function outputDealerFirstCard(dealer) {
  prompt(`Dealer has: ${dealer.hand[0][0]} and unknown card`);
}

function calculateTotal(hand) {
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

function playerTurn(player, playingDeck, dealer, scores) {
  player.total = calculateTotal(player.hand);

  while (true) {
    let answer = getUserInput(player, dealer, scores);

    playerHit(answer, player, playingDeck);

    if (STAY.includes(answer) || busted(player)) break;
  }
}

function getUserInput(player, dealer, scores) {
  playerInputMessage(player, dealer, scores);
  let answer = readline.question().toLowerCase();

  answer = playerInputError(answer, player, dealer, scores);

  return answer;
}

function playerInputMessage(player, dealer, scores) {
  console.clear();
  winCountPrint(scores);
  outputDealerFirstCard(dealer);
  displayPlayerHitCards(player);
  prompt("hit or stay? (h/s)");
}

function displayPlayerHitCards(player) {
  if (player.hand.length > 2) {
    console.log('');
    prompt('You chose to hit!');
    prompt(`Your cards are now: ${combineHand(player.hand)}`);
    prompt(`Your total is now: ${player.total}\n`);
  } else {
    outputPlayerHand(player);
  }
}

function playerInputError(answer, player, dealer, scores) {
  while (!HIT_OR_STAY.includes(answer)) {
    playerInputMessage(player, dealer, scores);
    playerInputErrorMessage();
    answer = readline.question().toLowerCase();
  }
  return answer;
}

function playerInputErrorMessage() {
  promptError('Invalid input detected');
}

function playerHit(answer, player, playingDeck) {
  if (HIT.includes(answer)) {
    dealCard(player.hand, playingDeck);
    player.total = calculateTotal(player.hand);
  }
}

function busted(player) {
  return player.total > NUMBER_LIMIT;
}

function dealerTurn(dealer, playingDeck) {
  dealer.total = calculateTotal(dealer.hand);

  while (dealer.total < DEALER_STOP) {
    dealCard(dealer.hand, playingDeck);
    dealer.total = calculateTotal(dealer.hand);
  }
}

function findWinner(player, dealer) {
  if (player.total > NUMBER_LIMIT) return 'playerBust';

  if (dealer.total > NUMBER_LIMIT) return 'dealerBust';

  if (player.total === dealer.total) return 'tie';

  return (player.total > dealer.total) ? 'player' : 'dealer';
}

function winCountPrint(scores) {
  promptScoreBoard(` ______________________             ________________________________`);

  promptScoreBoard(`|      SCOREBOARD      |           |        Card       |   Values   |`);
  dashBreak();

  promptScoreBoard(`| Round: ${scores.roundsCompleted}             |           |      2 - 10       | face value |`);
  dashBreak();
  promptScoreBoard(`| Current Rounds Won   |           | Jack, Queen, King |     10     |`);
  dashBreak();

  promptScoreBoard(`| User: ${scores.player}              |           |         Ace       |   1 or 11  |`);
  promptScoreBoard(`| Computer: ${scores.dealer}          |           |________________________________|`);

  promptScoreBoard(`|______________________|\n`);
}

function outputInformation(dealer, player, scores, winner) {

  if (winner === 'playerBust') {
    console.clear();
    winCountPrint(scores);
    outputDealerFirstCard(dealer);
    outputPlayerHand(player);

  } else {
    console.clear();
    winCountPrint(scores);
    prompt(`Dealer has: ${combineHand(dealer.hand)} for a total of ${dealer.total}`);
    outputPlayerHand(player);
  }
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
}

function updateRounds(scores) {
  scores.roundsCompleted += 1;
}

function chooseToStayMessage() {
  console.log('');
  prompt('You choose to stay');
}

function playerBustedMessage(player) {
  displayPlayerHitCards(player);
  promptError(`You busted.`);
  promptError('Dealer Wins\n');
}

function dealerBustMessage(dealer) {
  chooseToStayMessage();
  console.log('');
  promptWin(`The dealer has busted with ${combineHand(dealer.hand)}, for a total of ${dealer.total}.`);
  promptWin('You win!\n');
}

function dealerWinMessage(dealer) {
  chooseToStayMessage();
  console.log('');
  promptError(`Dealer won with: ${combineHand(dealer.hand)} for a total of ${dealer.total}.\n`);
}

function playerWinMessage(player) {
  chooseToStayMessage();
  console.log('');
  promptWin(`You won with ${combineHand(player.hand)} for a total of ${player.total}.\n`);
}

function tieMessage() {
  console.log('');
  prompt('It is a tie');
}

function displayWinner(player, dealer, winner) {

  switch (winner) {
    case 'playerBust':
      playerBustedMessage(player);
      break;
    case 'dealerBust':
      dealerBustMessage(dealer);
      break;
    case 'player':
      playerWinMessage(player);
      break;
    case 'dealer':
      dealerWinMessage(dealer);
      break;
    case 'tie':
      tieMessage();
      break;
  }
}

function playNextRound() {
  prompt(`Press enter to play next round`);
  readline.question();
}

function winGameCheck(scores) {
  return (scores.player === ROUNDS_WIN) || (scores.dealer === ROUNDS_WIN);
}

function winGameMessage(scores) {
  if (scores.player === ROUNDS_WIN) {
    promtWinGame(`You are the first to win ${ROUNDS_WIN} rounds, and have won the game!\n`);
  } else if (scores.dealer === ROUNDS_WIN) {
    promtWinGame(`The Dealer was the first to win ${ROUNDS_WIN} rounds, and has won the game!\n`);
  }
}

function playAgain() {
  playAgainMessage();
  let answer = readline.question().toLowerCase();

  answer = playAgainError(answer);
  return (answer[0] !== 'y');
}

function playAgainMessage () {
  prompt('Do you want to play another game of 21? (y/n)');
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

function thankYouMessage() {
  console.log('');
  prompt('Thank you for playing!');
}

function TwentyOneGame(player, dealer, playingDeck, scores) {
  dealInitialHand(player, dealer, playingDeck);

  playerTurn(player, playingDeck, dealer, scores);

  dealerTurn(dealer, playingDeck);

  const winner = findWinner(player, dealer);

  updateScores(scores, winner);

  outputInformation(dealer, player, scores, winner);

  displayWinner(player, dealer, winner);

  updateRounds(scores);
}

function gameLoop(scores) {
  while (true) {
    const dealer = initalizePerson();
    const player = initalizePerson();

    const playingDeck = createShuffledDeck();

    TwentyOneGame(player, dealer, playingDeck, scores);

    if (winGameCheck(scores)) break;

    playNextRound();
  }
}

function programLoop() {
  while (true) {
    const scores = initializeScores();

    welcomeMessage();

    gameLoop(scores);

    winGameMessage(scores);

    if (playAgain()) break;
  }
  thankYouMessage();
}

programLoop();