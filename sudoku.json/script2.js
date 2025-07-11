document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const newGameBtn = document.getElementById('new-game');
    const checkBtn = document.getElementById('check');
    const solveBtn = document.getElementById('solve');
    const difficultySelect = document.getElementById('difficulty');
    const timerDisplay = document.getElementById('time');
    const messageDisplay = document.getElementById('message');

    let selectedCell = null;
    let gameBoard = [];
    let solution = [];
    let startTime = null;
    let timerInterval = null;

    // Initialize the board
    function initializeBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => selectCell(cell, i));
            board.appendChild(cell);
        }
    }

    // Select a cell
    function selectCell(cell, index) {
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
selectedCell = cell;
        cell.classList.add('selected');
        
        // Highlight same numbers
        const value = cell.textContent;
        if (value) {
            document.querySelectorAll('.cell').forEach(c => {
                c.classList.remove('highlighted');
                if (c.textContent === value) {
                    c.classList.add('highlighted');
                }
            });
        }
    }

    // Generate a new Sudoku puzzle
    function generatePuzzle() {
        // Reset timer and message
        clearInterval(timerInterval);
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
        messageDisplay.textContent = '';
        
        // Generate a solved board
        solution = generateSolvedBoard();
        gameBoard = JSON.parse(JSON.stringify(solution));
        
        // Remove numbers based on difficulty
        const difficulty = difficultySelect.value;
        let cellsToRemove = 0;
        
        if (difficulty === 'easy') cellsToRemove = 40;
        else if (difficulty === 'medium') cellsToRemove = 50;
        else cellsToRemove = 60;
removeNumbers(gameBoard, cellsToRemove);
        
        // Display the puzzle
        displayBoard();
    }

    // Generate a solved Sudoku board
    function generateSolvedBoard() {
        const board = Array(9).fill().map(() => Array(9).fill(0));
        fillBoard(board);
        return board;
    }

    // Recursive function to fill the board
    function fillBoard(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of nums) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (fillBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
 // Remove numbers from the board to create a puzzle
    function removeNumbers(board, count) {
        let removed = 0;
        while (removed < count) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                removed++;
            }
        }
    }

    // Display the current board state
    function displayBoard() {
        const cells = document.querySelectorAll('.cell');
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const index = row * 9 + col;
                const cell = cells[index];
                const value = gameBoard[row][col];
                
                cell.textContent = value === 0 ? '' : value;
                cell.className = 'cell';
                
                if (value !== 0) {
                    cell.classList.add('fixed');
                }
                
                if (selectedCell === cell) {
                    cell.classList.add('selected');
                }
            }
        }
    }
    // Check if the current board is valid
    function checkSolution() {
        // Check if the board is complete
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (gameBoard[row][col] === 0) {
                    messageDisplay.textContent = 'The puzzle is not complete yet!';
                    messageDisplay.style.color = '#e74c3c';
                    return;
                }
            }
        }
        
        // Check if the solution is correct
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (gameBoard[row][col] !== solution[row][col]) {
                    messageDisplay.textContent = 'Sorry, there are mistakes!';
                    messageDisplay.style.color = '#e74c3c';
                    return;
                }
            }
        }
        
        // If we get here, the solution is correct
        messageDisplay.textContent = 'Congratulations! You solved the puzzle!';
        messageDisplay.style.color = '#2ecc71';
        clearInterval(timerInterval);
    }
    // Solve the puzzle automatically
    function solvePuzzle() {
        gameBoard = JSON.parse(JSON.stringify(solution));
        displayBoard();
        clearInterval(timerInterval);
        messageDisplay.textContent = 'Puzzle solved!';
        messageDisplay.style.color = '#2ecc71';
    }

    // Update the timer display
    function updateTimer() {
        const currentTime = new Date();
        const elapsed = new Date(currentTime - startTime);
        const minutes = elapsed.getMinutes().toString().padStart(2, '0');
        const seconds = elapsed.getSeconds().toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    // Helper function to check if a number is valid in a position
    function isValid(board, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }
        
        // Check column
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }
  // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                if (board[boxRow + x][boxCol + y] === num) return false;
            }
        }
        
        return true;
    }

    // Helper function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (!selectedCell || selectedCell.classList.contains('fixed')) return;
        
        const index = parseInt(selectedCell.dataset.index);
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        if (e.key >= '1' && e.key <= '9') {
            gameBoard[row][col] = parseInt(e.key);
            selectedCell.textContent = e.key;
               // Check if the number is correct
            if (gameBoard[row][col] !== solution[row][col]) {
                selectedCell.classList.add('error');
            } else {
                selectedCell.classList.remove('error');
            }
        } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            gameBoard[row][col] = 0;
            selectedCell.textContent = '';
            selectedCell.classList.remove('error');
        }
        
        // Highlight same numbers
        const value = selectedCell.textContent;
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('highlighted');
            if (c.textContent === value && value) {
                c.classList.add('highlighted');
            }
        });
    });

    // Initialize the game
    initializeBoard();
    generatePuzzle();

    // Event listeners
    newGameBtn.addEventListener('click', generatePuzzle);
    checkBtn.addEventListener('click', checkSolution);
    solveBtn.addEventListener('click', solvePuzzle);
});
