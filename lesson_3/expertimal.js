/*
  Problem:
    Input:
      - 3 arguments
        - array
        - deliminator between words
        - what goes between the last two elements
    Output
      - joined string with above arguments
    
    Rules Questions?
      - What happens when array is blank?
        - return an empty string
      - What happens if there is only one element?
        - return the single element
      - What happens if there is 2 elements?
        - return the two elements with or between them
      - What does the second argument do?
        - it is what is between each argument when it is speraterd(delimeter)
          - ', ' = > 1, 2, or 3, 
          - '; ' => 1; 2; or 3;
        - What happens if second argument is blank?
          - it defaults to a comma ,
      - What happens if third argument is blank?
        - or is put between the last two elements

  Test Cases
    - All information is provided
  
  Data Strucutre
    - we will be first working with arrays

  Algo
    - create function
    - set default parameters value
    - second argument = ', '
    - thrid argument = 'or '
    - if arr.length === 0
      - return empty string
    - if array element === 1
      - return the one element as a string
    - sepearate the array removing the last element
      - set lastWord to removed element
      - join array together with second argument (will use default is blank)
    - concat the transformed array with removed element with third argument
    - returned string

*/

function joinOr(arr, delimiter  = ', ', end = 'or') {
  if (!arr.length || arr.length === 1) return arr.toString();

  return `${arr.slice(0, arr.length - 1).join(delimiter)} ${end} ${arr.slice(-1)}` ;
}

console.log(joinOr([1, 2, 3]));               // => "1, 2, or 3"
console.log(joinOr([1, 2, 3], '; '));         // => "1; 2; or 3"
console.log(joinOr([1, 2, 3], ', ', 'and'));  // => "1, 2, and 3"
console.log(joinOr([]));                      // => ""
console.log(joinOr([5]));                     // => "5"
console.log(joinOr([1, 2]));                  // => "1 or 2"
console.log(joinOr([1, 2], 'X ', 'and'));                // => "1 or 2"



/* 
  - create function to create object for keeping score
    - do not reset object everytime
  - use return value of detect winner to update score
    - update rounds at the same time
  - print the current score every time
  - if obj.player or obj.computer === 5
    - print computer has won best of three

/*

/*
  - Need to get possible winning combos for human
  - If humanMarker is on 2 of possible winning combos, computer needs to choose other option
    - if all 3 tiles are not empty, skip this iteration
  - else computer needs to choose 



  - Need to create scoreboard that shows matches 
    - a match is the first person to 5 games
    - best out of 3 for matches
  - When one person reaches 5 wins
    - output that that person has won the match
    - update the scores.player, scores.computer & scores.roundsPlayed to 0
    - increase scores.playerMatches or scores.comptuerMatches to 1
    - ask the player if they would want to play another match
  - When one person reaches 2 match wins
    - output, they have won the match
*/