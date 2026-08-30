const LOCAL_SEARCH_PAGES = [
  { key: "home", title: "دليل JavaScript", url: "index.html" },
  {
    key: "basics",
    title: "الأساسيات",
    url: "pages/basics.html",
  },
  {
    key: "advanced",
    title: "متقدم",
    url: "pages/advanced.html",
  },
  {
    key: "monster-level",
    title: "Monster Level - المصفوفات",
    url: "pages/monsterLevel.html",
  },
];

function normalizeSearchText(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[،؛؟,.!?()[\]{}:;"'`/\\|_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchSectionCandidates(doc) {
  const candidates = Array.from(
    doc.querySelectorAll(".mega-card, .topic-section, .lesson-card, main"),
  );

  return candidates.filter((candidate) => {
    if (candidate.closest("#fab-root, nav, footer, script, style")) {
      return false;
    }

    const nestedCandidate = candidate.querySelector(
      ".mega-card, .topic-section, .lesson-card",
    );
    return !nestedCandidate;
  });
}

function getSearchableText(node) {
  const clone = node.cloneNode(true);
  clone
    .querySelectorAll("script, style, nav, footer, #fab-root, .fab-panel")
    .forEach((element) => element.remove());
  return clone.textContent.replace(/\s+/g, " ").trim();
}

function getSearchSectionTitle(node, pageTitle) {
  const heading = node.querySelector("h1, h2, h3, .main-label");
  return heading ? heading.textContent.replace(/\s+/g, " ").trim() : pageTitle;
}

function getSearchPagePath(pageUrl) {
  return new URL(getSearchPageHref(pageUrl), window.location.href).pathname;
}

function getSearchPageHref(pageUrl) {
  return window.location.pathname.includes("/pages/")
    ? `../${pageUrl}`
    : pageUrl;
}

function createSearchSectionId(pageKey, index) {
  return `local-search-${pageKey}-${index + 1}`;
}

function prepareLocalSearchAnchors(doc, pageKey) {
  getSearchSectionCandidates(doc).forEach((section, index) => {
    section.id = createSearchSectionId(pageKey, index);
    section.style.scrollMarginTop = "110px";
  });
}

function getSearchSnippet(text, query) {
  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);
  if (matchIndex < 0) return text.slice(0, 150).trim();

  const start = Math.max(0, matchIndex - 55);
  const end = Math.min(text.length, start + 180);
  return `${start > 0 ? "..." : ""}${text.slice(start, end).trim()}${end < text.length ? "..." : ""}`;
}

function scoreSearchSection(section, queryTokens, normalizedQuery) {
  const normalizedTitle = normalizeSearchText(section.sectionTitle);
  const normalizedPageTitle = normalizeSearchText(section.pageTitle);
  const normalizedContent = normalizeSearchText(section.text);
  let score = 0;

  if (normalizedTitle === normalizedQuery) score += 120;
  if (normalizedPageTitle === normalizedQuery) score += 100;
  if (normalizedTitle.startsWith(`${normalizedQuery} `)) score += 90;
  if (normalizedTitle.includes(normalizedQuery)) score += 65;
  if (normalizedContent.includes(normalizedQuery)) score += 35;

  queryTokens.forEach((token) => {
    if (normalizedTitle.includes(token)) score += 24;
    if (normalizedPageTitle.includes(token)) score += 16;
    if (normalizedContent.includes(token)) score += 7;
  });

  return score;
}

class LocalSiteSearch {
  constructor(currentDocument) {
    this.currentDocument = currentDocument;
    this.indexPromise = null;
  }

  async loadIndex() {
    if (this.indexPromise) return this.indexPromise;

    this.indexPromise = Promise.all(
      LOCAL_SEARCH_PAGES.map((page) => this.loadPage(page)),
    ).then((pages) => pages.flat());

    return this.indexPromise;
  }

  async loadPage(page) {
    const currentPath = window.location.pathname;
    const pagePath = getSearchPagePath(page.url);
    let doc = null;

    if (
      pagePath === currentPath ||
      (page.key === "home" && /\/$/.test(currentPath))
    ) {
      doc = this.currentDocument;
      prepareLocalSearchAnchors(doc, page.key);
    } else {
      try {
        const response = await fetch(getSearchPageHref(page.url), {
          cache: "force-cache",
        });
        if (!response.ok) throw new Error(`Unable to load ${page.url}`);
        doc = new DOMParser().parseFromString(
          await response.text(),
          "text/html",
        );
      } catch (error) {
        console.warn("Local search skipped a page:", page.url, error);
        return [];
      }
    }

    const pageHeading = doc.querySelector("h1")?.textContent || "";
    const pageSearchText = `${page.title} ${pageHeading}`.trim();

    return getSearchSectionCandidates(doc)
      .map((section, index) => {
        const text = getSearchableText(section);
        return {
          pageKey: page.key,
          pageTitle: page.title,
          pageUrl: page.url,
          sectionId: createSearchSectionId(page.key, index),
          sectionTitle: getSearchSectionTitle(section, page.title),
          pageSearchText,
          text,
        };
      })
      .filter((section) => section.text.length >= 4);
  }

