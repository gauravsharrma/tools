function initializeCalculator() {
    const calcDisplay = document.getElementById('calcDisplay');
    let currentInput = '0';

    document.querySelectorAll('.calc-btn').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const value = button.textContent;
            
            if (!action) appendInput(value);
            else if (action === 'clear') clearDisplay();
            else if (action === 'delete') deleteLast();
            else if (action === 'calculate') calculateResult();
        });
    });

    const appendInput = (value) => {
        const operators = ['+', '-', 'x', '/'];
        const lastChar = currentInput.slice(-1);
        if (operators.includes(lastChar) && operators.includes(value)) return;
        const segments = currentInput.split(/[+\-x/]/);
        if (value === '.' && segments[segments.length - 1].includes('.')) return;
        currentInput = (currentInput === '0' && value !== '.') ? value : currentInput + value;
        updateCalcDisplay(currentInput);
    };
    const clearDisplay = () => { currentInput = '0'; updateCalcDisplay(currentInput); };
    const deleteLast = () => { currentInput = currentInput.slice(0, -1) || '0'; updateCalcDisplay(currentInput); };
    const calculateResult = () => {
        try {
            const result = new Function('return ' + currentInput.replace(/x/g, '*'))();
            currentInput = String(Number(result.toFixed(10)));
        } catch (error) { currentInput = 'Error'; }
        updateCalcDisplay(currentInput);
    };
    const updateCalcDisplay = (value) => { calcDisplay.textContent = value; };
}
