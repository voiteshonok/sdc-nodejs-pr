// Test JavaScript file for HTTP Server with Streams

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('testButton');
    const output = document.getElementById('output');
    let clickCount = 0;

    button.addEventListener('click', () => {
        clickCount++;
        const messages = [
            'Hello from JavaScript!',
            'Streams are working!',
            'File served successfully!',
            'Server is responding!',
            'Everything is working!'
        ];
        
        const message = messages[clickCount % messages.length];
        output.textContent = `${message} (Clicked ${clickCount} time${clickCount !== 1 ? 's' : ''})`;
        
        // Add a visual effect
        output.style.animation = 'none';
        setTimeout(() => {
            output.style.animation = 'fadeIn 0.3s';
        }, 10);
    });

    // Test that the script is loaded
    console.log('JavaScript file loaded successfully via streams!');
    console.log('Server is serving files correctly.');
});