  async search(query) {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return [];

    const queryTokens = normalizedQuery.split(" ").filter(Boolean);
    const index = await this.loadIndex();
    const uniqueResults = new Map();

    index.forEach((section) => {
      const normalizedText = normalizeSearchText(section.text);
      const normalizedPageSearchText = normalizeSearchText(
        section.pageSearchText,
      );
      const searchableText = `${normalizedPageSearchText} ${normalizedText}`;
      const matchesAllTokens = queryTokens.every((token) =>
        searchableText.includes(token),
      );
      const matchesPhrase = searchableText.includes(normalizedQuery);
      if (!matchesAllTokens && !matchesPhrase) return;

      const result = {
        ...section,
        score: scoreSearchSection(section, queryTokens, normalizedQuery),
        snippet: getSearchSnippet(section.text, query),
      };
      const resultKey = `${section.pageKey}:${section.sectionId}`;
      uniqueResults.set(resultKey, result);
    });

    return Array.from(uniqueResults.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }
}

class SmartFAB {
  constructor(rootId) {
    this.root = document.getElementById(rootId);
    if (!this.root) return console.error("FAB root container not found.");

    this.state = {
      isMenuOpen: false,
      activePanel: null,
      sectionMenuVisible: true,
      pageSectionsRendered: false,
    };

    this.render();
    this.cacheDOM();
    this.bindEvents();
    this.localSearch = new LocalSiteSearch(document);
    prepareLocalSearchAnchors(document, this.getCurrentSearchPageKey());
    this.renderPageSections();
    this.handleSearchHash();
  }

  getCurrentSearchPageKey() {
    const currentPath = window.location.pathname;
    return (
      LOCAL_SEARCH_PAGES.find(
        (page) => getSearchPagePath(page.url) === currentPath,
      )?.key || "current"
    );
  }

  handleSearchHash() {
    const sectionId = window.location.hash.slice(1);
    if (!sectionId) return;

    const target = document.getElementById(sectionId);
    if (!target) return;

    setTimeout(() => {
      const navbar = document.querySelector(".navbar");
      const navbarHeight = navbar
        ? navbar.getBoundingClientRect().height + 12
        : 20;
      const top =
        target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }, 0);
  }

