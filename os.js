/* ============ Seed Core ============ */
function javaHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return hash;
}

function toNumericSeed(input) {
    const v = String(input).trim();
    return /^-?\d+$/.test(v) ? parseInt(v, 10) : javaHashCode(v);
}

function randomWithDigits(n) {
    let s = String(1 + Math.floor(Math.random() * 9));
    for (let i = 1; i < n; i++) s += Math.floor(Math.random() * 10);
    return parseInt(s, 10);
}

/* ============ History ============ */
const HISTORY_KEY = 'doors_seed_history';
const HISTORY_MAX = 20;

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}
function saveHistory(list) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX))); }
    catch {}
}
function pushHistory(input, output) {
    const list = loadHistory().filter(x => x.input !== input);
    list.unshift({ input, output });
    saveHistory(list);
    return list;
}

/* ============ Helpers ============ */
const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            return true;
        } catch { return false; }
    }
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;'
    }[c]));
}

/* ============ Apps ============ */
const APPS = {
    about: {
        title: 'About Me',
        icon: '👤',
        width: 440, height: 260,
        render: () => `
            <h2>About Me</h2>
            <p>Hi! I'm <strong>FakerNull0</strong> — a developer and modder,
            mostly working on <strong>The Disaster 2D Remake</strong> (TD2DR).</p>
            <p>I do coding, level design, porting, and spriting.</p>
            <p>I speak Russian and I'm active in the modding community.</p>
        `
    },

    projects: {
        title: 'Projects',
        icon: '📁',
        width: 500, height: 420,
        render: () => `
            <h2>Projects</h2>
            <div class="project-card">
                <h3>UltraText Framework</h3>
                <p class="role">Spriter <span>(up to Alpha 5)</span></p>
                <p class="desc">An open project featuring a custom text system built on CTF 2.5.</p>
                <a href="https://gamejolt.com/games/UltraTextFrameworkGamejoltPage/1083841" target="_blank">Project page →</a>
            </div>
            <div class="project-card">
                <h3>TD2DR: One Last Round</h3>
                <p class="role">Coder • Level Designer • Beta Tester</p>
                <p class="desc">A mod with new maps and gameplay mechanics.</p>
                <a href="https://gamejolt.com/games/Olr-Project-Td2dr/1077062" target="_blank">Project page →</a>
            </div>
            <div class="project-card">
                <h3>TD2DR: The Last Reset</h3>
                <p class="role">Coder • Porter</p>
                <p class="desc">A modification with horror elements and reworked content.</p>
                <a href="https://gamejolt.com/games/TD2DRTheLastResetMod/907532" target="_blank">Project page →</a>
            </div>
            <div class="project-card">
                <h3>TD2DR: RUS</h3>
                <p class="role">Creator • Coder</p>
                <p class="desc">Russian localization and adaptation of the project.</p>
                <a href="https://gamejolt.com/games/TD2DR-RUS/1072577" target="_blank">Project page →</a>
            </div>
        `
    },

    links: {
        title: 'Links',
        icon: '🔗',
        width: 320, height: 170,
        render: () => `
            <h2>Links</h2>
            <p>→ <a href="https://gamejolt.com/@FakerNull0" target="_blank">GameJolt</a></p>
            <p>→ <a href="https://github.com/FakerNull0" target="_blank">GitHub</a></p>
        `
    },

    doors: {
        title: 'DOORS Seed Tool',
        icon: '🚪',
        width: 480, height: 460,
        render: () => `
            <div class="seed-section">
                <div class="seed-label">Convert</div>
                <input class="seed-input" data-seed-input type="text"
                       placeholder="Number or text" autocomplete="off" spellcheck="false">
                <div class="seed-hint">Numbers pass through unchanged. Text is hashed like in-game (Java String.hashCode).</div>
                <div class="seed-result-row">
                    <span class="seed-result" data-seed-result>—</span>
                    <button class="icon-btn" data-seed-copy hidden>Copy</button>
                </div>
            </div>

            <div class="seed-section">
                <div class="seed-label">Random seed</div>
                <div class="seed-actions">
                    <button class="btn btn-ghost" data-rand="5">5-digit</button>
                    <button class="btn btn-ghost" data-rand="7">7-digit</button>
                    <button class="btn btn-ghost" data-rand="9">9-digit</button>
                </div>
            </div>

            <div class="seed-section">
                <div class="seed-label">History</div>
                <div class="seed-history" data-seed-history></div>
            </div>
        `,
        mount: (body) => {
            const input = body.querySelector('[data-seed-input]');
            const result = body.querySelector('[data-seed-result]');
            const copyBtn = body.querySelector('[data-seed-copy]');
            const historyEl = body.querySelector('[data-seed-history]');
            let lastOutput = null;

            const renderHistory = (list) => {
                const items = list ?? loadHistory();
                historyEl.innerHTML = items.map(x => `
                    <div class="seed-history-item" data-in="${escapeHtml(x.input)}">
                        <span class="in">${escapeHtml(x.input)}</span>
                        <span class="arrow">→</span>
                        <span class="out">${x.output.toLocaleString('en-US')}</span>
                    </div>
                `).join('');
                historyEl.querySelectorAll('.seed-history-item').forEach(el => {
                    el.addEventListener('click', () => {
                        input.value = el.dataset.in;
                        run();
                    });
                });
            };

            const run = (save = false) => {
                const v = input.value.trim();
                if (!v) {
                    result.textContent = '—';
                    lastOutput = null;
                    copyBtn.hidden = true;
                    return;
                }
                const out = toNumericSeed(v);
                lastOutput = out;
                result.textContent = out.toLocaleString('en-US');
                copyBtn.hidden = false;
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
                if (save) renderHistory(pushHistory(v, out));
            };

            input.addEventListener('input', () => run(false));
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(true); });
            input.addEventListener('blur', () => { if (input.value.trim()) run(true); });

            copyBtn.addEventListener('click', async () => {
                if (lastOutput === null) return;
                if (await copyText(String(lastOutput))) {
                    copyBtn.textContent = 'Copied';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                        copyBtn.classList.remove('copied');
                    }, 1200);
                }
            });

            body.querySelectorAll('[data-rand]').forEach(btn => {
                btn.addEventListener('click', () => {
                    input.value = String(randomWithDigits(parseInt(btn.dataset.rand, 10)));
                    run(true);
                });
            });

            renderHistory();
        }
    }
};

