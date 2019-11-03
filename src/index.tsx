import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function calculateColRow(n: number): [number, number] {
  return [Math.floor(n / 3) + 1, (n + 1) % 3];
}

function calculateWinner(squares: SquareArray): SquareValue {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

const range = (start: number, stop: number, step = 1): number[] =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

type SquareValue = "O" | "X" | null;
type SquareArray = SquareValue[];

interface SquareProps {
  value: SquareValue;
  onClick: () => void;
}

function Square(props: SquareProps): JSX.Element {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

interface BoardProps {
  squares: SquareArray;
  onClick: (i: number) => void;
}

class Board extends React.Component<BoardProps, {}> {
  renderSquare(i: number): JSX.Element {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={(): void => this.props.onClick(i)}
        key={i}
      />
    );
  }

  render(): JSX.Element {
    return (
      <div>
        {range(0, 3).map(i => (
          <div className="board-row" key={i}>
            {range(0, 3).map(j => this.renderSquare(3 * i + j))}
          </div>
        ))}
      </div>
    );
  }
}

interface HistoryProps {
  history: HistoryData[];
  stepNumber: number;
  jumpTo: (move: number) => void;
  reverseFlag: boolean;
}

class History extends React.Component<HistoryProps, {}> {
  render(): JSX.Element {
    const indexedHistory = this.props.history.map((elem, index): [
      number,
      HistoryData
    ] => [index, elem]);
    if (this.props.reverseFlag) {
      indexedHistory.reverse();
    }
    const moves = indexedHistory.map(elem => {
      const move = elem[0];
      const step = elem[1];
      const desc = move ? `Go to move #${move}` : "Go to game start";
      let location = "";
      if ("number" === typeof step.location) {
        const locTuple = calculateColRow(step.location);
        location = `(${locTuple[0]}, ${locTuple[1]})`;
      }
      const style: React.CSSProperties =
        this.props.stepNumber === move ? { fontWeight: "bold" } : {};
      return (
        <li key={move} style={style}>
          <button onClick={(): void => this.props.jumpTo(move)} style={style}>
            {desc}
          </button>
          {location}
        </li>
      );
    });

    return <ol reversed={this.props.reverseFlag}>{moves}</ol>;
  }
}

interface HistoryData {
  squares: SquareArray;
  location: number | null;
}

interface GameState {
  history: HistoryData[];
  xIsNext: boolean;
  stepNumber: number;
  reverseFlag: boolean;
}

class Game extends React.Component<{}, GameState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          location: null
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      reverseFlag: false
    };
  }

  handleClick(i: number): void {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const squares = history[history.length - 1].squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          location: i
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  handleSort(): void {
    this.setState({ reverseFlag: !this.state.reverseFlag });
  }

  jumpTo(step: number): void {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  render(): JSX.Element {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = `Next player: ${this.state.xIsNext ? "X" : "O"}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i): void => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button onClick={(): void => this.handleSort()}>
              Toggle Order
            </button>
          </div>
          <History
            history={this.state.history}
            stepNumber={this.state.stepNumber}
            jumpTo={(move): void => this.jumpTo(move)}
            reverseFlag={this.state.reverseFlag}
          />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
