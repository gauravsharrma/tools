// tools/post-it-notes/post-it-notes.js
function initializePostItNotes() {
    // --- ELEMENTS ---
    const notesContainer = document.getElementById('notes-container');
    const newNoteInput = document.getElementById('new-note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const searchInput = document.getElementById('search-notes-input');
    const viewGridBtn = document.getElementById('view-grid-btn');
    const viewListBtn = document.getElementById('view-list-btn');
    const importBtn = document.getElementById('import-excel');
    const downloadBtn = document.getElementById('download-excel');
    const clearAllBtn = document.getElementById('clear-all-notes');

    // --- STATE ---
    const STORAGE_KEY = 'gs-postit-notes';
    let notes = [];
    let currentView = 'grid'; // 'grid' or 'list'

    // --- DATA FUNCTIONS ---
    const saveNotes = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    };

    const loadNotes = () => {
        const notesFromStorage = localStorage.getItem(STORAGE_KEY);
        if (notesFromStorage) {
            notes = JSON.parse(notesFromStorage).map(note => ({
                ...note,
                time: new Date(note.time) // Convert ISO string back to Date object
            }));
        }
        sortNotes();
        renderNotes();
    };
    
    const sortNotes = () => {
        notes.sort((a, b) => b.time - a.time); // Latest first
    };

    // --- RENDERING ---
    const renderNotes = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredNotes = notes.filter(note => note.note.toLowerCase().includes(searchTerm));

        notesContainer.innerHTML = ''; // Clear previous render

        // Apply view-specific classes to the container
        notesContainer.className = `flex-grow overflow-y-auto p-2 ${currentView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex flex-col gap-2'}`;
        
        if (filteredNotes.length === 0) {
            notesContainer.innerHTML = `<div class="text-slate-500 text-center col-span-full mt-10">No notes found. Try adding one or importing an Excel file!</div>`;
            return;
        }

        filteredNotes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.dataset.id = note.id;
            noteEl.className = currentView === 'grid'
                ? 'bg-yellow-200 p-4 rounded-lg shadow-md flex flex-col justify-between break-words'
                : 'bg-white p-3 border rounded-md shadow-sm flex items-center justify-between';

            const contentEl = document.createElement('div');
            contentEl.innerText = note.note;
            contentEl.setAttribute('contenteditable', 'true');
            contentEl.className = 'note-content flex-grow';
            contentEl.onblur = () => updateNoteContent(note.id, contentEl.innerText);

            const footerEl = document.createElement('div');
            footerEl.className = `text-xs text-slate-500 mt-2 flex justify-between items-center ${currentView === 'grid' ? '' : 'ml-4 flex-shrink-0'}`;

            const timeEl = document.createElement('span');
            timeEl.textContent = note.time.toLocaleString();

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.className = 'font-bold text-lg text-slate-400 hover:text-red-500 ml-4';
            deleteBtn.onclick = () => deleteNote(note.id);
            
            footerEl.appendChild(timeEl);
            footerEl.appendChild(deleteBtn);

            noteEl.appendChild(contentEl);
            noteEl.appendChild(footerEl);
            notesContainer.appendChild(noteEl);
        });
    };

    // --- CRUD & ACTIONS ---
    const addNote = () => {
        const noteText = newNoteInput.value.trim();
        if (!noteText) return;

        const newNote = {
            id: Date.now(),
            note: noteText,
            time: new Date()
        };

        notes.unshift(newNote); // Add to the beginning
        newNoteInput.value = '';
        saveNotes();
        sortNotes(); // Re-sort just in case, though unshift maintains order
        renderNotes();
    };

    const deleteNote = (id) => {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
    };

    const updateNoteContent = (id, newContent) => {
        const note = notes.find(note => note.id === id);
        if (note && note.note !== newContent) {
            note.note = newContent;
            note.time = new Date(); // Update timestamp on edit
            saveNotes();
            sortNotes();
            renderNotes(); // Re-render to show updated time and order
        }
    };
    
    const setView = (view) => {
        currentView = view;
        viewGridBtn.classList.toggle('bg-white', view === 'grid');
        viewListBtn.classList.toggle('bg-white', view === 'list');
        renderNotes();
    };
    
    const handleExcelImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const importedNotes = jsonData.map((row, index) => ({
                id: Date.now() + index, // Ensure unique IDs
                note: row.Note || '',
                time: row.Time instanceof Date ? row.Time : new Date()
            }));
            
            notes = importedNotes;
            saveNotes();
            sortNotes();
            renderNotes();
            alert(`${importedNotes.length} notes imported successfully!`);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExcelDownload = () => {
        if (notes.length === 0) {
            alert('No notes to download.');
            return;
        }
        // Format for Excel download (remove ID, format date nicely)
        const exportData = notes.map(note => ({
            Note: note.note,
            Time: note.time.toLocaleString('en-US')
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Notes');
        XLSX.writeFile(workbook, 'MyNotes.xlsx');
    };

    // --- EVENT LISTENERS ---
    addNoteBtn.addEventListener('click', addNote);
    newNoteInput.addEventListener('keypress', (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); }});
    searchInput.addEventListener('input', renderNotes);
    viewGridBtn.addEventListener('click', () => setView('grid'));
    viewListBtn.addEventListener('click', () => setView('list'));
    importBtn.addEventListener('change', handleExcelImport);
    downloadBtn.addEventListener('click', handleExcelDownload);
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL notes? This cannot be undone.')) {
            notes = [];
            saveNotes();
            renderNotes();
        }
    });
    
    // --- INITIALIZATION ---
    setView('grid');
    loadNotes();
}