/* ============ Window Manager ============ */
const windows = new Map();
let zTop = 10;
let cascade = 0;
let activeId = null;

function focusWindow(id) {
    const w = windows.get(id);
    if (!w || w.minimized) return;
    zTop++;
    w.el.style.zIndex = zTop;
    activeId = id;
    windows.forEach((v, k) => v.el.classList.toggle('focused', k === id));
    updateTaskbarStates();
}

function updateTaskbarStates() {
    document.querySelectorAll('.taskbar-item').forEach(el => {
        const id = el.dataset.id;
        const w = windows.get(id);
        el.classList.toggle('active', !w?.minimized && id === activeId);
        el.classList.toggle('minimized', !!w?.minimized);
    });
}

function closeWindow(id) {
    const w = windows.get(id);
    if (!w) return;
    w.el.remove();
    windows.delete(id);
    if (activeId === id) activeId = null;
    try { if (typeof w.cleanup === 'function') w.cleanup(); }
    catch (err) { console.error('cleanup failed for', id, err); }
    renderTaskbar();
}

function minimizeWindow(id) {
    const w = windows.get(id);
    if (!w || w.minimized) return;
    w.minimized = true;
    w.el.style.display = 'none';
    if (activeId === id) activeId = null;
    updateTaskbarStates();

    let top = null, topZ = -1;
    windows.forEach((v, k) => {
        if (!v.minimized) {
            const z = parseInt(v.el.style.zIndex || '0', 10);
            if (z > topZ) { topZ = z; top = k; }
        }
    });
    if (top) focusWindow(top);
    else windows.forEach(v => v.el.classList.remove('focused'));
}

