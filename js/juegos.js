// ===== SOPA DE LETRAS =====
const gridSize = 14;
const wordsToFind = ['HILL', 'EASTER', 'JOHAN', 'NORTH', 'TONFAH', 'TYPHOON', 'ARTHIT', 'DAOTOK', 'TIGER', 'DUENNAO', 'JAYDEN', 'DANNUEA'];
const foundWords = new Set();
let startCell = null;
let wordSearchGrid = [];

function generateWordSearchGrid() {
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const placements = [
        { word: 'EASTER', row: 0, col: 0, dir: 'h' },
        { word: 'JOHAN', row: 0, col: 8, dir: 'h' },
        { word: 'HILL', row: 2, col: 0, dir: 'h' },
        { word: 'NORTH', row: 2, col: 6, dir: 'h' },
        { word: 'TYPHOON', row: 3, col: 4, dir: 'h' },
        { word: 'ARTHIT', row: 4, col: 0, dir: 'h' },
        { word: 'TIGER', row: 5, col: 9, dir: 'h' },
        { word: 'DAOTOK', row: 6, col: 0, dir: 'h' },
        { word: 'JAYDEN', row: 7, col: 6, dir: 'h' },
        { word: 'DUENNAO', row: 8, col: 0, dir: 'h' },
        { word: 'DANNUEA', row: 9, col: 7, dir: 'h' },
        { word: 'TONFAH', row: 10, col: 0, dir: 'h' },
    ];

    placements.forEach(p => {
        for (let i = 0; i < p.word.length; i++) {
            if (p.dir === 'h') {
                grid[p.row][p.col + i] = p.word[i];
            } else {
                grid[p.row + i][p.col] = p.word[i];
            }
        }
    });

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }

    return grid;
}

