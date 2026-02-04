// --- NEW: THE CHRONOS ENGINE (Undo/Redo Stack) ---
let historyStack = [];
let redoStack = [];
const MAX_HISTORY = 50; // Unlimited undo is risky for RAM, 50 is the pro sweet spot

function saveState(code) {
    // When a new action happens, the future (redo) is wiped
    if (historyStack.length > 0 && code === historyStack[historyStack.length - 1]) return;
    
    historyStack.push(code);
    redoStack = []; // New path chosen, clear redo
    
    if (historyStack.length > MAX_HISTORY) historyStack.shift(); 
    updateChronosUI();
}

function undo() {
    if (historyStack.length <= 1) return; // Need at least one state to stay on
    
    const currentState = historyStack.pop();
    redoStack.push(currentState);
    
    const previousState = historyStack[historyStack.length - 1];
    applyState(previousState);
}

function redo() {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack.pop();
    historyStack.push(nextState);
    
    applyState(nextState);
}

function applyState(code) {
    editor.value = code;
    updateLivePreview(code);
    updateChronosUI();
}

function updateChronosUI() {
    const uBtn = document.getElementById('undoBtn');
    const rBtn = document.getElementById('redoBtn');
    
    uBtn.style.opacity = historyStack.length > 1 ? "1" : "0.3";
    uBtn.disabled = historyStack.length <= 1;
    
    rBtn.style.opacity = redoStack.length > 0 ? "1" : "0.3";
    rBtn.disabled = redoStack.length === 0;
}