function restoreWindow(id) {
    const w = windows.get(id);
    if (!w) return;
    w.minimized = false;
    w.el.style.display = 'flex';
    focusWindow(id);
}

function toggleMaximize(id) {
    const w = windows.get(id);
    if (!w || isMobile()) return;
    if (w.maximized) {
        if (w.prev) {
            w.el.style.left = w.prev.left;
            w.el.style.top = w.prev.top;
            w.el.style.width = w.prev.width;
            w.el.style.height = w.prev.height;
        }
        w.maximized = false;
        w.el.classList.remove('maximized');
    } else {
        w.prev = {
            left: w.el.style.left, top: w.el.style.top,
            width: w.el.style.width, height: w.el.style.height
        };
        w.el.style.left = '0';
        w.el.style.top = '0';
        w.el.style.width = '100%';
        w.el.style.height = 'calc(100% - 44px)';
        w.maximized = true;
        w.el.classList.add('maximized');
    }
    const btn = w.el.querySelector('.window-btn.max');
    if (btn) btn.textContent = w.maximized ? '❐' : '□';
    focusWindow(id);
}

function openWindow(id) {
    if (windows.has(id)) {
        const w = windows.get(id);
        if (w.minimized) restoreWindow(id);
        else focusWindow(id);
        return;
    }
    const app = APPS[id];
    if (!app) return;

    const mobile = isMobile();
    const el = document.createElement('div');
    el.className = 'window';
    el.dataset.id = id;

    if (!mobile) {
        const w = Math.min(app.width, window.innerWidth - 40);
        const h = Math.min(app.height, window.innerHeight - 100);
        const off = (cascade++ % 6) * 22;
        const left = Math.max(20, Math.min(window.innerWidth - w - 20, 60 + off));
        const top = Math.max(20, Math.min(window.innerHeight - h - 60, 40 + off));
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        el.style.left = left + 'px';
        el.style.top = top + 'px';
    }

    el.innerHTML = `
        <div class="window-titlebar">
            <span class="window-title">${app.title}</span>
            <div class="window-controls">
                <button class="window-btn min" aria-label="Minimize">—</button>
                <button class="window-btn max" aria-label="Maximize">□</button>
                <button class="window-btn close" aria-label="Close">×</button>
            </div>
        </div>
        <div class="window-body">${app.render()}</div>
        ${mobile ? '' : `
            <div class="window-resize e"  data-dir="e"></div>
            <div class="window-resize w"  data-dir="w"></div>
            <div class="window-resize n"  data-dir="n"></div>
            <div class="window-resize s"  data-dir="s"></div>
            <div class="window-resize ne" data-dir="ne"></div>
            <div class="window-resize nw" data-dir="nw"></div>
            <div class="window-resize se" data-dir="se"></div>
            <div class="window-resize sw" data-dir="sw"></div>
        `}
    `;

    document.getElementById('desktop').appendChild(el);

    const body = el.querySelector('.window-body');
    const cleanup = app.mount ? app.mount(body) : null;
    windows.set(id, { el, cleanup, minimized: false, maximized: false, prev: null });

    el.addEventListener('pointerdown', () => focusWindow(id));
    el.querySelector('.window-btn.close').addEventListener('click', (e) => {
        e.stopPropagation(); closeWindow(id);
    });
    el.querySelector('.window-btn.min').addEventListener('click', (e) => {
        e.stopPropagation(); minimizeWindow(id);
    });
    el.querySelector('.window-btn.max').addEventListener('click', (e) => {
        e.stopPropagation(); toggleMaximize(id);
    });
    el.querySelector('.window-titlebar').addEventListener('dblclick', (e) => {
        if (e.target.closest('.window-btn')) return;
        toggleMaximize(id);
    });

    if (!mobile) {
        makeDraggable(el);
        makeResizable(el);
    }

    focusWindow(id);
    renderTaskbar();
}