function createWordSearchTable() {
    const container = document.getElementById('wordSearchContainer');
    if (!container) return;

    wordSearchGrid = generateWordSearchGrid();

    const gameWrapper = document.createElement('div');
    gameWrapper.id = 'wordSearchGame';
    gameWrapper.style.cssText = 'margin: 0 auto; width: fit-content;';

    const statsDiv = document.createElement('div');
    statsDiv.id = 'wordSearchStats';
    statsDiv.style.cssText = `
        text-align: center;
        margin-bottom: 1rem;
        font-weight: 700;
        font-size: 1.1rem;
        color: #ffd700;
        padding: 0.5rem 1rem;
        background: rgba(212, 175, 55, 0.15);
        border-radius: 8px;
        border: 1px solid rgba(212, 175, 55, 0.3);
    `;
    statsDiv.textContent = `Palabras encontradas: 0/${wordsToFind.length}`;
    gameWrapper.appendChild(statsDiv);

    const table = document.createElement('table');
    table.style.cssText = `
        margin: 0 auto;
        border-collapse: collapse;
        background: rgba(255, 248, 220, 0.95);
        border: 3px solid #d4af37;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    wordSearchGrid.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((letter, colIndex) => {
            const td = document.createElement('td');
            td.textContent = letter;
            td.style.cssText = `
                width: 45px;
                height: 45px;
                border: 1px solid rgba(212, 175, 55, 0.4);
                text-align: center;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                user-select: none;
                font-size: 1.4rem;
                color: #4b2e15;
                font-family: 'Poppins', sans-serif;
            `;
            td.dataset.row = rowIndex;
            td.dataset.col = colIndex;

            td.addEventListener('mouseenter', function() {
                if (!this.classList.contains('found')) {
                    this.style.background = 'rgba(212, 175, 55, 0.25)';
                    this.style.transform = 'scale(1.08)';
                }
            });

            td.addEventListener('mouseleave', function() {
                if (!startCell && !this.classList.contains('found')) {
                    this.style.background = '';
                    this.style.transform = '';
                }
            });

            td.addEventListener('click', () => onWordCellClick(td));
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
    gameWrapper.appendChild(table);

    const wordListDiv = document.createElement('div');
    wordListDiv.style.cssText = `
        text-align: center;
        margin-top: 1.5rem;
        font-family: 'Merriweather', serif;
        color: #f5e6c8;
        font-size: 1.2rem;
    `;
    wordListDiv.id = 'wordList';
    wordListDiv.innerHTML = `<strong style="color: #ffd700;">Palabras:</strong> ${wordsToFind.join(' | ')}`;
    gameWrapper.appendChild(wordListDiv);

    container.innerHTML = '';
    container.appendChild(gameWrapper);
}

function onWordCellClick(cell) {
    if (cell.classList.contains('found')) return;

    if (!startCell) {
        startCell = cell;
        cell.style.background = '#d4af37';
        cell.style.color = '#fff';
        cell.style.transform = 'scale(1.1)';
        showWordSearchStatus('Busca la ultima letra...');
        return;
    }

    if (cell === startCell) {
        startCell.style.background = '';
        startCell.style.color = '';
        startCell.style.transform = '';
        startCell = null;
        showWordSearchStatus('Selecciona una palabra');
        return;
    }

    const sRow = parseInt(startCell.dataset.row, 10);
    const sCol = parseInt(startCell.dataset.col, 10);
    const eRow = parseInt(cell.dataset.row, 10);
    const eCol = parseInt(cell.dataset.col, 10);

    const path = getCellsBetween(sRow, sCol, eRow, eCol);
    const selectedText = path.map(c => c.textContent).join('');
    const selectedTextReverse = selectedText.split('').reverse().join('');

    let word = null;
    if (wordsToFind.includes(selectedText)) {
        word = selectedText;
    } else if (wordsToFind.includes(selectedTextReverse)) {
        word = selectedTextReverse;
    }

    if (word && !foundWords.has(word)) {
        foundWords.add(word);
        path.forEach((c, idx) => {
            setTimeout(() => {
                c.classList.add('found');
                c.style.background = '#d4af37';
                c.style.color = '#fff';
                c.style.fontWeight = '900';
                c.style.transform = 'scale(1.08)';
                c.style.boxShadow = '0 0 8px rgba(212, 175, 55, 0.6)';
            }, idx * 50);
        });
        showWordSearchStatus(`Excelente! Encontraste: ${word} (${foundWords.size}/${wordsToFind.length})`);
        updateWordSearchStats();
        updateWordList();

        if (foundWords.size === wordsToFind.length) {
            setTimeout(() => {
                showWordSearchStatus('GANASTE! Encontraste todas las palabras!');
                document.getElementById('wordSearchStats').style.background = 'rgba(212, 175, 55, 0.4)';
            }, 300);
        }
    } else {
        showWordSearchStatus('No es una palabra valida o ya la encontraste.');
    }

    startCell.style.background = '';
    startCell.style.color = '';
    startCell.style.transform = '';
    startCell = null;
}

function updateWordList() {
    const wordListDiv = document.getElementById('wordList');
    if (wordListDiv) {
        const displayWords = wordsToFind.map(w => {
            if (foundWords.has(w)) {
                return `<span style="color: #d4af37; text-decoration: line-through;">${w}</span>`;
            }
            return w;
        });
        wordListDiv.innerHTML = `<strong style="color: #ffd700;">Palabras:</strong> ${displayWords.join(' | ')}`;
    }
}

function getCellsBetween(sRow, sCol, eRow, eCol) {
    const cells = [];
    const dRow = eRow - sRow;
    const dCol = eCol - sCol;

    const stepRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
    const stepCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);

    const isStraight = sRow === eRow || sCol === eCol || Math.abs(dRow) === Math.abs(dCol);
    if (!isStraight) {
        return [startCell, document.querySelector(`td[data-row="${eRow}"][data-col="${eCol}"]`)];
    }

    let row = sRow;
    let col = sCol;
    while (true) {
        const cell = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
        if (cell) cells.push(cell);
        if (row === eRow && col === eCol) break;
        row += stepRow;
        col += stepCol;
    }
    return cells;
}

function updateWordSearchStats() {
    const stats = document.getElementById('wordSearchStats');
    if (stats) {
        stats.textContent = `Palabras encontradas: ${foundWords.size}/${wordsToFind.length}`;
    }
}

function showWordSearchStatus(message) {
    let status = document.getElementById('wordSearchStatus');
    if (!status) {
        status = document.createElement('p');
        status.id = 'wordSearchStatus';
        status.style.cssText = `
            text-align: center;
            margin-top: 1rem;
            font-weight: 700;
            font-size: 1rem;
            color: #ffd700;
            padding: 0.5rem;
            min-height: 1.5rem;
            font-family: 'Merriweather', serif;
        `;
        document.getElementById('wordSearchContainer').insertAdjacentElement('afterend', status);
    }
    status.textContent = message;
}

createWordSearchTable();
showWordSearchStatus('Selecciona una palabra');

// ===== JUEGO DE PAREJAS POR NIVELES =====
const allPairs = [
    { name: 'Hill', pair: 'Easter' },
    { name: 'Easter', pair: 'Hill' },
    { name: 'Johan', pair: 'North' },
    { name: 'North', pair: 'Johan' },
    { name: 'Tonfah', pair: 'Typhoon' },
    { name: 'Typhoon', pair: 'Tonfah' },
    { name: 'Arthit', pair: 'Daotok' },
    { name: 'Daotok', pair: 'Arthit' },
    { name: 'Tiger', pair: 'DuenNao' },
    { name: 'DuenNao', pair: 'Tiger' },
    { name: 'Jayden', pair: 'DanNuea' },
    { name: 'DanNuea', pair: 'Jayden' },
    { name: 'Phoon', pair: 'Fa' },
    { name: 'Fa', pair: 'Phoon' }
];

const levels = [
    { pairs: 3, grid: 'repeat(3, 1fr)', label: 'Nivel 1 - Facil' },
    { pairs: 4, grid: 'repeat(4, 1fr)', label: 'Nivel 2 - Normal' },
    { pairs: 5, grid: 'repeat(5, 1fr)', label: 'Nivel 3 - Intermedio' },
    { pairs: 6, grid: 'repeat(4, 1fr)', label: 'Nivel 4 - Dificil' },
    { pairs: 7, grid: 'repeat(7, 1fr)', label: 'Nivel 5 - Experto' }
];

let currentLevel = 0;
let flipped = [];
let matched = [];
let canFlip = true;
let pairsAttempts = 0;

const gameContainer = document.getElementById('matchingGame');

function startLevel(levelIndex) {
    if (levelIndex >= levels.length) {
        showFinalResult();
        return;
    }

    currentLevel = levelIndex;
    const level = levels[levelIndex];
    const pairsNeeded = level.pairs * 2;
    const levelPairs = allPairs.slice(0, pairsNeeded);
    const shuffledPairs = levelPairs.sort(() => Math.random() - 0.5);

    flipped = [];
    matched = [];
    canFlip = true;
    pairsAttempts = 0;

    gameContainer.innerHTML = '';
    gameContainer.style.gridTemplateColumns = level.grid;
    gameContainer.style.maxWidth = level.pairs <= 5 ? '500px' : '550px';

    const levelInfo = document.createElement('div');
    levelInfo.id = 'levelInfo';
    levelInfo.style.cssText = `
        text-align: center;
        margin-bottom: 1rem;
        font-weight: 700;
        font-size: 1.2rem;
        color: #ffd700;
        font-family: 'Pirata One', cursive;
    `;
    levelInfo.textContent = `${level.label} (${level.pairs} parejas)`;

    const pairsStatsDiv = document.createElement('div');
    pairsStatsDiv.id = 'pairsStats';
    pairsStatsDiv.style.cssText = `
        text-align: center;
        margin-bottom: 1rem;
        font-weight: 700;
        font-size: 1rem;
        color: #f5e6c8;
        font-family: 'Merriweather', serif;
    `;
    pairsStatsDiv.textContent = `Intentos: 0 | Parejas: 0/${level.pairs}`;

    const matchStatus = document.getElementById('matchStatus');
    if (matchStatus) matchStatus.textContent = '';

    gameContainer.insertAdjacentElement('beforebegin', pairsStatsDiv);
    gameContainer.insertAdjacentElement('beforebegin', levelInfo);

    shuffledPairs.forEach((pair, index) => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.dataset.index = index;
        card.dataset.name = pair.name;
        card.dataset.pair = pair.pair;
        card.textContent = '?';
        card.style.cssText = `
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #8B6914 0%, #654321 100%);
            color: #ffd700;
            border: 2px solid #d4af37;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1.2rem;
            font-weight: bold;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 55px;
            user-select: none;
            font-family: 'Poppins', sans-serif;
        `;

        card.addEventListener('mouseover', function() {
            if (!this.classList.contains('matched')) {
                this.style.transform = 'translateY(-4px)';
                this.style.boxShadow = '0 6px 16px rgba(212, 175, 55, 0.5)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('matched') && !flipped.includes(this)) {
                this.style.transform = '';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }
        });

        card.addEventListener('click', function() {
            if (!canFlip || flipped.length >= 2 || this.classList.contains('matched')) return;

            flipped.push(this);
            this.textContent = this.dataset.name;
            this.style.background = 'linear-gradient(135deg, #d4af37 0%, #8B6914 100%)';
            this.style.color = '#fff';
            this.style.transform = 'scale(1.05)';

            if (flipped.length === 2) {
                pairsAttempts++;
                canFlip = false;
                setTimeout(() => {
                    const [card1, card2] = flipped;
                    const isMatch = card1.dataset.pair === card2.dataset.name && card2.dataset.pair === card1.dataset.name;

                    if (isMatch) {
                        card1.classList.add('matched');
                        card2.classList.add('matched');
                        card1.style.background = 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)';
                        card2.style.background = 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)';
                        card1.style.cursor = 'default';
                        card2.style.cursor = 'default';
                        card1.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.6)';
                        card2.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.6)';
                        matched.push(card1.dataset.index, card2.dataset.index);
                        flipped = [];
                        canFlip = true;
                        updatePairsStats(level.pairs);

                        if (matched.length === level.pairs * 2) {
                            setTimeout(() => {
                                showLevelComplete(level, levelIndex);
                            }, 500);
                        }
                    } else {
                        card1.textContent = '?';
                        card2.textContent = '?';
                        card1.style.background = 'linear-gradient(135deg, #8B6914 0%, #654321 100%)';
                        card2.style.background = 'linear-gradient(135deg, #8B6914 0%, #654321 100%)';
                        card1.style.color = '#ffd700';
                        card2.style.color = '#ffd700';
                        card1.style.transform = '';
                        card2.style.transform = '';
                        flipped = [];
                        canFlip = true;
                        updatePairsStats(level.pairs);
                    }
                }, 600);
            }
        });

        gameContainer.appendChild(card);
    });
}

function updatePairsStats(totalPairs) {
    const stats = document.getElementById('pairsStats');
    if (stats) {
        stats.textContent = `Intentos: ${pairsAttempts} | Parejas: ${matched.length / 2}/${totalPairs}`;
    }
}

function showLevelComplete(level, levelIndex) {
    const matchStatus = document.getElementById('matchStatus');
    if (matchStatus) {
        matchStatus.innerHTML = `
            <span style="font-size: 1.5rem; color: #ffd700;">${level.label} COMPLETADO!</span><br>
            <span style="font-size: 0.9rem; color: #f5e6c8;">Completado en ${pairsAttempts} intentos</span>
        `;
    }

    setTimeout(() => {
        const oldInfo = document.getElementById('levelInfo');
        const oldStats = document.getElementById('pairsStats');
        if (oldInfo) oldInfo.remove();
        if (oldStats) oldStats.remove();
        startLevel(levelIndex + 1);
    }, 2000);
}

function showFinalResult() {
    const matchStatus = document.getElementById('matchStatus');
    if (matchStatus) {
        matchStatus.innerHTML = `
            <span style="font-size: 1.8rem; color: #ffd700;">FELICIDADES!</span><br>
            <span style="font-size: 1rem; color: #f5e6c8;">Completaste los 5 niveles!</span>
        `;
    }

    gameContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: #ffd700; font-family: 'Pirata One', cursive;">
                TODOS LOS NIVELES COMPLETADOS!
            </div>
            <button onclick="resetPairsGame()" class="btn-custom" style="margin-top: 1rem;">
                Jugar de nuevo
            </button>
        </div>
    `;
}

