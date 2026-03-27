// ===== SOPA DE LETRAS =====
const wordSearchLetters = [
    ['H', 'I', 'L', 'L', 'X', 'Q', 'N'],
    ['E', 'A', 'S', 'T', 'E', 'R', 'O'],
    ['J', 'O', 'H', 'A', 'N', 'T', 'R'],
    ['T', 'Y', 'P', 'H', 'O', 'O', 'N'],
    ['F', 'T', 'O', 'N', 'F', 'A', 'H'],
    ['H', 'O', 'W', 'L', 'S', 'A', 'I'],
    ['R', 'Y', 'Z', 'K', 'M', 'P', 'Q']
];

const wordsToFind = ['HILL', 'EASTER', 'JOHAN', 'NORTH', 'TONFAH', 'TYPHOON', 'HOWLSAIRY'];
const foundWords = new Set();
let startCell = null;

function createWordSearchTable() {
    const container = document.getElementById('wordSearchContainer');
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
        color: #28a745;
        padding: 0.5rem;
        background: rgba(40, 167, 69, 0.1);
        border-radius: 5px;
    `;
    statsDiv.textContent = `Palabras encontradas: 0/${wordsToFind.length}`;
    gameWrapper.appendChild(statsDiv);

    const table = document.createElement('table');
    table.style.cssText = `
        margin: 0 auto;
        border-collapse: collapse;
        background: white;
        border: 3px solid #667eea;
        border-radius: 5px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    wordSearchLetters.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((letter, colIndex) => {
            const td = document.createElement('td');
            td.textContent = letter;
            td.style.cssText = `
                width: 40px;
                height: 40px;
                border: 1px solid #ddd;
                text-align: center;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                user-select: none;
                font-size: 1.1rem;
            `;
            td.dataset.row = rowIndex;
            td.dataset.col = colIndex;

            td.addEventListener('mouseenter', function() {
                if (!this.classList.contains('found')) {
                    this.style.background = '#f0f0f0';
                    this.style.transform = 'scale(1.05)';
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

    container.innerHTML = '';
    container.appendChild(gameWrapper);
}

function onWordCellClick(cell) {
    if (cell.classList.contains('found')) return;

    if (!startCell) {
        startCell = cell;
        cell.style.background = '#ffd700';
        cell.style.transform = 'scale(1.1)';
        cell.textContent = cell.textContent + ' ✓';
        showWordSearchStatus('...Busca la última letra');
        return;
    }

    if (cell === startCell) {
        startCell.style.background = '';
        startCell.style.transform = '';
        startCell.textContent = startCell.textContent.replace(' ✓', '');
        startCell = null;
        showWordSearchStatus('Selecciona una palabra');
        return;
    }

    // Buscar palabra desde startCell hasta cell
    const sRow = parseInt(startCell.dataset.row, 10);
    const sCol = parseInt(startCell.dataset.col, 10);
    const eRow = parseInt(cell.dataset.row, 10);
    const eCol = parseInt(cell.dataset.col, 10);

    const path = getCellsBetween(sRow, sCol, eRow, eCol);
    const selectedText = path.map(c => c.textContent.replace(' ✓', '')).join('');
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
                c.textContent = c.textContent.replace(' ✓', '');
                c.style.background = '#8bc34a';
                c.style.color = 'white';
                c.style.fontWeight = '900';
                c.style.transform = 'scale(1.15)';
            }, idx * 50);
        });
        showWordSearchStatus(`✨ ¡Excelente! Encontraste: ${word} (${foundWords.size}/${wordsToFind.length})`);
        updateWordSearchStats();
        
        if (foundWords.size === wordsToFind.length) {
            setTimeout(() => {
                showWordSearchStatus('🎉 ¡GANASTE! ¡Encontraste todas las palabras!');
                document.getElementById('wordSearchStats').style.background = '#28a745';
                document.getElementById('wordSearchStats').style.color = 'white';
            }, 300);
        }
    } else {
        showWordSearchStatus('❌ No es una palabra válida o ya la encontraste.');
    }

    // Reset
    startCell.textContent = startCell.textContent.replace(' ✓', '');
    startCell.style.background = '';
    startCell.style.transform = '';
    startCell = null;
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
            color: #667eea;
            padding: 0.5rem;
            min-height: 1.5rem;
            animation: slideIn 0.3s ease-out;
        `;
        document.getElementById('wordSearchContainer').insertAdjacentElement('afterend', status);
    }
    status.textContent = message;
    status.style.animation = 'none';
    setTimeout(() => { status.style.animation = 'slideIn 0.3s ease-out'; }, 10);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    td.found {
        cursor: not-allowed !important;
    }
`;
document.head.appendChild(style);

createWordSearchTable();
showWordSearchStatus('Selecciona una palabra');

// ===== JUEGO DE PAREJAS =====
const pairs = [
    { name: 'Hill', pair: 'Easter' },
    { name: 'Johan', pair: 'North' },
    { name: 'Tonfah', pair: 'Typhoon' },
    { name: 'Easter', pair: 'Hill' },
    { name: 'North', pair: 'Johan' },
    { name: 'Typhoon', pair: 'Tonfah' }
];

let flipped = [];
let matched = [];
let canFlip = true;
let pairsAttempts = 0;

const gameContainer = document.getElementById('matchingGame');
const shuffledPairs = pairs.sort(() => Math.random() - 0.5);

// Añadir contador de intentos
const pairsStatsDiv = document.createElement('div');
pairsStatsDiv.id = 'pairsStats';
pairsStatsDiv.style.cssText = `
    text-align: center;
    margin-bottom: 1rem;
    font-weight: 700;
    font-size: 1rem;
    color: #667eea;
`;
pairsStatsDiv.textContent = `Intentos: 0 | Parejas encontradas: 0/3`;
gameContainer.insertAdjacentElement('beforebegin', pairsStatsDiv);

shuffledPairs.forEach((pair, index) => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.dataset.index = index;
    card.dataset.name = pair.name;
    card.dataset.pair = pair.pair;
    card.textContent = '?';
    card.style.cssText = `
        width: 100%;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 1.3rem;
        font-weight: bold;
        transition: all 0.3s;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        user-select: none;
    `;

    card.addEventListener('mouseover', function() {
        if (!this.classList.contains('matched')) {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.6)';
        }
    });

    card.addEventListener('mouseleave', function() {
        if (!this.classList.contains('matched') && !flipped.includes(this)) {
            this.style.transform = '';
            this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        }
    });

    card.addEventListener('click', function() {
        if (!canFlip || flipped.length >= 2 || this.classList.contains('matched')) return;

        flipped.push(this);
        this.textContent = this.dataset.name;
        this.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
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
                    card1.style.background = 'linear-gradient(135deg, #8bc34a 0%, #689f38 100%)';
                    card2.style.background = 'linear-gradient(135deg, #8bc34a 0%, #689f38 100%)';
                    card1.style.cursor = 'default';
                    card2.style.cursor = 'default';
                    matched.push(card1.dataset.index, card2.dataset.index);
                    flipped = [];
                    canFlip = true;
                    updatePairsStats();

                    if (matched.length === 6) {
                        document.getElementById('matchStatus').innerHTML = `
                            <span style="font-size: 1.5rem;">🎉 ¡GANASTE!</span><br>
                            <span style="font-size: 0.9rem;">Completado en ${pairsAttempts} intentos</span>
                        `;
                        document.getElementById('matchStatus').style.color = '#28a745';
                    }
                } else {
                    card1.textContent = '?';
                    card2.textContent = '?';
                    card1.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    card2.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    card1.style.transform = '';
                    card2.style.transform = '';
                    flipped = [];
                    canFlip = true;
                    updatePairsStats();
                }
            }, 600);
        }
    });

    gameContainer.appendChild(card);
});