function makeDraggable(win) {
    const bar = win.querySelector('.window-titlebar');
    let ox = 0, oy = 0, dragging = false;

    bar.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.window-btn')) return;
        const w = windows.get(win.dataset.id);
        if (w?.maximized) return;
        dragging = true;
        const r = win.getBoundingClientRect();
        ox = e.clientX - r.left;
        oy = e.clientY - r.top;
        bar.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    bar.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const r = win.getBoundingClientRect();
        const maxX = window.innerWidth - r.width;
        const maxY = window.innerHeight - 44 - r.height;
        win.style.left = Math.max(0, Math.min(maxX, e.clientX - ox)) + 'px';
        win.style.top = Math.max(0, Math.min(maxY, e.clientY - oy)) + 'px';
    });

    const stop = (e) => {
        dragging = false;
        try { bar.releasePointerCapture(e.pointerId); } catch {}
    };
    bar.addEventListener('pointerup', stop);
    bar.addEventListener('pointercancel', stop);
}

function makeResizable(win) {
    win.querySelectorAll('.window-resize').forEach(h => {
        h.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dir = h.dataset.dir;
            const startX = e.clientX, startY = e.clientY;
            const rect = win.getBoundingClientRect();
            const startW = rect.width, startH = rect.height;
            const startL = rect.left, startT = rect.top;
            const minW = 260, minH = 160;

            h.setPointerCapture(e.pointerId);

            const onMove = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                let newW = startW, newH = startH, newL = startL, newT = startT;

                if (dir.includes('e')) newW = Math.max(minW, startW + dx);
                if (dir.includes('s')) newH = Math.max(minH, startH + dy);
                if (dir.includes('w')) {
                    newW = Math.max(minW, startW - dx);
                    newL = startL + (startW - newW);
                }
                if (dir.includes('n')) {
                    newH = Math.max(minH, startH - dy);
                    newT = startT + (startH - newH);
                }

                newL = Math.max(0, newL);
                newT = Math.max(0, newT);
                if (newL + newW > window.innerWidth) newW = window.innerWidth - newL;
                if (newT + newH > window.innerHeight - 44) newH = window.innerHeight - 44 - newT;

                win.style.width = newW + 'px';
                win.style.height = newH + 'px';
                win.style.left = newL + 'px';
                win.style.top = newT + 'px';
            };

            const onUp = (ev) => {
                try { h.releasePointerCapture(ev.pointerId); } catch {}
                h.removeEventListener('pointermove', onMove);
                h.removeEventListener('pointerup', onUp);
                h.removeEventListener('pointercancel', onUp);
            };

            h.addEventListener('pointermove', onMove);
            h.addEventListener('pointerup', onUp);
            h.addEventListener('pointercancel', onUp);
        });
    });
}

window.addEventListener('resize', () => {
    if (isMobile()) return;
    const maxY = window.innerHeight - 44;
    windows.forEach(({ el, maximized }) => {
        if (maximized) return;
        const r = el.getBoundingClientRect();
        if (r.right > window.innerWidth) {
            el.style.left = Math.max(0, window.innerWidth - r.width) + 'px';
        }
        if (r.bottom > maxY) {
            el.style.top = Math.max(0, maxY - r.height) + 'px';
        }
    });
});

