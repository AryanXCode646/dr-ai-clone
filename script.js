document.addEventListener('DOMContentLoaded', () => {
    // Animate hero text
    const animatedText = document.querySelector('.animated-text');
    animatedText.style.opacity = '0';
    setTimeout(() => {
        animatedText.style.transition = 'opacity 1s ease-in';
        animatedText.style.opacity = '1';
    }, 500);

    // Add hover effects to feature cards
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseover', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseout', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Change background color on button click
    document.getElementById('changeColor').addEventListener('click', function() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeead'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.style.backgroundColor = randomColor;
    });

    document.getElementById('send-button').addEventListener('click', sendMessage);

    function sendMessage() {
        const userInput = document.getElementById('user-input').value;
        if (userInput.trim() !== '') {
            const output = document.getElementById('output');
            const userMessage = `<p><strong>You:</strong> ${userInput}</p>`;
            output.innerHTML += userMessage;
            document.getElementById('user-input').value = '';

            // Simulate AI response
            setTimeout(() => {
                const aiResponse = `<p><strong>AI Doctor:</strong> ${getAIResponse(userInput)}</p>`;
                output.innerHTML += aiResponse;
                output.scrollTop = output.scrollHeight;
            }, 1000);
        }
    }

    function getAIResponse(userInput) {
        // Placeholder for AI response logic
        // In a real implementation, this would call an AI service
        return "This is a simulated response based on MBBS course knowledge.";
    }
});