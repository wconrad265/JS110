const readline = require('readline-sync');
const INITIAL_MARKER = ' ';
const HUMAN_MARKER = 'X';
const COMPUTER_MARKER = 'O';
const ROUNDS_WIN = 5;

const prompt = (msg) => console.log('\x1b[37m%s\x1b[0m', `=> ${msg}`);
const promptError = (msg) => console.log('\x1b[31m%s\x1b[0m', `=> ${msg}`);
const promptScoreBoard = (msg) => console.log('\x1b[36m%s\x1b[0m', `=> ${msg}`);
const promptWin = (msg) => console.log('\x1b[33m%s\x1b[0m', `=> ${msg}`);
const promptWinRound = (msg) => console.log('\x1b[34m%s\x1b[0m', `=> ${msg}`);
const dashBreak = () => promptScoreBoard('--------------------------------------------------------------------------------');

function clearLastLines(count) {
  process.stdout.moveCursor(0, -count);
  process.stdout.clearScreenDown();
}

function welcomeMessage() {
  prompt(`Welcome to tic, tac, toe, the first one to win ${ROUNDS_WIN} rounds wins the match!, wins!\n`);
}

function displayBoard(board, scores) {
  console.clear();

  winCountNotZero(scores);
  if (scores.roundsCompleted === 0) welcomeMessage();

  prompt(`You are ${HUMAN_MARKER}. Computer is ${COMPUTER_MARKER}`);

  console.log('');

  console.log('');
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

  for (let square = 1; square <= 9; square++){
    board[String(square)] = INITIAL_MARKER;
  }

  return board;
}

function initializeScores() {
 
  return {
    player: 0,
    computer: 0,
    roundsCompleted: 0
  };

}
function joinOr(arr, delimiter  = ', ', end = 'or') {
  if (!arr.length || arr.length === 1) return arr.toString();

  return `${arr.slice(0, arr.length - 1).join(delimiter)} ${end} ${arr.slice(-1)}` ;
}

function emptySquares(board) {
  return Object.keys(board).filter(key => board[key] === INITIAL_MARKER);
}

function playerChoosesSquare(board){
  let sqaure;

  while (true) {
    prompt(`Choose a square: ${joinOr(emptySquares(board))}`);
    square = readline.question().trim();

    if (emptySquares(board).includes(square)) break;
    clearLastLines(3);
    promptError("That's not a valid choice");
    
  }
  
  board[square] = HUMAN_MARKER
}

function computerChoosesSquare(board) {
  let randomIndex = Math.floor(Math.random() * emptySquares(board).length);
  let square = emptySquares(board)[randomIndex];

  board[square] = COMPUTER_MARKER;
}

function detectWinner(board) {
  let winningLines = [
    [1, 2, 3], [4, 5, 6], [7, 8, 9], // rows
    [1, 4, 7], [2, 5, 8], [3, 6, 9], // columns
    [1, 5, 9], [3, 5, 7]             // diagonals
  ];

  for (let line = 0; line < winningLines.length; line++) {
    let [sq1, sq2, sq3] = winningLines[line];

    if (
      board[sq1] === HUMAN_MARKER &&
      board[sq2] === HUMAN_MARKER &&
      board[sq3] === HUMAN_MARKER
    ) {
      return 'player';
    } else if (
      board[sq1] === COMPUTER_MARKER &&
      board[sq2] === COMPUTER_MARKER &&
      board[sq3] === COMPUTER_MARKER
      ) {
      return 'computer';
      }
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
    if (detectWinner(board) === 'player') promptWinRound('You have won the round!\n')
    if (detectWinner(board) === 'computer') promptWinRound('The computer has won the round!\n')
  } else {
    prompt("Its a tie!\n")
  }
}

function updateScores(board, scores) {
  scores[detectWinner(board)] += 1;
  scores.roundsCompleted += 1;
}

function winCountNotZero(scores) {
  if (scores.roundsCompleted !== 0) winCountPrint(scores);
}

function winCountPrint(scores) {
  dashBreak();

  promptScoreBoard(`SCOREBOARD: Round ${scores.roundsCompleted} `);

  dashBreak();

  promptScoreBoard(`User: ${scores.player}`);

  promptScoreBoard(`Computer: ${scores.computer}`);

  dashBreak();
}

function playAgainMessage () {
  prompt('Do you want to play again (y/n)');
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

function winCheck(scores) {
  return (scores.player === ROUNDS_WIN) || (scores.computer === ROUNDS_WIN);
}

function winMessage(scores) {
  if (scores.player === ROUNDS_WIN) {
    promptWin(`You are the first to win ${ROUNDS_WIN} rounds, and have won the match!`);
  } else if (scores.computer === ROUNDS_WIN) {
    promptWin(`The Computer was the first to win ${ROUNDS_WIN} times, and has won the match!`);
  }
}

function ticTacToe(board, scores) {
  while (true) {

    displayBoard(board, scores);

    playerChoosesSquare(board);
    if (someoneWon(board) || boardFull(board)) break;

    computerChoosesSquare(board);
    if (someoneWon(board) || boardFull(board)) break;

    displayBoard(board, scores);
  }
}

function ouputInformation(board, scores) {
  updateScores(board, scores);

  displayBoard(board, scores);

  displayWinner(board);
}

function gameLoop () {
  const scores = initializeScores();

  welcomeMessage();

  while (true) {
    let board = initializeBoard();

    ticTacToe(board,scores);

    ouputInformation(board,scores);

    if (winCheck(scores)) break;

    if(playAgain()) break;
  }

  winMessage(scores);
  
  prompt('Thanks for playing Tic Tac Toe!');
}

gameLoop();