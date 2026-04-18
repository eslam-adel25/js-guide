class SmartFAB {
    constructor(rootId) {
        this.root = document.getElementById(rootId);
        if (!this.root) return console.error('FAB root container not found.');
        
        this.state = {
            isMenuOpen: false,
            activePanel: null
        };

        this.render();
        this.cacheDOM();
        this.bindEvents();
    }

    // --- HTML Injection ---
    render() {
        const svgIcons = {
            plus: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
            chat: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
            code: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
            user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
            send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`
        };

        this.root.innerHTML = `
            <div id="fab-panel-chat" class="fab-panel glass-panel">
                <div class="fab-panel-header">AI Assistant</div>
                <div class="fab-chat-body" id="fab-chat-body">
                    <div class="chat-bubble ai">Hello! How can I help you today?</div>
                    <div class="typing-indicator" id="fab-typing">AI is typing...</div>
                </div>
                <div class="fab-chat-input">
                    <input type="text" id="fab-chat-input-field" placeholder="Ask something..." autocomplete="off">
                    <button class="fab-sub-btn" id="fab-chat-send" style="width:40px; height:40px;">${svgIcons.send}</button>
                </div>
            </div>

            <div id="fab-panel-compiler" class="fab-panel glass-panel">
                <div class="fab-panel-header">JS Playground</div>
                <div class="fab-compiler-body">
                    <textarea class="fab-code-editor" id="fab-code-input" placeholder="// Write JavaScript here...&#10;const msg = 'Hello World';&#10;console.log(msg);"></textarea>
                    <button class="fab-run-btn" id="fab-run-code">Run Code</button>
                    <div class="fab-console" id="fab-console-output">// Output will appear here...</div>
                </div>
            </div>

            <div id="fab-panel-about" class="fab-panel glass-panel">
                <div class="fab-panel-header">About</div>
                <div class="fab-about-body">
                    <div class="fab-about-img">👨‍💻</div>
                    <div class="fab-about-name">Eslam Adel</div>
                    <div class="fab-about-bio">Frontend Developer passionate about turning ideas into clean, interactive web experiences.</div>
                    <div class="fab-social-links">
                        <a href="https://github.com/eslam-adel25" target="_blank">GitHub</a>
                        <a href="https://www.linkedin.com/in/eslam-adel-jadalrab-808862361?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank">LinkedIn</a>
                    </div>
                </div>
            </div>

            <div class="fab-container">
                <button class="fab-main-btn" id="fab-main-toggle">${svgIcons.plus}</button>
                <div class="fab-menu" id="fab-menu">
                    <button class="fab-sub-btn" data-target="about" title="About">${svgIcons.user}</button>
                    <button class="fab-sub-btn" data-target="compiler" title="JS Compiler">${svgIcons.code}</button>
                    <button class="fab-sub-btn" data-target="chat" title="AI Chat">${svgIcons.chat}</button>
                </div>
            </div>
        `;
    }

    // --- DOM Referencing ---
    cacheDOM() {
        this.dom = {
            mainBtn: document.getElementById('fab-main-toggle'),
            menu: document.getElementById('fab-menu'),
            subBtns: document.querySelectorAll('.fab-sub-btn[data-target]'),
            panels: document.querySelectorAll('.fab-panel'),
            
            // Chat elements
            chatBody: document.getElementById('fab-chat-body'),
            chatInput: document.getElementById('fab-chat-input-field'),
            chatSend: document.getElementById('fab-chat-send'),
            typingIndicator: document.getElementById('fab-typing'),
            
            // Compiler elements
            codeInput: document.getElementById('fab-code-input'),
            runBtn: document.getElementById('fab-run-code'),
            consoleOutput: document.getElementById('fab-console-output')
        };
    }

    // --- Event Listeners ---
    bindEvents() {
        // Toggle Main Menu
        this.dom.mainBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Open specific panel
        this.dom.subBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = btn.getAttribute('data-target');
                this.openPanel(target);
            });
        });

        // Prevent panels from closing when clicking inside them
        this.dom.panels.forEach(panel => {
            panel.addEventListener('click', (e) => e.stopPropagation());
        });

        // Close menu and panels on outside click
        document.addEventListener('click', () => {
            this.closeAll();
        });

        // Chat Events
        this.dom.chatSend.addEventListener('click', () => this.handleChatSend());
        this.dom.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleChatSend();
        });

        // Compiler Events
        this.dom.runBtn.addEventListener('click', () => this.handleCodeRun());
    }

    // --- Core UI Logic ---
    toggleMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        if (this.state.isMenuOpen) {
            this.dom.mainBtn.classList.add('active');
            this.dom.menu.classList.add('active');
        } else {
            this.closeAll();
        }
    }

    openPanel(panelName) {
        // Close currently active panel
        this.dom.panels.forEach(p => p.classList.remove('active'));
        
        // Open new panel
        const targetPanel = document.getElementById(`fab-panel-${panelName}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            this.state.activePanel = panelName;
        }

        // UX: Focus inputs when opening
        if (panelName === 'chat') setTimeout(() => this.dom.chatInput.focus(), 300);
        if (panelName === 'compiler') setTimeout(() => this.dom.codeInput.focus(), 300);
    }

    closeAll() {
        this.state.isMenuOpen = false;
        this.state.activePanel = null;
        this.dom.mainBtn.classList.remove('active');
        this.dom.menu.classList.remove('active');
        this.dom.panels.forEach(p => p.classList.remove('active'));
    }

    // --- Chat Logic ---
    async handleChatSend() {
        const text = this.dom.chatInput.value.trim();
        if (!text) return;

        // 1. إضافة رسالة المستخدم للشات
        this.appendMessage(text, 'user');
        this.dom.chatInput.value = '';
        
        // 2. إظهار مؤشر "يكتب الآن..."
        this.dom.typingIndicator.classList.add('active');
        this.scrollToBottom();

        try {
            // 3. الاتصال الحقيقي بالـ API
            const response = await this.callRealAPI(text); 
            
            // 4. إخفاء المؤشر وعرض رد الذكاء الاصطناعي
            this.dom.typingIndicator.classList.remove('active');
            this.appendMessage(response, 'ai');
        } catch (error) {
            this.dom.typingIndicator.classList.remove('active');
            this.appendMessage("عذراً، حدث خطأ في الاتصال. تأكد من صحة المفتاح أو اتصال الإنترنت.", 'ai');
            console.error("API Error:", error);
        }
    }

    // دالة الاتصال الحقيقي
    async callRealAPI(message) {
    // إحنا بننادي السيرفر بتاعنا اللي عملناه بالـ Node.js
    // السيرفر ده هو اللي معاه المفتاح وهو اللي بيكلم OpenAI
    const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            message: message 
        })
    });

    if (!response.ok) {
        // لو السيرفر وقع أو فيه مشكلة في المفتاح هناك
        throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // بنرجع الرد اللي السيرفر بعتهولنا في خاصية reply
    return data.reply; 
}

    appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-bubble ${sender}`;
        msgDiv.textContent = text;
        this.dom.chatBody.insertBefore(msgDiv, this.dom.typingIndicator);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.dom.chatBody.scrollTop = this.dom.chatBody.scrollHeight;
    }

    mockApiCall(message) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(`Received: "${message}". This is a mock AI response.`);
            }, 1000);
        });
    }

    // --- Compiler Logic ---
    handleCodeRun() {
        const code = this.dom.codeInput.value;
        const consoleOut = this.dom.consoleOutput;
        consoleOut.innerHTML = ''; // Clear previous output

        // Intercept console.log to display in our custom UI
        const originalLog = console.log;
        let outputLogs = [];
        console.log = (...args) => {
            outputLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
            originalLog(...args);
        };

        try {
            // Safe evaluation wrapping
            const executeCode = new Function(code);
            const result = executeCode();

            // Print intercepted logs
            if (outputLogs.length > 0) {
                consoleOut.innerHTML = outputLogs.join('<br/>');
            }
            
            // Print return value if it exists and nothing was logged
            if (result !== undefined && outputLogs.length === 0) {
                consoleOut.innerHTML = `<span style="color: #10b981;">> ${result}</span>`;
            } else if (outputLogs.length === 0) {
                consoleOut.innerHTML = `<span style="color: #94a3b8;">> Code executed successfully (No output)</span>`;
            }

        } catch (error) {
            consoleOut.innerHTML = `<span class="error">> Error: ${error.message}</span>`;
        } finally {
            // Restore original console.log
            console.log = originalLog;
        }
    }
}

// Initialize the component on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new SmartFAB('fab-root');
});


