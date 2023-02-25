const readline = require('readline-sync');
const INITIAL_MARKER = ' ';
const HUMAN_MARKER = 'X';
const COMPUTER_MARKER = 'O';
const ROUNDS_WIN = 5;
const MATCHES_WIN  = 2;
const FIRST_MOVE = 'choose';
const WINNING_LINES = [
  [1, 2, 3], [4, 5, 6], [7, 8, 9], // rows
  [1, 4, 7], [2, 5, 8], [3, 6, 9], // columns
  [1, 5, 9], [3, 5, 7]             // diagonals
];

const prompt = (msg) => console.log('\x1b[37m%s\x1b[0m', `=> ${msg}`);
const promptError = (msg) => console.log('\x1b[31m%s\x1b[0m', `=> ${msg}`);
const promptScoreBoard = (msg) => console.log('\x1b[36m%s\x1b[0m', `${msg}`);
const promptWin = (msg) => console.log('\x1b[33m%s\x1b[0m', `=> ${msg}`);
const promtWinGame = (msg) => console.log('\x1b[32m%s\x1b[0m', `=> ${msg}`);
const dashBreak = () => promptScoreBoard('|--------------------------------------|');

function AsciiArt() {
  console.clear();
  console.log('\n');
  console.log(` 
 _________  ___  ________          _________  ________  ________          _________  ________  _______      
|\\___   ___\\\\  \\|\\   ____\\        |\\___   ___\\\\   __  \\|\\   ____\\        |\\___   ___\\\\   __  \\|\\  ___ \\     
\\|___ \\  \\_\\ \\  \\ \\  \\___|        \\|___ \\  \\_\\ \\  \\|\\  \\ \\  \\___|        \\|___ \\  \\_\\ \\  \\|\\  \\ \\   __/|    
     \\ \\  \\ \\ \\  \\ \\  \\                \\ \\  \\ \\ \\   __  \\ \\  \\                \\ \\  \\ \\ \\  \\\\\\  \\ \\  \\_|/__  
      \\ \\  \\ \\ \\  \\ \\  \\____            \\ \\  \\ \\ \\  \\ \\  \\ \\  \\____            \\ \\  \\ \\ \\  \\\\\\  \\ \\  \\_|\\ \\ 
       \\ \\__\\ \\ \\__\\ \\_______\\           \\ \\__\\ \\ \\__\\ \\__\\ \\_______\\           \\ \\__\\ \\ \\_______\\ \\_______\\
        \\|__|  \\|__|\\|_______|            \\|__|  \\|__|\\|__|\\|_______|            \\|__|  \\|_______|\\|_______|     `);
  console.log('\n');
}

function clearLastLines(count) {
  process.stdout.moveCursor(0, -count);
  process.stdout.clearScreenDown();
}

function welcomeMessage() {
  prompt(`Welcome to tic, tac, toe, best of ${MATCHES_WIN} out of 3 matches!`);
  prompt(`The first person to win ${ROUNDS_WIN} rounds wins the match!`);
  prompt(`The first person to win ${MATCHES_WIN} matches, wins the game!\n\n`);
}

function firstMove() {
  if (FIRST_MOVE !== `choose`) return FIRST_MOVE;

  while (true) {
    prompt('Who would like to go first? enter p for player, or c for computer (p/c)');
    let answer = readline.question().trim().toLowerCase();

    if (['p', 'c'].includes(answer)) return (answer === 'p') ? 'player' : 'computer';
    clearLastLines(3);
    promptError("That's not a valid choice");
  }
}

function displayGameInformation(board,scores) {
  console.clear();

  winCountPrint(scores);

  welcomeMessage();

  displayBoard(board, scores);
}

function displayBoard(board) {
  prompt(`You are ${HUMAN_MARKER}. Computer is ${COMPUTER_MARKER}`);
  console.log(`\n`);

  console.log('     |     |');
  console.log(`  ${board['1']}  |  ${board['2']}  |  ${board['3']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['4']}  |  ${board['5']}  |  ${board['6']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['7']}  |  ${board['8']}  |  ${board['9']}`);
  console.log('     |     |');
  console.log('');
}

function initializeBoard() {
  let board = {};

  for (let square = 1; square <= 9; square++) {
    board[String(square)] = INITIAL_MARKER;
  }
  return board;
}

function initializeScores() {
  return {
    player: 0,
    computer: 0,
    roundsCompleted: 1,
    playerMatches: 0,
    computerMatches: 0,
    MatchesPlayed: 1
  };
}

function updateScoresNewMatch(scores) {
  scores.player = 0;
  scores.computer = 0;
  scores.roundsCompleted = 1;
  scores.MatchesPlayed += 1;
}

function joinOr(arr, delimiter  = ', ', end = 'or') {
  if (!arr.length || arr.length === 1) return arr.toString();

  return `${arr.slice(0, arr.length - 1).join(delimiter)} ${end} ${arr.slice(-1)}`;
}

function emptySquares(board) {
  return Object.keys(board).filter(key => board[key] === INITIAL_MARKER);
}

function chooseSquare(board, currentPlayer) {
  if (currentPlayer === 'player') playerChoosesSquare(board);
  if (currentPlayer === 'computer') computerChoosesSquare(board);
}

function alternatePlayer(currentPlayer) {
  return (currentPlayer === 'player') ? 'computer' : 'player';
}

function playerChoosesSquare(board) {
  let square;

  while (true) {
    prompt(`Choose a square: ${joinOr(emptySquares(board))}`);
    square = readline.question().trim();

    if (emptySquares(board).includes(square)) break;
    clearLastLines(3);
    promptError("That's not a valid choice");
  }
  board[square] = HUMAN_MARKER;
}