function updatePairsStats() {
    const stats = document.getElementById('pairsStats');
    if (stats) {
        stats.textContent = `Intentos: ${pairsAttempts} | Parejas encontradas: ${matched.length / 2}/3`;
    }
}

// ===== QUIZ DE FAN =====
const quizQuestions = [
    {
        question: '¿Cuál es la pareja principal de la historia?',
        options: ['Hill & Easter', 'Johan & North', 'Tonfah & Typhoon'],
        correct: 0
    },
    {
        question: '¿En dónde se desarrolla la historia?',
        options: ['Tailandia', 'Corea', 'Japón'],
        correct: 0
    },
    {
        question: '¿Cuál es el género literario de la novela?',
        options: ['Terror', 'Romance / BL', 'Ciencia Ficción'],
        correct: 1
    },
    {
        question: '¿Cuántas parejas principales hay en la novela?',
        options: ['2', '3', '4'],
        correct: 1
    },
    {
        question: '¿Cuál es la serie adaptada de la novela?',
        options: ['Forever You (GMM 25)', 'Boys Love Series', 'Thai Drama 2024'],
        correct: 0
    }
];

const quizContainer = document.getElementById('quizContainer');
quizQuestions.forEach((q, index) => {
    const div = document.createElement('div');
    div.style.cssText = `
        margin-bottom: 1.5rem;
        text-align: left;
        padding: 1rem;
        background: rgba(102, 126, 234, 0.08);
        border-left: 4px solid #667eea;
        border-radius: 5px;
    `;

    const question = document.createElement('p');
    question.textContent = `${index + 1}. ${q.question}`;
    question.style.cssText = `
        font-weight: 700;
        margin-bottom: 0.8rem;
        color: #333;
    `;
    div.appendChild(question);

    q.options.forEach((option, optIndex) => {
        const label = document.createElement('label');
        label.style.cssText = `
            display: block;
            margin-bottom: 0.6rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            transition: all 0.2s;
        `;

        label.addEventListener('mouseover', function() {
            this.style.background = 'rgba(102, 126, 234, 0.15)';
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
            label.style.background = 'rgba(40, 167, 69, 0.15)';
        });

        label.appendChild(input);
        label.appendChild(document.createTextNode(option));
        div.appendChild(label);
    });

    quizContainer.appendChild(div);
});

