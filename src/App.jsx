:root {
    --bg: #0f1119;
    --panel: #161822;
    --border: #252836;
    --text: #e0e0e0;
    --sub: #9094a6;
    --accent: #f0a830;
    --accent2: #e84855;
    --green: #2ecc71;
    --blue: #3498db;
    --win: #27ae60;
    --draw: #f39c12;
    --loss: #e74c3c;
    --card-bg: linear-gradient(145deg, #1a1d2e 0%, #1e2135 50%, #1a1d2e 100%);
    --gold: #f0c060;
    --star: #ffd700;
    --radius: 12px;
    --radius-sm: 8px;
    --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    --transition: 0.2s ease;
    --font-mono: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    overflow-x: hidden;
}

/* ============ SHELL LAYOUT ============ */
.fm-shell {
    display: flex;
    min-height: 100vh;
    position: relative;
}

.fm-left-nav {
    width: 200px;
    min-width: 200px;
    background: var(--panel);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 16px 10px;
    gap: 4px;
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 100;
    transition: transform 0.3s ease;
}

.club-badge {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent);
    color: #0f1119;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.3rem;
    margin: 0 auto 16px;
    letter-spacing: 1px;
    box-shadow: 0 0 24px rgba(240, 168, 48, 0.35);
    flex-shrink: 0;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 16px;
    border-radius: var(--radius-sm);
    border: none;
    background: transparent;
    color: var(--sub);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: var(--transition);
    text-align: left;
    width: 100%;
    white-space: nowrap;
}
.nav-item:hover {
    background: #1e2135;
    color: #d0d0d0;
}
.nav-item.active {
    background: #1e2135;
    color: var(--accent);
    font-weight: 700;
    box-shadow: inset 3px 0 0 var(--accent);
}

.fm-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding-bottom: 0;
}

.fm-topbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px 28px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
    flex-wrap: wrap;
    gap: 12px;
    position: sticky;
    top: 0;
    z-index: 50;
}
.fm-topbar h1 {
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: -0.3px;
    background: linear-gradient(135deg, var(--accent), #f7c978);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
.fm-topbar p {
    font-size: 0.8rem;
    color: var(--sub);
    margin-top: 2px;
}
.top-actions {
    display: flex;
    gap: 10px;
    font-size: 0.75rem;
    color: var(--sub);
    align-items: center;
}
.top-actions span {
    padding: 5px 12px;
    border-radius: 20px;
    background: #1e2135;
    font-weight: 600;
    font-size: 0.7rem;
    letter-spacing: 0.3px;
}

/* ============ DASHBOARD ============ */
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 20px 28px;
}
.panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    box-shadow: var(--shadow);
}
.panel.wide {
    grid-column: span 2;
}
.panel h2 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: #fff;
    letter-spacing: -0.2px;
}
.panel h3 {
    font-size: 0.85rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: #ccc;
}
.info-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: center;
    padding: 20px 16px;
}
.info-card span {
    font-size: 0.75rem;
    color: var(--sub);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.info-card strong {
    font-size: 2rem;
    font-weight: 900;
    color: #fff;
    font-family: var(--font-mono);
}
.info-card.result-win strong {
    color: var(--win);
}
.info-card.result-draw strong {
    color: var(--draw);
}
.info-card.result-loss strong {
    color: var(--loss);
}

/* ============ PLAYER LAYOUT ============ */
.player-layout {
    display: grid;
    grid-template-columns: 220px 1fr 220px;
    gap: 0;
    flex: 1;
    min-height: 0;
}
.player-list {
    background: var(--panel);
    border-right: 1px solid var(--border);
    padding: 12px 8px;
    overflow-y: auto;
    max-height: calc(100vh - 120px);
    position: sticky;
    top: 100px;
}
.player-group h3 {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--accent);
    padding: 10px 8px 4px;
    margin-top: 4px;
}
.player-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    font-size: 0.78rem;
    width: 100%;
    text-align: left;
    transition: var(--transition);
    flex-wrap: wrap;
}
.player-row:hover {
    background: #1e2135;
}
.player-row.active {
    background: #1e2135;
    border-left: 3px solid var(--accent);
    font-weight: 700;
}
.player-row span {
    color: var(--accent);
    font-weight: 700;
    font-size: 0.7rem;
    min-width: 20px;
}
.player-row strong {
    font-size: 0.8rem;
    flex: 1;
    min-width: 50px;
}
.player-row small {
    color: var(--sub);
    font-size: 0.65rem;
}