function findAtRiskSquare(board, marker) {
  for (let line = 0; line < WINNING_LINES.length; line++) {
    // eslint-disable-next-line max-len
    if (!WINNING_LINES[line].some((ele) => board[ele] === INITIAL_MARKER)) continue;

    // eslint-disable-next-line max-len
    let dangerSquare = WINNING_LINES[line].filter((ele) => board[ele] !== marker);
    if (dangerSquare.length === 1 ) return dangerSquare.toString();
  }
  return null;
}

function computerChoosesSquare(board) {
  let computerOffensive = findAtRiskSquare(board, COMPUTER_MARKER);
  let computerDefensive = findAtRiskSquare(board, HUMAN_MARKER);

  if (computerOffensive) {
    board[computerOffensive] = COMPUTER_MARKER;

  } else if (computerDefensive) {
    board[computerDefensive] = COMPUTER_MARKER;

  } else if (board['5'] === INITIAL_MARKER) {
    board['5'] = COMPUTER_MARKER;

  } else {
    let randomIndex = Math.floor(Math.random() * emptySquares(board).length);
    let square = emptySquares(board)[randomIndex];

    board[square] = COMPUTER_MARKER;
  }
}

function detectWinner(board) {

  for (let line = 0; line < WINNING_LINES.length; line++) {
    if (WINNING_LINES[line].every((ele) => board[ele] === HUMAN_MARKER)) return 'player';

    if (WINNING_LINES[line].every((ele) => board[ele] === COMPUTER_MARKER)) return 'computer';
  }
  return null;
}

function boardFull(board) {
  return emptySquares(board).length === 0;
}

function someoneWon(board) {
  return !!detectWinner(board);
}

function displayWinner(board) {
  if (someoneWon(board)) {
    if (detectWinner(board) === 'player') promptWin('You have won the round!\n');
    if (detectWinner(board) === 'computer') promptError('The computer has won the round!\n');
  } else {
    prompt("Its a tie!\n");
  }
}

function updateScores(board, scores) {
  scores[detectWinner(board)] += 1;

  if (!winCheck(scores)) scores.roundsCompleted += 1;
}

function winCountPrint(scores) {
  promptScoreBoard(` ______________________________________`);

  promptScoreBoard(`|           SCOREBOARD                 |`);
  dashBreak();

  promptScoreBoard(`| Match: ${scores.MatchesPlayed}      | Round: ${scores.roundsCompleted}             |`);
  dashBreak();
  promptScoreBoard(`| Match's Won   | Current Rounds Won   |`);
  dashBreak();

  promptScoreBoard(`| User: ${scores.playerMatches}       | User: ${scores.player}              |`);
  promptScoreBoard(`| Computer: ${scores.computerMatches}   | Computer: ${scores.computer}          |`);

  promptScoreBoard(`|_______________|______________________|\n`);
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

function playAgain() {
  playAgainMessage();
  let answer = readline.question().toLowerCase();

  answer = playAgainError(answer);

  return (answer[0] !== 'y');
}

function playNextRound() {
  prompt(`Press enter to play next round`);
  readline.question();
}

function winCheck(scores) {
  return (scores.player === ROUNDS_WIN) || (scores.computer === ROUNDS_WIN);
}

function updateMatches(scores) {
  if (scores.player === ROUNDS_WIN) scores.playerMatches += 1;
  if (scores.computer === ROUNDS_WIN) scores.computerMatches += 1;
}

function winMatchCheck(scores) {
  return (scores.playerMatches === MATCHES_WIN) ||
         (scores.computerMatches === MATCHES_WIN);
}

function winMessage(scores) {
  if (scores.player === ROUNDS_WIN) {
    promptWin(`You are the first to win ${ROUNDS_WIN} rounds, and have won the match!`);
  } else if (scores.computer === ROUNDS_WIN) {
    promptWin(`The Computer was the first to win ${ROUNDS_WIN} rounds, and has won the match!`);
  }
}

function ouputInformation(board, scores) {
  updateScores(board, scores);

  updateMatches(scores);

  displayGameInformation(board,scores);

  displayWinner(board);
}

function winMatchMessage(scores) {
  if (scores.playerMatches === MATCHES_WIN) {
    console.log('');
    promtWinGame(`You are the first to win ${MATCHES_WIN} matches, and have won the game!`);

  } else if (scores.computerMatches === MATCHES_WIN) {
    console.log('');
    promtWinGame(`The Computer was the first to win ${MATCHES_WIN} matches, and has won the game!`);
  }
}

function thankYou() {
  prompt('Thank you for playing!');
}

function matchLoop(scores, currentPlayer) {

  while (true) {

    gameLoop(scores, currentPlayer);

    winMessage(scores);

    if (winMatchCheck(scores)) break;

    if (playAgain()) break;

    updateScoresNewMatch(scores);
  }
}

function gameLoop(scores, currentPlayer) {

  while (true) {
    let board = initializeBoard();

    ticTacToe(board, scores, currentPlayer);

    ouputInformation(board,scores);

    if (winCheck(scores)) break;

    playNextRound();
  }
}

function ticTacToe(board, scores, currentPlayer) {
  while (true) {
    displayGameInformation(board,scores);

    chooseSquare(board, currentPlayer);
    currentPlayer = alternatePlayer(currentPlayer);
    if (someoneWon(board) || boardFull(board)) break;
  }
}

function program() {
  const scores = initializeScores();

  AsciiArt();

  welcomeMessage();

  let currentPlayer = firstMove();

  matchLoop(scores, currentPlayer);

  winMatchMessage(scores);

  thankYou();
}

program();