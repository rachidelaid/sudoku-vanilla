const brd = document.getElementById('board');
const options = document.getElementById('options');

let dif = 'easy';
const curBox = [0, 0];
let board;
let newBoard;

const encodeBoard = b =>
  b.reduce(
    (result, row, i) =>
      result +
      `%5B${encodeURIComponent(row)}%5D${i === b.length - 1 ? '' : '%2C'}`,
    ''
  );

const encodeParams = params =>
  Object.keys(params)
    .map(key => key + '=' + `%5B${encodeBoard(params[key])}%5D`)
    .join('&');

async function solve() {
  const resp = await fetch('https://sugoku.herokuapp.com/solve', {
    method: 'POST',
    body: encodeParams({ newBoard }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const data = await resp.json();
  newBoard = data.solution;
  renderTable();
}

async function grade() {
  const resp = await fetch('https://sugoku.herokuapp.com/validate', {
    method: 'POST',
    body: encodeParams({ newBoard }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const data = await resp.json();

  console.log(data);

  return data;
}

async function getBoard() {
  const resp = await fetch(
    'https://sugoku.herokuapp.com/board?difficulty=' + dif
  );
  const data = await resp.json();

  return data.board;
}

async function renderTable() {
  brd.innerHTML = '';
  if (newBoard === undefined) {
    board = await getBoard();
    newBoard = [
      [...board[0]],
      [...board[1]],
      [...board[2]],
      [...board[3]],
      [...board[4]],
      [...board[5]],
      [...board[6]],
      [...board[7]],
      [...board[8]],
    ];
  }

  for (let i = 0; i < newBoard.length; i++) {
    const row = newBoard[i];

    for (let j = 0; j < row.length; j++) {
      const box = row[j];

      const div = document.createElement('div');

      let clss = 'flex flex-jc-c flex-ln-c';
      clss += box == 0 ? ' empty' : '';

      if (newBoard[i][j] != board[i][j]) {
        clss += ' mine';
      } else {
        clss.replace('mine', '');
      }

      div.className = clss;

      div.textContent = box == 0 ? '' : box;

      brd.appendChild(div);
      div.addEventListener('click', () => {
        if (!div.className.includes('empty')) return;

        curBox[0] = i;
        curBox[1] = j;

        options.style.display = 'flex';
      });
    }
  }
}

renderTable();

document.querySelectorAll('.content p').forEach(elm => {
  elm.addEventListener('click', () => {
    const num = Number(elm.textContent);

    newBoard[curBox[0]][curBox[1]] = num;

    options.style.display = 'none';
    renderTable();
  });
});

document.querySelector('button').addEventListener('click', async () => {
  // await solve();
  const { status } = await grade();

  options.style.display = 'flex';
  options.querySelector('div').innerHTML = `<h4>${status}</h4>`;
});

document.querySelectorAll('.difficulty div').forEach(df => {
  df.addEventListener('click', () => {
    if (df.className.includes('active')) return;

    document.querySelectorAll('.difficulty div').forEach(x => {
      x.classList.remove('active');
    });

    dif = df.textContent;
    df.classList.add('active');
    board = undefined;
    newBoard = undefined;
    renderTable();
  });
});