.fm-player-page {
    padding: 20px 24px;
    overflow-y: auto;
    max-height: calc(100vh - 120px);
}
.v7-player-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.player-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
}
.player-hero h2 {
    font-size: 1.6rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.5px;
}
.player-hero p {
    color: var(--sub);
    font-size: 0.85rem;
}
.tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
}
.tag-row span {
    background: #1e2135;
    color: var(--accent);
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.3px;
}
.ability-box {
    display: flex;
    gap: 20px;
    text-align: center;
}
.ability-box div {
    background: #1e2135;
    border-radius: var(--radius-sm);
    padding: 12px 18px;
}
.ability-box small {
    display: block;
    font-size: 0.65rem;
    color: var(--sub);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.ability-box strong {
    font-size: 1.6rem;
    font-weight: 900;
    color: var(--accent);
    font-family: var(--font-mono);
}

.fm-content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}
.fm-content-grid .panel.wide {
    grid-column: span 2;
}

.right-analysis {
    background: var(--panel);
    border-left: 1px solid var(--border);
    padding: 14px 12px;
    overflow-y: auto;
    max-height: calc(100vh - 120px);
    position: sticky;
    top: 100px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.attr-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    font-size: 0.78rem;
}
.attr-row span {
    color: var(--sub);
}
.attr-row b {
    font-weight: 700;
}
.attr-row b.elite {
    color: var(--accent);
}
.attr-row b.good {
    color: #6ab0f3;
}
.attr-row b.weak {
    color: #e57373;
}
.season-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    font-size: 0.8rem;
}
.season-row span {
    color: var(--sub);
}
.season-row b {
    font-weight: 700;
    color: #fff;
}

/* ============ STAR CARD (内嵌球星卡) ============ */
.star-card-embedded {
    background: var(--card-bg);
    border: 2px solid #2a2d3d;
    border-radius: 16px;
    padding: 20px 24px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    min-height: 200px;
}
.star-card-embedded::before {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle, rgba(240, 168, 48, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
}
.star-card-embedded .star-glow {
    position: absolute;
    top: 14px;
    right: 18px;
    font-size: 2rem;
    animation: starPulse 2s ease-in-out infinite;
    pointer-events: none;
}
@keyframes starPulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.3); }
}
.star-card-embedded .star-number {
    font-size: 4rem;
    font-weight: 900;
    color: rgba(240, 168, 48, 0.25);
    position: absolute;
    bottom: 10px;
    right: 20px;
    font-family: var(--font-mono);
    pointer-events: none;
    line-height: 1;
    letter-spacing: -2px;
}
.star-card-embedded .star-name {
    font-size: 1.8rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.5px;
    position: relative;
    z-index: 1;
}
.star-card-embedded .star-pos {
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
}
.star-card-embedded .star-stats-mini {
    display: flex;
    gap: 16px;
    margin-top: 10px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
}
.star-card-embedded .star-stat-item {
    text-align: center;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    padding: 8px 14px;
}
.star-card-embedded .star-stat-item .val {
    font-size: 1.3rem;
    font-weight: 900;
    color: #fff;
    font-family: var(--font-mono);
    display: block;
}
.star-card-embedded .star-stat-item .lbl {
    font-size: 0.6rem;
    color: var(--sub);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ============ MATCH TABLE ============ */
.table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 6px;
}
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
    min-width: 500px;
}
table th {
    background: #1e2135;
    padding: 10px 12px;
    text-align: left;
    font-weight: 700;
    color: var(--sub);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    position: sticky;
    top: 0;
}
table td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    white-space: nowrap;
}
table tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
}
.result-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
}
.result-badge.win {
    background: rgba(46, 204, 113, 0.2);
    color: var(--win);
}
.result-badge.draw {
    background: rgba(243, 156, 18, 0.2);
    color: var(--draw);
}
.result-badge.loss {
    background: rgba(231, 76, 60, 0.2);
    color: var(--loss);
}
.empty-match {
    text-align: center;
    padding: 30px;
    color: var(--sub);
}
.empty-match .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 8px;
}

/* ============ FORM ============ */
.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
    margin-bottom: 12px;
}
input,
textarea,
select {
    background: #1e2135;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 14px;
    color: #fff;
    font-size: 0.85rem;
    font-family: inherit;
    width: 100%;
    transition: var(--transition);
}
input:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(240, 168, 48, 0.1);
}
textarea {
    min-height: 80px;
    resize: vertical;
    margin-bottom: 12px;
}
.primary-btn {
    background: var(--accent);
    color: #0f1119;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    font-size: 0.85rem;
    letter-spacing: 0.3px;
    transition: var(--transition);
}
.primary-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}
.primary-btn.danger {
    background: var(--accent2);
    color: #fff;
}
.result-btn-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.result-btn {
    padding: 8px 16px;
    border-radius: 20px;
    border: 2px solid var(--border);
    background: transparent;
    color: var(--sub);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.8rem;
    transition: var(--transition);
    white-space: nowrap;
}
.result-btn:hover {
    border-color: #555;
    color: #ccc;
}
.result-btn.selected-win {
    border-color: var(--win);
    background: rgba(46, 204, 113, 0.15);
    color: var(--win);
    font-weight: 700;
}
.result-btn.selected-draw {
    border-color: var(--draw);
    background: rgba(243, 156, 18, 0.15);
    color: var(--draw);
    font-weight: 700;
}
.result-btn.selected-loss {
    border-color: var(--loss);
    background: rgba(231, 76, 60, 0.15);
    color: var(--loss);
    font-weight: 700;
}

