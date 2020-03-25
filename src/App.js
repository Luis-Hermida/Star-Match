import React, { Component, useEffect } from "react";
import "./App.css";

// App
class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div>
        <StarMatch />
      </div>
    );
  }
}

const StarMatch = () => {
  const [gameId, setGameId] = React.useState(1);
  return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)} />;
};

// Custom Game Hook
const useGameState = () => {
  const [stars, setStars] = React.useState(utils.random(1, 9));
  const [availableNums, setAvailableNums] = React.useState(utils.range(1, 9));
  const [candidateNums, setCandidateNums] = React.useState([]);
  const [secondsLeft, setSecondsLeft] = React.useState(10);

  useEffect(() => {
    if (secondsLeft > 0 && availableNums.length > 0) {
      const timerId = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  // Conditional to check if the sum of newCandidateNums is different to the total of stars
  // Y - We set our newCandidateNums to the state of candidateNums
  // N - It means that we have a corret match:
  //    1. We create a new array newAvailableNums and we remove those numbers from the state availableNums
  //    2. Remove the candidates from candidateNums
  //    3. We redraw the stars using the array newAvailableNums
  const setGameState = newCandidateNums => {
    if (utils.sum(newCandidateNums) !== stars) {
      setCandidateNums(newCandidateNums);
    } else {
      const newAvailableNums = availableNums.filter(
        n => !newCandidateNums.includes(n)
      );
      setStars(utils.randomSumIn(newAvailableNums, 9));
      setAvailableNums(newAvailableNums);
      setCandidateNums([]);
    }
  };
  return { stars, availableNums, candidateNums, secondsLeft, setGameState };
};

// Game Template
const Game = props => {
  const {
    stars,
    availableNums,
    candidateNums,
    secondsLeft,
    setGameState
  } = useGameState();

  const candidatesAreWrong = utils.sum(candidateNums) > stars;
  const gameStatus =
    availableNums.length === 0 ? "won" : secondsLeft === 0 ? "lost" : "active";
  const numberStatus = number => {
    if (!availableNums.includes(number)) {
      return "used";
    }
    if (candidateNums.includes(number)) {
      return candidatesAreWrong ? "wrong" : "candidate";
    }
    return "available";
  };

  const onNumberClick = (number, currentStatus) => {
    // Logic if the button status is used should be unavailable to click
    if (currentStatus === "used" || gameStatus !== "active") {
      return;
    }

    // We create newCandidateNums and pass the number of the button clicked
    const newCandidateNums =
      currentStatus === "available"
        ? candidateNums.concat(number)
        : candidateNums.filter(n => !n);

    setGameState(newCandidateNums);
  };

  return (
    <div className="game">
      <div className="help">
        Pick 1 or more numbers that sum to the number of stars
      </div>
      <div className="body">
        <div className="left">
          {gameStatus !== "active" ? (
            <PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />
          ) : (
            <StarDisplay count={stars} />
          )}
        </div>
        <div className="right">
          {utils.range(1, 9).map(number => (
            <PlayNumber
              key={number}
              status={numberStatus(number)}
              number={number}
              onClick={onNumberClick}
            />
          ))}
        </div>
      </div>
      <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
};

// PlayNumber
const PlayNumber = props => (
  <button
    onClick={() => props.onClick(props.number, props.status)}
    style={{ backgroundColor: colors[props.status] }}
    className="number"
  >
    {props.number}
  </button>
);

// StarDisplay
const StarDisplay = props => (
  <>
    {utils.range(1, props.count).map(starId => (
      <div key={starId} className="star" />
    ))}
  </>
);

// PlayAgain Button
const PlayAgain = props => (
  <div className="game-done">
    <div
      className="message"
      style={{
        color: props.gameStatus === "lost" ? colors.wrong : colors.used
      }}
    >
      {props.gameStatus === "lost" ? "You lost" : "You won"}
    </div>
    <button onClick={props.onClick}>Play Again</button>
  </div>
);

// Color Theme
const colors = {
  available: "lightgray",
  used: "#AEEA00",
  wrong: "#F44336",
  candidate: "deepskyblue"
};

// Game Logic
const utils = {
  // Sum an array
  sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr, max) => {
    const sets = [[]];
    const sums = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet);
          sums.push(candidateSum);
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)];
  }
};

export default App;