/* ============ Context menu ============ */
function showContextMenu(x, y) {
    document.querySelector('.context-menu')?.remove();
    const menu = document.createElement('div');
    menu.className = 'context-menu';

    const addItem = (label, action) => {
        const el = document.createElement('div');
        el.className = 'context-item';
        el.textContent = label;
        el.addEventListener('click', () => { menu.remove(); action(); });
        menu.appendChild(el);
    };
    const addSep = () => {
        const s = document.createElement('div');
        s.className = 'context-separator';
        menu.appendChild(s);
    };

    addItem('↻  Refresh', () => location.reload());
    addSep();
    Object.entries(APPS).forEach(([id, app]) => {
        addItem(`${app.icon}  ${app.title}`, () => openWindow(id));
    });
    if (windows.size > 0) {
        addSep();
        addItem('✕  Close all windows', () => {
            [...windows.keys()].forEach(id => closeWindow(id));
        });
    }

    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    document.body.appendChild(menu);

    const r = menu.getBoundingClientRect();
    if (r.right > window.innerWidth) menu.style.left = (x - r.width) + 'px';
    if (r.bottom > window.innerHeight) menu.style.top = (y - r.height) + 'px';
}

/* ============ Taskbar & Desktop ============ */
function renderTaskbar() {
    const bar = document.getElementById('taskbar-items');
    bar.innerHTML = '';
    windows.forEach((w, id) => {
        const btn = document.createElement('button');
        btn.className = 'taskbar-item';
        btn.dataset.id = id;
        btn.innerHTML = `<span class="tb-icon">${APPS[id].icon}</span><span>${APPS[id].title}</span>`;
        btn.addEventListener('click', () => {
            const ww = windows.get(id);
            if (!ww) return;
            if (ww.minimized) restoreWindow(id);
            else if (activeId === id) minimizeWindow(id);
            else focusWindow(id);
        });
        bar.appendChild(btn);
    });
    updateTaskbarStates();
}

function renderDesktopIcons() {
    const cont = document.getElementById('desktop-icons');
    cont.innerHTML = '';
    Object.entries(APPS).forEach(([id, app]) => {
        const icon = document.createElement('div');
        icon.className = 'desktop-icon';
        icon.innerHTML = `
            <div class="emoji">${app.icon}</div>
            <div class="label">${app.title}</div>
        `;
        if (isMobile()) {
            icon.addEventListener('click', () => openWindow(id));
        } else {
            icon.addEventListener('dblclick', () => openWindow(id));
        }
        cont.appendChild(icon);
    });
}

function renderStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.innerHTML = '';
    Object.entries(APPS).forEach(([id, app]) => {
        const item = document.createElement('div');
        item.className = 'start-item';
        item.innerHTML = `<span>${app.icon}</span><span>${app.title}</span>`;
        item.addEventListener('click', () => {
            openWindow(id);
            menu.classList.add('hidden');
        });
        menu.appendChild(item);
    });
}

function startClock() {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    const update = () => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-GB', {
            hour: '2-digit', minute: '2-digit'
        });
        dateEl.textContent = now.toLocaleDateString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'short'
        });
    };
    update();
    setInterval(update, 15000);
}

/* ============ Boot ============ */
function boot() {
    const bootEl = document.getElementById('boot');
    setTimeout(() => {
        bootEl.classList.add('hidden');
        setTimeout(() => bootEl.remove(), 600);
    }, 1200);
}

/* ============ Init ============ */
document.addEventListener('DOMContentLoaded', () => {
    renderDesktopIcons();
    renderStartMenu();
    startClock();
    boot();

    const startBtn = document.getElementById('start-btn');
    const menu = document.getElementById('start-menu');
    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== startBtn) {
            menu.classList.add('hidden');
        }
        document.querySelector('.context-menu')?.remove();
    });

    // Правый клик на рабочем столе
    document.getElementById('desktop').addEventListener('contextmenu', (e) => {
        if (e.target.closest('.window')) return;
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY);
    });

    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !e.target.closest('input, textarea')) {
            const sm = document.getElementById('start-menu');
            if (!sm.classList.contains('hidden')) {
                sm.classList.add('hidden');
                return;
            }
            if (activeId) closeWindow(activeId);
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openWindow('doors');
        }
    });

    let lastMobile = isMobile();
    window.addEventListener('resize', () => {
        const now = isMobile();
        if (now !== lastMobile) {
            lastMobile = now;
            renderDesktopIcons();
        }
    });
});