/* ============ COACH CARDS ============ */
.coach-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
    margin-bottom: 16px;
}
.coach-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 18px;
    text-align: center;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}
.coach-card:hover {
    border-color: #444;
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
}
.coach-card.head-coach {
    border-color: var(--accent);
    box-shadow: 0 0 20px rgba(240, 168, 48, 0.2);
}
.coach-card .coach-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #1e2135;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    font-weight: 900;
    color: var(--accent);
    border: 2px solid var(--border);
}
.coach-card.head-coach .coach-avatar {
    border-color: var(--accent);
    font-size: 2rem;
    box-shadow: 0 0 16px rgba(240, 168, 48, 0.3);
}
.coach-card .coach-name {
    font-weight: 800;
    font-size: 1rem;
    color: #fff;
}
.coach-card .coach-role {
    font-size: 0.7rem;
    color: var(--accent);
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-top: 2px;
}
.coach-card.head-coach .coach-role {
    font-size: 0.75rem;
    color: #f0c060;
}
.coach-card .coach-desc {
    font-size: 0.7rem;
    color: var(--sub);
    margin-top: 6px;
}
.coach-badge-head {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 1.2rem;
}

/* ============ FM 战术图 ============ */
.fm-pitch-container {
    display: flex;
    justify-content: center;
    padding: 10px 0;
}
.fm-pitch {
    width: 100%;
    max-width: 420px;
    aspect-ratio: 3 / 4.5;
    background: linear-gradient(180deg, #3a7d3a 0%, #357535 30%, #2f6f2f 50%, #357535 70%, #3a7d3a 100%);
    border-radius: 12px;
    position: relative;
    border: 4px solid #fff;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    overflow: hidden;
}
.fm-pitch::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 5%;
    right: 5%;
    height: 2px;
    background: rgba(255, 255, 255, 0.6);
    transform: translateY(-50%);
}
.fm-pitch::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    border: 2px solid rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    transform: translate(-50%, -50%);
}
.pitch-center-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    transform: translate(-50%, -50%);
}
.pitch-area-top,
.pitch-area-bottom {
    position: absolute;
    left: 15%;
    right: 15%;
    height: 16%;
    border: 2px solid rgba(255, 255, 255, 0.6);
}
.pitch-area-top {
    top: 2%;
    border-bottom: none;
    border-radius: 8px 8px 0 0;
}
.pitch-area-bottom {
    bottom: 2%;
    border-top: none;
    border-radius: 0 0 8px 8px;
}
.pitch-goal-top,
.pitch-goal-bottom {
    position: absolute;
    left: 38%;
    right: 38%;
    height: 3%;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 2px;
}
.pitch-goal-top { top: 0; }
.pitch-goal-bottom { bottom: 0; }
.pitch-player {
    position: absolute;
    width: 30px;
    height: 30px;
    background: #1e2135;
    border: 2px solid #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.55rem;
    font-weight: 900;
    color: #fff;
    transform: translate(-50%, -50%);
    cursor: default;
    transition: all 0.2s ease;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    text-align: center;
    line-height: 1;
}
.pitch-player:hover {
    transform: translate(-50%, -50%) scale(1.3);
    z-index: 10;
    border-color: var(--accent);
    box-shadow: 0 4px 16px rgba(240, 168, 48, 0.5);
}
.pitch-player.gk {
    background: #2c3e50;
    border-color: #f39c12;
    width: 34px;
    height: 34px;
    font-size: 0.6rem;
}
.pitch-player.forward { border-color: #e74c3c; }
.pitch-player.midfield { border-color: #3498db; }
.pitch-player.defender { border-color: #27ae60; }
.pitch-label {
    position: absolute;
    font-size: 0.55rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    pointer-events: none;
}

/* ============ MOBILE NAV TOGGLE ============ */
.mobile-nav-toggle {
    display: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 200;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--accent);
    color: #0f1119;
    border: none;
    font-size: 1.4rem;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    font-weight: 900;
}

/* ============ RESPONSIVE (手机/平板适配) ============ */
@media (max-width: 1024px) {
    .player-layout {
        grid-template-columns: 180px 1fr 180px;
    }
    .fm-left-nav {
        width: 160px;
        min-width: 160px;
        padding: 12px 6px;
    }
    .nav-item {
        padding: 9px 12px;
        font-size: 0.78rem;
        gap: 6px;
    }
    .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
        padding: 14px 16px;
        gap: 10px;
    }
    .panel.wide {
        grid-column: span 2;
    }
    .fm-content-grid {
        grid-template-columns: 1fr;
    }
    .fm-content-grid .panel.wide {
        grid-column: span 1;
    }
    .right-analysis {
        max-height: none;
        position: static;
        border-left: none;
        border-top: 1px solid var(--border);
    }
}

@media (max-width: 768px) {
    .fm-shell {
        flex-direction: column;
    }
    .fm-left-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        width: 100%;
        min-width: 100%;
        height: auto;
        flex-direction: row;
        justify-content: space-around;
        padding: 8px 4px;
        gap: 2px;
        z-index: 150;
        border-right: none;
        border-top: 1px solid var(--border);
        border-radius: 16px 16px 0 0;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
    }
    .club-badge {
        display: none;
    }
    .nav-item {
        flex-direction: column;
        gap: 2px;
        padding: 7px 8px;
        font-size: 0.6rem;
        border-radius: 8px;
        text-align: center;
        min-width: 48px;
        flex-shrink: 0;
    }
    .nav-item.active {
        box-shadow: inset 0 -3px 0 var(--accent);
        border-radius: 8px 8px 0 0;
    }
    .fm-main {
        padding-bottom: 70px;
    }
    .fm-topbar {
        padding: 14px 16px;
        flex-direction: column;
    }
    .fm-topbar h1 {
        font-size: 1.1rem;
    }
    .player-layout {
        grid-template-columns: 1fr;
        display: flex;
        flex-direction: column;
    }
    .player-list {
        position: static;
        max-height: none;
        border-right: none;
        border-bottom: 1px solid var(--border);
        display: flex;
        overflow-x: auto;
        gap: 4px;
        padding: 8px;
        flex-wrap: nowrap;
        -webkit-overflow-scrolling: touch;
    }
    .player-group {
        display: flex;
        flex-direction: column;
        min-width: 120px;
        flex-shrink: 0;
    }
    .player-group h3 {
        font-size: 0.65rem;
        padding: 4px 6px;
    }
    .player-row {
        font-size: 0.7rem;
        padding: 6px 8px;
    }
    .right-analysis {
        position: static;
        max-height: none;
        border-left: none;
        border-top: 1px solid var(--border);
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px;
    }
    .right-analysis .panel {
        flex: 1 1 45%;
        min-width: 150px;
    }
    .dashboard-grid {
        grid-template-columns: 1fr;
        padding: 10px 12px;
        gap: 8px;
    }
    .panel.wide {
        grid-column: span 1;
    }
    .fm-content-grid {
        grid-template-columns: 1fr;
    }
    .fm-content-grid .panel.wide {
        grid-column: span 1;
    }
    .coach-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }
    .star-card-embedded .star-name {
        font-size: 1.3rem;
    }
    .star-card-embedded .star-number {
        font-size: 3rem;
    }
    .fm-pitch {
        max-width: 100%;
        aspect-ratio: 3 / 4;
    }
    .pitch-player {
        width: 24px;
        height: 24px;
        font-size: 0.45rem;
    }
    .pitch-player.gk {
        width: 28px;
        height: 28px;
        font-size: 0.5rem;
    }
    .form-grid {
        grid-template-columns: 1fr 1fr;
        gap: 6px;
    }
    table {
        font-size: 0.68rem;
        min-width: 400px;
    }
    table th,
    table td {
        padding: 7px 8px;
    }
    .mobile-nav-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .fm-topbar h1 {
        font-size: 1rem;
    }
    .fm-topbar p {
        font-size: 0.7rem;
    }
    .ability-box {
        gap: 8px;
    }
    .ability-box div {
        padding: 8px 12px;
    }
    .ability-box strong {
        font-size: 1.2rem;
    }
    .star-card-embedded {
        padding: 14px 16px;
    }
    .star-card-embedded .star-name {
        font-size: 1.1rem;
    }
    .star-card-embedded .star-number {
        font-size: 2.4rem;
        bottom: 4px;
        right: 10px;
    }
    .coach-grid {
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
    .coach-card {
        padding: 12px 10px;
    }
    .coach-card .coach-avatar {
        width: 44px;
        height: 44px;
        font-size: 1.2rem;
    }
    .coach-card.head-coach .coach-avatar {
        font-size: 1.4rem;
    }
    .result-btn-group {
        flex-direction: column;
        gap: 4px;
    }
    .result-btn {
        text-align: center;
        width: 100%;
    }
    .form-grid {
        grid-template-columns: 1fr;
    }
    .nav-item {
        font-size: 0.55rem;
        padding: 5px 4px;
        min-width: 40px;
    }
}