function resetPairsGame() {
    currentLevel = 0;
    const oldInfo = document.getElementById('levelInfo');
    const oldStats = document.getElementById('pairsStats');
    if (oldInfo) oldInfo.remove();
    if (oldStats) oldStats.remove();
    const matchStatus = document.getElementById('matchStatus');
    if (matchStatus) matchStatus.textContent = '';
    startLevel(0);
}

if (gameContainer) {
    startLevel(0);
}

// ===== QUIZ DE FAN =====
const quizQuestions = [
    {
        question: 'Cual es la pareja principal de la historia?',
        options: ['Hill & Easter', 'Johan & North', 'Tonfah & Typhoon'],
        correct: 0
    },
    {
        question: 'En donde se desarrolla la historia?',
        options: ['Tailandia', 'Corea', 'Japon'],
        correct: 0
    },
    {
        question: 'Cual es el genero literario de la novela?',
        options: ['Terror', 'Romance / BL', 'Ciencia Ficcion'],
        correct: 1
    },
    {
        question: 'Cuantas parejas principales hay en la novela?',
        options: ['2', '4', '6'],
        correct: 2
    },
    {
        question: 'Cual es la serie adaptada de la novela?',
        options: ['Forever You (GMM 25)', 'Boys Love Series', 'Thai Drama 2024'],
        correct: 0
    }
];

