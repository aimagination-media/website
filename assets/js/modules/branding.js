/**
 * AImagination Branding Module
 * Handles the morphing "X" animation in the header
 */

export function initBranding() {
    const morphElement = document.getElementById('morphing-x');
    if (!morphElement) return;

    // Symbols with size adjustments for visual consistency
    const symbols = [
        { char: 'X', size: '1em' },
        { char: '✨', size: '0.9em' },
        { char: '⚛', size: '1.15em' },
        { char: 'λ', size: '1.0em' },
        { char: '🚀', size: '0.8em' },
        { char: '🧬', size: '0.8em' },
        { char: '🎵', size: '0.9em' },
        { char: '🪐', size: '0.9em' },


    ];

    let queue = [];
    const intervalTime = 3000; // 3 seconds per symbol
    const transitionTime = 400; // Matches CSS transition

    // Fisher-Yates Shuffle
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function cycleSymbol() {
        // 1. Fade out
        morphElement.classList.add('hidden');

        // 2. Change text after fade out
        setTimeout(() => {
            // Refill queue if empty
            if (queue.length === 0) {
                queue = shuffle([...symbols]);
                // Ensure we don't repeat the last symbol immediately if possible
                if (queue[0].char === morphElement.textContent && symbols.length > 1) {
                    queue.push(queue.shift());
                }
            }

            const nextItem = queue.shift();
            morphElement.textContent = nextItem.char;
            morphElement.style.fontSize = nextItem.size;

            // 3. Fade in
            morphElement.classList.remove('hidden');
        }, transitionTime);
    }

    // Start the cycle
    setInterval(cycleSymbol, intervalTime);

    console.log('✨ Branding module initialized');
}
