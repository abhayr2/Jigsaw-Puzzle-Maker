document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const difficultySelect = document.getElementById('difficulty');
    const startBtn = document.getElementById('start-btn');
    const puzzleBoard = document.getElementById('puzzle-board');
    const piecesContainer = document.getElementById('pieces-container');
    const previewArea = document.getElementById('preview-area');
    const imagePreview = document.getElementById('image-preview');

    let imageUrl = null;
    let puzzleDimensions = {};
    const pieceSize = 50; // Each piece will be 50x50 pixels

    // Difficulty levels mapped to grid dimensions [columns, rows]
    const difficultyMap = {
        5: [5, 1],
        20: [5, 4],
        40: [8, 5],
        80: [10, 8],
        100: [10, 10],
    };

    // --- EVENT LISTENERS ---

    // Handle image upload and display preview
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imageUrl = event.target.result;
                imagePreview.src = imageUrl;
                previewArea.classList.remove('hidden');
                startBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });

    // Start the puzzle creation process
    startBtn.addEventListener('click', createPuzzle);

    // --- CORE FUNCTIONS ---

    function createPuzzle() {
        if (!imageUrl) {
            alert('Please upload an image first!');
            return;
        }

        // Clear previous puzzle
        puzzleBoard.innerHTML = '';
        piecesContainer.innerHTML = '';
        
        // Get selected difficulty
        const difficulty = difficultySelect.value;
        const [cols, rows] = difficultyMap[difficulty];
        const totalPieces = cols * rows;

        puzzleDimensions = { cols, rows, totalPieces, width: cols * pieceSize, height: rows * pieceSize };

        // Setup puzzle board grid and size
        puzzleBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        puzzleBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        puzzleBoard.style.width = `${puzzleDimensions.width}px`;
        puzzleBoard.style.height = `${puzzleDimensions.height}px`;

        const pieces = [];
        
        for (let i = 0; i < totalPieces; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Create puzzle piece
            const piece = document.createElement('div');
            piece.id = `piece-${i}`;
            piece.classList.add('puzzle-piece');
            piece.draggable = true;
            piece.style.width = `${pieceSize}px`;
            piece.style.height = `${pieceSize}px`;
            piece.style.backgroundImage = `url(${imageUrl})`;
            piece.style.backgroundSize = `${puzzleDimensions.width}px ${puzzleDimensions.height}px`;
            piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
            piece.dataset.correctIndex = i;
            pieces.push(piece);

            // Create corresponding slot on the board
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot');
            slot.dataset.index = i;
            puzzleBoard.appendChild(slot);
        }

        // Shuffle and display pieces
        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach(p => piecesContainer.appendChild(p));
        
        addDragAndDropListeners();
    }

    function addDragAndDropListeners() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        const slots = document.querySelectorAll('.puzzle-slot');

        pieces.forEach(piece => {
            piece.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
                setTimeout(() => e.target.classList.add('hidden'), 0);
            });
            piece.addEventListener('dragend', (e) => {
                e.target.classList.remove('hidden');
            });
        });

        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.target.classList.add('drag-over');
            });
            slot.addEventListener('dragleave', (e) => {
                e.target.classList.remove('drag-over');
            });
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                e.target.classList.remove('drag-over');

                const pieceId = e.dataTransfer.getData('text/plain');
                const droppedPiece = document.getElementById(pieceId);

                // Only allow dropping in an empty slot
                if (e.target.classList.contains('puzzle-slot') && e.target.childElementCount === 0) {
                    e.target.appendChild(droppedPiece);
                    checkCompletion();
                }
            });
        });
    }

    function checkCompletion() {
        const slots = document.querySelectorAll('.puzzle-slot');
        let isComplete = true;

        slots.forEach(slot => {
            const piece = slot.querySelector('.puzzle-piece');
            if (!piece || piece.dataset.correctIndex !== slot.dataset.index) {
                isComplete = false;
            }
        });

        if (isComplete) {
            setTimeout(() => alert('Congratulations! You solved the puzzle! 🎉'), 100);
            puzzleBoard.style.border = '2px solid #28a745'; // Green border on win
        }
    }
    
    // Disable start button initially
    startBtn.disabled = true;
});