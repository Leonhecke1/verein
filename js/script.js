document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const playerNameInput = document.getElementById('player-name');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerListUl = document.getElementById('player-list');
    const playerCountBadge = document.getElementById('player-count-badge');
    const generateTablesBtn = document.getElementById('generate-tables-btn');
    const tablesContainer = document.getElementById('tables-container');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const shareBtn = document.getElementById('share-btn');
    const exportSection = document.getElementById('export-section');
    const resetAppBtn = document.getElementById('reset-app-btn');

    // --- State ---
    const STORAGE_KEY = 'magicTurnierPlayers';
    let players = [];
    let tables = [];

    // --- Functions ---

    /**
     * Saves the current players array to localStorage.
     */
    const savePlayers = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    };

    /**
     * Loads players from localStorage on initial page load.
     */
    const loadPlayers = () => {
        const storedPlayers = localStorage.getItem(STORAGE_KEY);
        if (storedPlayers) {
            players = JSON.parse(storedPlayers);
        }
    };

    /**
     * Renders the current list of players to the DOM using Bootstrap components.
     */
    const renderPlayers = () => {
        playerListUl.innerHTML = '';
        if (players.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted';
            li.textContent = 'Noch keine Spieler hinzugefügt.';
            playerListUl.appendChild(li);
        } else {
            players.forEach((player, index) => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = player;

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-player';
                removeBtn.dataset.index = index;
                removeBtn.innerHTML = '<i class="bi bi-trash-fill"></i>';
                
                li.appendChild(removeBtn);
                playerListUl.appendChild(li);
            });
        }
        playerCountBadge.textContent = `${players.length} Spieler`;
    };

    /**
     * Adds a new player to the list and saves to storage.
     */
    const addPlayer = () => {
        const name = playerNameInput.value.trim();
        if (name) {
            players.push(name);
            savePlayers();
            renderPlayers();
            playerNameInput.value = '';
            playerNameInput.focus();
        }
    };

    /**
     * Removes a player from the list and saves to storage.
     * @param {number} index The index of the player to remove.
     */
    const removePlayer = (index) => {
        players.splice(index, 1);
        savePlayers();
        renderPlayers();
    };

    /**
     * Resets the entire application to its initial state.
     */
    const resetApp = () => {
        if (confirm('Sind Sie sicher, dass Sie alle Spieler und Tische löschen möchten?')) {
            players = [];
            tables = [];
            localStorage.removeItem(STORAGE_KEY);
            renderPlayers();
            renderTables([]); // Pass empty array to clear and hide tables
        }
    };

    /**
     * Shuffles an array in place.
     * @param {Array} array The array to shuffle.
     */
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    /**
     * Calculates the optimal table distribution and generates the tables.
     */
    const generateTables = () => {
        const n = players.length;
        if (n < 3) {
            alert('Nicht genügend Spieler für eine sinnvolle Tischverteilung (mindestens 3 benötigt).');
            return;
        }

        let numFours = 0;
        let numThrees = 0;
        let found = false;

        for (let y = Math.floor(n / 4); y >= 0; y--) {
            const remainder = n - y * 4;
            if (remainder % 3 === 0) {
                numFours = y;
                numThrees = remainder / 3;
                found = true;
                break;
            }
        }

        if (!found) {
            alert(`Mit ${n} Spielern ist leider keine Aufteilung in 3er oder 4er Tische möglich (z.B. bei 5 Spielern).`);
            return;
        }

        const shuffledPlayers = [...players];
        shuffleArray(shuffledPlayers);

        tables = [];
        let playerIndex = 0;

        for (let i = 0; i < numFours; i++) {
            tables.push(shuffledPlayers.slice(playerIndex, playerIndex + 4));
            playerIndex += 4;
        }

        for (let i = 0; i < numThrees; i++) {
            tables.push(shuffledPlayers.slice(playerIndex, playerIndex + 3));
            playerIndex += 3;
        }

        renderTables(tables);
        exportSection.style.display = 'block';
    };

    /**
     * Renders the generated tables to the DOM using Bootstrap cards.
     * @param {Array<Array<string>>} generatedTables An array of tables.
     */
    const renderTables = (generatedTables) => {
        tablesContainer.innerHTML = '';
        if (generatedTables.length === 0) {
            exportSection.style.display = 'none';
            return;
        }

        generatedTables.forEach((table, index) => {
            const tableCard = document.createElement('div');
            tableCard.className = 'card shadow-sm mb-3 table-card';

            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';
            cardHeader.innerHTML = `<h3>Tisch ${index + 1} <span class="badge bg-primary">${table.length} Spieler</span></h3>`;

            const tablePlayerList = document.createElement('ul');
            tablePlayerList.className = 'list-group list-group-flush';
            
            table.forEach(player => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = player;
                tablePlayerList.appendChild(li);
            });
            
            tableCard.appendChild(cardHeader);
            tableCard.appendChild(tablePlayerList);
            tablesContainer.appendChild(tableCard);
        });
    };

    /**
     * Generates a jsPDF document object with the current tables.
     * @returns {jsPDF} A jsPDF document instance.
     */
    const generatePdfDoc = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const title = "Lucas' Geburtstags-Turnier";
        doc.setFontSize(18);
        doc.text(title, 10, 20);

        let yPos = 30;
        tables.forEach((table, index) => {
            doc.setFontSize(14);
            doc.text(`Tisch ${index + 1} (${table.length} Spieler)`, 10, yPos);
            yPos += 7;
            doc.setFontSize(12);
            table.forEach(player => {
                doc.text(`- ${player}`, 15, yPos);
                yPos += 7;
            });
            yPos += 5; // Extra space between tables
        });
        return doc;
    };
    
    /**
     * Exports the current table setup as a PDF document for direct download.
     */
    const exportToPdf = () => {
        if (tables.length === 0) {
            alert('Bitte zuerst die Tische auslosen.');
            return;
        }
        const doc = generatePdfDoc();
        doc.save('lucas-geburtstags-turnier.pdf');
    };

    /**
     * Shares the tables using the Web Share API if available, with a fallback to download.
     */
    const shareTables = async () => {
        if (tables.length === 0) {
            alert('Bitte zuerst die Tische auslosen.');
            return;
        }

        const doc = generatePdfDoc();
        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], 'lucas-geburtstags-turnier.pdf', { type: 'application/pdf' });
        
        const shareData = {
            files: [pdfFile],
            title: 'Tischverteilung für Lucas\' Turnier',
            text: 'Hier ist die Tischverteilung.',
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Sharing failed or was cancelled:', error);
            }
        } else {
            alert('Dein Browser unterstützt das direkte Teilen von Dateien leider nicht. Das PDF wird stattdessen heruntergeladen, damit du es manuell teilen kannst.');
            exportToPdf();
        }
    };


    // --- Event Listeners ---
    addPlayerBtn.addEventListener('click', addPlayer);
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });

    playerListUl.addEventListener('click', (e) => {
        // Find the button element, even if the icon inside was clicked
        const removeBtn = e.target.closest('.remove-player');
        if (removeBtn) {
            const index = parseInt(removeBtn.dataset.index, 10);
            removePlayer(index);
        }
    });

    generateTablesBtn.addEventListener('click', generateTables);
    exportPdfBtn.addEventListener('click', exportToPdf);
    shareBtn.addEventListener('click', shareTables);
    resetAppBtn.addEventListener('click', resetApp);

    // --- Initial Load ---
    loadPlayers();
    renderPlayers(); // Ensure UI is correct on initial load, even with no stored players
});