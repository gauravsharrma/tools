// tools/markdown-converter/markdown-converter.js

function initializeMarkdownConverter() {
    // --- ELEMENTS ---
    const mdInput = document.getElementById('md-input');
    const mdOutput = document.getElementById('md-output');
    const splitBy = document.getElementById('split-by');
    const navInfo = document.getElementById('nav-info');
    const currentChunkEl = document.getElementById('current-chunk');
    const totalChunksEl = document.getElementById('total-chunks');
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');

    // --- STATE ---
    let contentChunks = [];
    let currentChunkIndex = 0;
    let currentFontSize = 16;
    
    // --- LOGIC ---
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        gfm: true,
        breaks: true
    });

    const convertAndRender = () => {
        const markdown = mdInput.value;
        const splitValue = splitBy.value;

        if (splitValue === 'none') {
            mdOutput.innerHTML = marked.parse(markdown);
            navInfo.classList.add('hidden');
            contentChunks = [];
            return;
        }

        navInfo.classList.remove('hidden');
        let regex;
        switch(splitValue) {
            case '---': regex = /(?=^---$)/m; break;
            case '#': regex = /(?=^#\s)/m; break;
            case '##': regex = /(?=^##\s)/m; break;
            case '###': regex = /(?=^###\s)/m; break;
            case 'paragraph': regex = /(?=\n\n)/; break;
            case 'sentence': regex = /(?<=[.!?])\s+/; break;
        }
        
        contentChunks = markdown.split(regex).filter(s => s.trim() !== '');
        totalChunksEl.textContent = contentChunks.length || 1;
        renderChunk(0);
    };
    
    const renderChunk = (index) => {
        if (contentChunks.length === 0) {
            mdOutput.innerHTML = marked.parse(mdInput.value);
            currentChunkIndex = 0;
            currentChunkEl.textContent = 1;
            return;
        }
        currentChunkIndex = Math.max(0, Math.min(index, contentChunks.length - 1));
        mdOutput.innerHTML = marked.parse(contentChunks[currentChunkIndex] || '');
        currentChunkEl.textContent = currentChunkIndex + 1;
    };
    
    const handleKeyDown = (e) => {
        if (splitBy.value !== 'none') {
            if (e.key === 'ArrowRight') { e.preventDefault(); renderChunk(currentChunkIndex + 1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); renderChunk(currentChunkIndex - 1); }
        }
    };

    const updateFontSize = (newSize) => {
        currentFontSize = Math.max(8, Math.min(32, newSize));
        mdOutput.style.fontSize = `${currentFontSize}px`;
    };
    
    // --- RESIZER LOGIC ---
    const resizer = document.getElementById('md-resizer');
    const leftPane = document.getElementById('md-left-pane'); // This is the TOP pane on mobile
    const rightPane = document.getElementById('md-right-pane'); // This is the BOTTOM pane on mobile
    
    let isResizing = false;
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        // Prevent text selection while dragging
        document.body.style.userSelect = 'none'; 
        document.body.style.pointerEvents = 'none';

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            // Re-enable text selection
            document.body.style.userSelect = 'auto';
            document.body.style.pointerEvents = 'auto';
        }, { once: true });
    });

    // MODIFIED: This function now handles both horizontal and vertical resizing
    const handleMouseMove = (e) => {
        if (!isResizing) return;
        const container = document.getElementById('md-main-content');
        
        // Use window.innerWidth to check which layout is active (1024px is Tailwind's 'lg' breakpoint)
        if (window.innerWidth < 1024) {
            // --- MOBILE: Top/Bottom Resizing ---
            const containerRect = container.getBoundingClientRect();
            const pointerRelativeY = e.clientY - containerRect.top;
            let newTopHeight = (pointerRelativeY / containerRect.height) * 100;
            
            // Clamp values to prevent panes from disappearing
            newTopHeight = Math.max(10, Math.min(90, newTopHeight));

            leftPane.style.height = `${newTopHeight}%`;
            rightPane.style.height = `${100 - newTopHeight}%`;
            // Ensure width is not affected by desktop drag
            leftPane.style.width = '100%';
            rightPane.style.width = '100%';
        } else {
            // --- DESKTOP: Left/Right Resizing ---
            const containerRect = container.getBoundingClientRect();
            const pointerRelativeX = e.clientX - containerRect.left;
            let newLeftWidth = (pointerRelativeX / containerRect.width) * 100;

            // Clamp values
            newLeftWidth = Math.max(10, Math.min(90, newLeftWidth));

            leftPane.style.width = `${newLeftWidth}%`;
            rightPane.style.width = `${100 - newLeftWidth}%`;
            // Ensure height is not affected by mobile drag
            leftPane.style.height = '100%';
            rightPane.style.height = '100%';
        }
    };

    // --- EVENT LISTENERS ---
    mdInput.addEventListener('input', convertAndRender);
    splitBy.addEventListener('change', convertAndRender);
    document.addEventListener('keydown', handleKeyDown);
    increaseFontBtn.addEventListener('click', () => updateFontSize(currentFontSize + 1));
    decreaseFontBtn.addEventListener('click', () => updateFontSize(currentFontSize - 1));

    // --- INITIALIZATION ---
    convertAndRender();
}