  // --- HTML Injection ---
  render() {
    const svgIcons = {
      plus: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
      chat: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      code: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
      user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    };

    this.root.innerHTML = `
            <div id="fab-panel-chat" class="fab-panel glass-panel">
                <div class="fab-panel-header">
                    <span>AI Assistant</span>
                    <button type="button" class="fab-header-toggle" id="fab-page-sections-toggle">📚 الأقسام</button>
                </div>
                <div class="fab-chat-body" id="fab-chat-body">
                    <div class="fab-page-sections" id="fab-page-sections"></div>
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
      mainBtn: document.getElementById("fab-main-toggle"),
      menu: document.getElementById("fab-menu"),
      subBtns: document.querySelectorAll(".fab-sub-btn[data-target]"),
      panels: document.querySelectorAll(".fab-panel"),
      pageSections: document.getElementById("fab-page-sections"),
      pageSectionToggle: document.getElementById("fab-page-sections-toggle"),

      // Chat elements
      chatBody: document.getElementById("fab-chat-body"),
      chatInput: document.getElementById("fab-chat-input-field"),
      chatSend: document.getElementById("fab-chat-send"),
      typingIndicator: document.getElementById("fab-typing"),

      // Compiler elements
      codeInput: document.getElementById("fab-code-input"),
      runBtn: document.getElementById("fab-run-code"),
      consoleOutput: document.getElementById("fab-console-output"),
    };
  }

  // --- Event Listeners ---
  bindEvents() {
    // Toggle Main Menu
    this.dom.mainBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Open specific panel
    this.dom.subBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const target = btn.getAttribute("data-target");
        this.openPanel(target);
      });
    });

    if (this.dom.pageSectionToggle) {
      this.dom.pageSectionToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.togglePageSections();
      });
    }

    // Prevent panels from closing when clicking inside them
    this.dom.panels.forEach((panel) => {
      panel.addEventListener("click", (e) => e.stopPropagation());
    });

    // Close menu and panels on outside click
    document.addEventListener("click", () => {
      this.closeAll();
    });

    // Chat Events
    this.dom.chatSend.addEventListener("click", () => this.handleChatSend());
    this.dom.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleChatSend();
    });

    // Compiler Events
    this.dom.runBtn.addEventListener("click", () => this.handleCodeRun());
  }

  // --- Core UI Logic ---
  toggleMenu() {
    this.state.isMenuOpen = !this.state.isMenuOpen;
    if (this.state.isMenuOpen) {
      this.dom.mainBtn.classList.add("active");
      this.dom.menu.classList.add("active");
    } else {
      this.closeAll();
    }
  }

  openPanel(panelName) {
    // Close currently active panel
    this.dom.panels.forEach((p) => p.classList.remove("active"));

    // Open new panel
    const targetPanel = document.getElementById(`fab-panel-${panelName}`);
    if (targetPanel) {
      targetPanel.classList.add("active");
      this.state.activePanel = panelName;
    }

    if (panelName === "chat") {
      this.renderPageSections();
      setTimeout(() => this.dom.chatInput.focus(), 300);
    }
    if (panelName === "compiler")
      setTimeout(() => this.dom.codeInput.focus(), 300);
  }

  closeAll() {
    this.state.isMenuOpen = false;
    this.state.activePanel = null;
    this.dom.mainBtn.classList.remove("active");
    this.dom.menu.classList.remove("active");
    this.dom.panels.forEach((p) => p.classList.remove("active"));
  }

  detectPageSections() {
    const ignoredSelectors =
      "#fab-root, .fab-panel, .fab-chat-body, .fab-chat-input, .fab-main-btn, .fab-menu, .navbar, #notification-container, .modal, .modal-overlay, .modal-content";
    const sections = [];
    const seen = new Set();

    const rootCandidates = Array.from(
      document.querySelectorAll(".mega-card, .lesson-section, .topic-section"),
    );

    rootCandidates.forEach((container) => {
      if (!container || container.matches(ignoredSelectors)) return;
      if (container.closest("#fab-root")) return;

      const directParentContainer = container.parentElement?.closest(
        ".mega-card, .lesson-section, .topic-section",
      );
      if (directParentContainer && directParentContainer !== container) return;

      if (container.matches("header, .main-header, .container.lesson-card"))
        return;

      const labelNode =
        container.querySelector("h1, h2, h3, .main-label") ||
        container.querySelector(".section-title");
      const text = labelNode
        ? labelNode.textContent.trim()
        : container.textContent.trim();
      if (!text || text.length < 4) return;
      if (/^(AI Assistant|JS Playground|About|دليل JavaScript)$/i.test(text))
        return;

      const key = container.id || `${container.tagName}:${text}`;
      if (seen.has(key)) return;
      seen.add(key);

      if (!container.id) {
        container.id = `page-section-${sections.length + 1}`;
      }
      container.style.scrollMarginTop = "110px";

      sections.push({
        id: container.id,
        text,
        node: container,
      });
    });

    return sections;
  }

  renderPageSections(forceShow = false) {
    if (!this.dom.pageSections) return;

    const sections = this.detectPageSections();
    this.dom.pageSections.innerHTML = "";

    if (!sections.length) {
      this.dom.pageSections.innerHTML =
        '<div class="fab-page-sections-empty">لا توجد أقسام مناسبة في هذه الصفحة.</div>';
      this.state.pageSectionsRendered = true;
      this.state.sectionMenuVisible = true;
      return;
    }

    const title = document.createElement("div");
    title.className = "fab-page-sections-title";
    title.textContent = "📚 أقسام الصفحة";
    this.dom.pageSections.appendChild(title);

    const list = document.createElement("div");
    list.className = "fab-page-sections-list";

    sections.forEach((section, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fab-page-section-btn";
      btn.innerHTML = `<span class="fab-section-order">${index + 1}.</span><span class="fab-section-label">${section.text}</span>`;
      btn.addEventListener("click", () => {
        const target = section.node;
        if (!target) return;

        this.state.sectionMenuVisible = false;
        this.dom.pageSections.classList.add("is-hidden");

        const navbar = document.querySelector(".navbar");
        const navbarHeight = navbar
          ? navbar.getBoundingClientRect().height + 12
          : 20;
        const top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight;

        window.scrollTo({
          top,
          behavior: "smooth",
        });
      });
      list.appendChild(btn);
    });

    this.dom.pageSections.appendChild(list);
    this.state.pageSectionsRendered = true;
    this.state.sectionMenuVisible = forceShow
      ? true
      : this.state.sectionMenuVisible;
    this.dom.pageSections.classList.toggle(
      "is-hidden",
      !this.state.sectionMenuVisible,
    );
  }

  togglePageSections() {
    if (!this.dom.pageSections) return;
    this.state.sectionMenuVisible = !this.state.sectionMenuVisible;
    this.dom.pageSections.classList.toggle(
      "is-hidden",
      !this.state.sectionMenuVisible,
    );
  }

  // --- Chat Logic ---
  async handleChatSend() {
    const text = this.dom.chatInput.value.trim();
    if (!text) return;

    this.appendMessage(text, "user");
    this.dom.chatInput.value = "";

    this.dom.typingIndicator.classList.add("active");
    this.scrollToBottom();

    try {
      const results = await this.localSearch.search(text);
      this.dom.typingIndicator.classList.remove("active");
      this.renderSearchResults(text, results);
    } catch (error) {
      this.dom.typingIndicator.classList.remove("active");
      this.renderSearchMessage("تعذر البحث المحلي. حاول مرة أخرى.");
      console.error("Local search error:", error);
    }
  }

  renderSearchResults(query, results) {
    const resultContainer = this.createSearchResultsContainer();
    const heading = document.createElement("div");
    heading.className = "fab-search-results-heading";
    heading.textContent = `${results.length} نتيجة للبحث عن "${query}"`;
    resultContainer.appendChild(heading);

    if (!results.length) {
      const empty = document.createElement("div");
      empty.className = "fab-search-empty";
      empty.textContent = "لا توجد نتائج. جرّب كلمة أخرى.";
      resultContainer.appendChild(empty);
    } else {
      results.forEach((result) => {
        resultContainer.appendChild(this.createSearchResult(result));
      });
    }

    this.dom.chatBody.insertBefore(resultContainer, this.dom.typingIndicator);
    this.scrollToBottom();
  }

  renderSearchMessage(message) {
    const resultContainer = this.createSearchResultsContainer();
    resultContainer.textContent = message;
    this.dom.chatBody.insertBefore(resultContainer, this.dom.typingIndicator);
    this.scrollToBottom();
  }

  createSearchResultsContainer() {
    this.dom.chatBody
      .querySelectorAll(".fab-search-results")
      .forEach((node) => {
        node.remove();
      });
    const container = document.createElement("div");
    container.className = "fab-search-results";
    return container;
  }

  createSearchResult(result) {
    const item = document.createElement("article");
    item.className = "fab-search-result";

    const page = document.createElement("div");
    page.className = "fab-search-result-page";
    page.textContent = result.pageTitle;

    const title = document.createElement("div");
    title.className = "fab-search-result-title";
    title.textContent = result.sectionTitle;

    const snippet = document.createElement("p");
    snippet.className = "fab-search-result-snippet";
    snippet.textContent = result.snippet;

    const open = document.createElement("button");
    open.type = "button";
    open.className = "fab-search-result-open";
    open.textContent = "فتح القسم";
    open.addEventListener("click", () => this.openSearchResult(result));

    item.append(page, title, snippet, open);
    return item;
  }

  openSearchResult(result) {
    const href = `${getSearchPageHref(result.pageUrl)}#${result.sectionId}`;
    const resultPath = getSearchPagePath(result.pageUrl);
    if (resultPath !== window.location.pathname) {
      window.location.href = href;
      return;
    }

    const target = document.getElementById(result.sectionId);
    if (!target) {
      this.renderSearchMessage("القسم المطلوب غير متاح حالياً.");
      return;
    }

    window.history.replaceState(null, "", `#${result.sectionId}`);
    this.scrollToSearchTarget(target);
  }

