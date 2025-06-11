function initializeWordCounter() {
    const textInput = document.getElementById('textInput');
    textInput.addEventListener('input', () => {
        const text = textInput.value;
        document.getElementById('charCount').textContent = text.length;
        const words = text.trim().split(/\s+/).filter(word => word !== '');
        document.getElementById('wordCount').textContent = text.trim() === '' ? 0 : words.length;
    });
}
