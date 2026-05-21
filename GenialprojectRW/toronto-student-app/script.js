// Add micro-interactions and simple event listeners

document.addEventListener('DOMContentLoaded', () => {
    
    // Bottom Nav interaction
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item (unless it's the fab button)
            if(!item.classList.contains('fab-center')) {
                item.classList.add('active');
            }
        });
    });

    // Chat Prompts Interaction
    const chatPrompts = document.querySelectorAll('.chat-prompts button');
    const chatContainer = document.querySelector('.chat-container');

    chatPrompts.forEach(btn => {
        btn.addEventListener('click', () => {
            const userMsg = btn.textContent;
            
            // Create user message bubble
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble sent';
            bubble.style.flexDirection = 'row-reverse';
            bubble.innerHTML = `
                <div class="chat-avatar" style="background: var(--primary-red); color: white;"><i class="fa-solid fa-user"></i></div>
                <div class="message" style="border-top-left-radius: 16px; border-top-right-radius: 4px; background: var(--primary-red); color: white;">
                    <p style="color: white;">${userMsg}</p>
                </div>
            `;
            
            // Insert before prompts
            const promptsDiv = document.querySelector('.chat-prompts');
            chatContainer.insertBefore(bubble, promptsDiv);

            // Disable button
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
            btn.disabled = true;
        });
    });

    // Recommendation Cards Interaction
    const cards = document.querySelectorAll('.recommendation-card, .service-item, .btn-primary, .btn-connect');
    cards.forEach(card => {
        card.addEventListener('mousedown', () => {
            card.style.transform = 'scale(0.97)';
            card.style.transition = 'transform 0.1s';
        });
        card.addEventListener('mouseup', () => {
            card.style.transform = 'scale(1)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });

});