  scrollToSearchTarget(target) {
    const navbar = document.querySelector(".navbar");
    const navbarHeight = navbar
      ? navbar.getBoundingClientRect().height + 12
      : 20;
    const top =
      target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
    window.scrollTo({ top, behavior: "smooth" });
  }

  appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-bubble ${sender}`;
    msgDiv.textContent = text;
    this.dom.chatBody.insertBefore(msgDiv, this.dom.typingIndicator);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.dom.chatBody.scrollTop = this.dom.chatBody.scrollHeight;
  }

  mockApiCall(message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Received: "${message}". This is a mock AI response.`);
      }, 1000);
    });
  }

  // --- Compiler Logic ---
  handleCodeRun() {
    const code = this.dom.codeInput.value;
    const consoleOut = this.dom.consoleOutput;
    consoleOut.innerHTML = ""; // Clear previous output

    // Intercept console.log to display in our custom UI
    const originalLog = console.log;
    let outputLogs = [];
    console.log = (...args) => {
      outputLogs.push(
        args
          .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
          .join(" "),
      );
      originalLog(...args);
    };

    try {
      // Safe evaluation wrapping
      const executeCode = new Function(code);
      const result = executeCode();

      // Print intercepted logs
      if (outputLogs.length > 0) {
        consoleOut.innerHTML = outputLogs.join("<br/>");
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
document.addEventListener("DOMContentLoaded", () => {
  new SmartFAB("fab-root");
});
