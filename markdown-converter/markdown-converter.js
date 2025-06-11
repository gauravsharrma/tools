function initializeMarkdownConverter() {
    const mdInput = document.getElementById('md-input');
    const mdOutput = document.getElementById('md-output');
    const splitBy = document.getElementById('split-by');
    const navInfo = document.getElementById('nav-info');
    const currentChunkEl = document.getElementById('current-chunk');
    const totalChunksEl = document.getElementById('total-chunks');
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');

    let contentChunks = [];
    let currentChunkIndex = 0;
    let currentFontSize = 16;
    
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
    
    const resizer = document.getElementById('md-resizer');
    const leftPane = document.getElementById('md-left-pane');
    const rightPane = document.getElementById('md-right-pane');
    
    let isResizing = false;
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
        }, { once: true });
    });

    const handleMouseMove = (e) => {
        if (!isResizing) return;
        const container = document.getElementById('md-main-content');
        const containerOffsetLeft = container.getBoundingClientRect().left;
        const pointerRelativeX = e.clientX - containerOffsetLeft;
        const newLeftWidth = (pointerRelativeX / container.clientWidth) * 100;
        
        leftPane.style.width = `${Math.max(10, Math.min(90, newLeftWidth))}%`;
        rightPane.style.width = `${100 - Math.max(10, Math.min(90, newLeftWidth))}%`;
    };

    mdInput.addEventListener('input', convertAndRender);
    splitBy.addEventListener('change', convertAndRender);
    document.addEventListener('keydown', handleKeyDown);
    increaseFontBtn.addEventListener('click', () => updateFontSize(currentFontSize + 1));
    decreaseFontBtn.addEventListener('click', () => updateFontSize(currentFontSize - 1));

    convertAndRender();
}
