import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props){
  //假如有一方获胜，则 line 数组包含三个值（没有获胜则空数组），若当前的 index 值在该数组中，该 button 的 class 值为 win
  let win = props.line.includes(props.index) ? 'winner' : '';
  return (
    <button className={[win, ' square'].join(' ')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function calculateWinner(squares){
  //三连的 squares 数组的 key 组合
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  let datas = [];//这个数组包含游戏进行状态，获胜者，获胜棋子的索引

  for (let i=0; i<lines.length;i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {//当一方棋子满足三连时
      datas['state'] = 'win';
      datas['winner'] = squares[a];
      datas['line'] = lines[i];
      return datas;
    }
  }

  if (!squares.includes(null)) {
    datas['state'] = 'draw';
    datas['winner'] = '-';
    datas['line'] = [];
    return datas;
  }

  datas['state'] = 'going';
  datas['winner'] = '-';
  datas['line'] = [];
  return datas;
}

class Board extends React.Component {
  constructor(props){  
    super(props);
    this.row = 3;//棋盘格子在 x 轴上的数量
    this.column = 3;//棋盘格子在 y 轴上的数量
}  

  //棋盘的每个格子
  renderSquare(i) {
    return <Square
      key={i}
      index={i}
      value={this.props.squares[i]}
      onClick={()=>this.props.onClick(i)}
      line={this.props.line}
    />;
  }

  //嵌套循环构建棋盘
  render() {
    let board = [];

    for (let i=0;i<this.row;i++) {
      let rows = [];
      for (let j=0;j<this.column;j++) {
        let index = i * 3 + j;
        rows.push(this.renderSquare(index));
      }
      board.push(<div key={i} className="board-row">{rows}</div>)
    }

    return (
      <div>{board}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),//棋盘历史的所有状态
        position: null,//棋盘落子的所有坐标
      }],
      stepNumber: 0,//游戏进行的步数
      xIsNext: true,//下回落子的类型 X/O
      order: 'asc',//棋盘历史排序
    };
  }

  handleClick(i){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();//复制一个棋盘传给常量 squares
    const winner = calculateWinner(squares);
    if (winner['state'] === 'win' || winner['state'] === 'draw' || squares[i]) {//一方已经获胜、平局或格子里已经放了棋子
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        position: i,
      }]),
      stepNumber: this.state.stepNumber + 1,
      xIsNext: !this.state.xIsNext,
    });
  }

  //回到历史的某一步
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  //格子的索引转换成坐标
  positionTransform(pos){
    const posMap = ['1,1', '2,1', '3,1', '1,2', '2,2', '2,3', '1,3', '2,3', '3,3'];
    return posMap[pos];
  }

  //改变历史纪录列表的排序
  changeOrder() {
    const order = this.state.order === 'asc' ? 'desc' : 'asc';
    this.setState({
      order: order,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const orderText = this.state.order === 'asc' ? '降序' : '升序';

    const _moves = history.map((step, move) => {//step为循环变量，move为循环索引
      const desc = move ?
        'Go to move #' + move + '/Position:' + this.positionTransform(step.position) :
        'Go to game start';
      const active = this.state.stepNumber === move ? 'active' : '';//当前的历史记录按钮的文字和边框加粗

      return (
        <li key={move}>
          <button className={active} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    //历史记录根据 order 属性重新排序
    let moves = this.state.order === 'asc' ? _moves : _moves.reverse();

    let status;
    let line;
    switch (winner['state']) {
      case 'win':
        status = 'Winner: ' + winner['winner'];
        line = winner['line'];
        break;
      case 'draw':
        status = 'Draw Game';
        line = winner['line'];
        break;
      default:
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        line = [];
        break;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            line={line}
            squares={current.squares}
            onClick={(i)=>this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button onClick={()=>this.changeOrder()}>{orderText}</button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);