const submitQuizBtn = document.getElementById('submitQuiz');
if (submitQuizBtn) {
    submitQuizBtn.style.cssText = `
        background-color: #667eea !important;
        padding: 12px 30px !important;
        font-size: 1rem !important;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
        transition: all 0.3s !important;
    `;

    submitQuizBtn.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.6)';
    });

    submitQuizBtn.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    });

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
            fanLevel = '¡Eres un SUPERFAN!';
            emoji = '🌟🌟🌟';
        } else if (percentage >= 80) {
            fanLevel = '¡Eres un GRAN Fan!';
            emoji = '⭐⭐';
        } else if (percentage >= 60) {
            fanLevel = '¡Eres Fan!';
            emoji = '⭐';
        } else if (percentage >= 40) {
            fanLevel = 'Te estás familiarizando...';
            emoji = '📚';
        } else {
            fanLevel = 'Apenas comienzas la aventura';
            emoji = '🚀';
        }

        const resultDiv = document.getElementById('quizResult');
        resultDiv.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 2rem;
                border-radius: 10px;
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
            ">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">${emoji}</div>
                <div style="font-size: 3rem; font-weight: 900; margin-bottom: 0.5rem;">${percentage}%</div>
                <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem;">${fanLevel}</div>
                <div style="font-size: 0.95rem; opacity: 0.95;">Acertaste ${score} de ${quizQuestions.length} preguntas</div>
            </div>
        `;
    });
}