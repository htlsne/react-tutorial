import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

type SquareValue = "O" | "X" | null;
type SquareArray = SquareValue[];

interface SquareProps {
  value: SquareValue;
  onClick: () => void;
}

function Square(props: SquareProps) {
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
  renderSquare(i: number) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
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
}

class Game extends React.Component<{}, GameState> {
  constructor() {
    super({});
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          location: null
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i: number) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const squares = history[history.length - 1].squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([{
        squares: squares,
        location: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ? `Go to move #${move}` : "Go to game start";
      let location = '';
      if ('number' === typeof step.location) {
        const loc_tuple = calculateColRow(step.location);
        location = `(${loc_tuple[0]}, ${loc_tuple[1]})`
      }
      const style: React.CSSProperties = this.state.stepNumber == move ? {fontWeight: 'bold'} : {};
      return (
        <li key={move} style={style}>
          <button onClick={() => this.jumpTo(move)} style={style}>{desc}</button>
          {location}
        </li>
      );
    });

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = `Next player: ${this.state.xIsNext ? "X" : "O"}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} onClick={i => this.handleClick(i)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateColRow(n: number): [number, number] {
  return [Math.floor(n / 3) + 1, (n + 1) % 3];
}

function calculateWinner(squares: SquareArray) {
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

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