const quizContainer = document.getElementById('quizContainer');
if (quizContainer) {
    quizQuestions.forEach((q, index) => {
        const div = document.createElement('div');
        div.style.cssText = `
            margin-bottom: 1.5rem;
            text-align: left;
            padding: 1rem;
            background: rgba(212, 175, 55, 0.1);
            border-left: 4px solid #d4af37;
            border-radius: 8px;
            position: relative;
            z-index: 1;
        `;

        const question = document.createElement('p');
        question.textContent = `${index + 1}. ${q.question}`;
        question.style.cssText = `
            font-weight: 700;
            margin-bottom: 0.8rem;
            color: #ffd700;
            font-family: 'Poppins', sans-serif;
        `;
        div.appendChild(question);

        q.options.forEach((option, optIndex) => {
            const label = document.createElement('label');
            label.style.cssText = `
                display: block;
                margin-bottom: 0.6rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 6px;
                transition: all 0.2s;
                color: #f5e6c8;
                font-family: 'Merriweather', serif;
            `;

            label.addEventListener('mouseover', function() {
                this.style.background = 'rgba(212, 175, 55, 0.15)';
            });

            label.addEventListener('mouseleave', function() {
                if (!this.querySelector('input').checked) {
                    this.style.background = '';
                }
            });

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question${index}`;
            input.value = optIndex;
            input.style.marginRight = '0.7rem';
            input.style.cursor = 'pointer';

            input.addEventListener('change', function() {
                const allLabels = label.parentElement.querySelectorAll('label');
                allLabels.forEach(l => l.style.background = '');
                label.style.background = 'rgba(212, 175, 55, 0.25)';
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            div.appendChild(label);
        });

        quizContainer.appendChild(div);
    });
}

const submitQuizBtn = document.getElementById('submitQuiz');
if (submitQuizBtn) {
    submitQuizBtn.addEventListener('click', function() {
        let score = 0;
        quizQuestions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="question${index}"]:checked`);
            if (selected && parseInt(selected.value, 10) === q.correct) {
                score++;
            }
        });

        const percentage = Math.round((score / quizQuestions.length) * 100);
        let fanLevel = '';
        let emoji = '';

        if (percentage === 100) {
            fanLevel = 'Eres un SUPERFAN!';
            emoji = '***';
        } else if (percentage >= 80) {
            fanLevel = 'Eres un GRAN Fan!';
            emoji = '**';
        } else if (percentage >= 60) {
            fanLevel = 'Eres Fan!';
            emoji = '*';
        } else if (percentage >= 40) {
            fanLevel = 'Te estas familiarizando...';
        } else {
            fanLevel = 'Apenas comienzas la aventura';
        }

        const resultDiv = document.getElementById('quizResult');
        resultDiv.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(139, 90, 43, 0.8), rgba(101, 67, 33, 0.85));
                color: white;
                padding: 2rem;
                border-radius: 12px;
                border: 2px solid #d4af37;
                box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
            ">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">${emoji}</div>
                <div style="font-size: 3rem; font-weight: 900; margin-bottom: 0.5rem; color: #ffd700;">${percentage}%</div>
                <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem; color: #ffd700;">${fanLevel}</div>
                <div style="font-size: 0.95rem; opacity: 0.9; color: #f5e6c8;">Acertaste ${score} de ${quizQuestions.length} preguntas</div>
            </div>
        `;
    });
}
