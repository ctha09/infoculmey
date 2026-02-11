<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infoculmey | Gestión Profesional</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="bg-gradient"></div>

    <header>
        <div class="credits-left">Programada por: Carlos Th. Acosta</div>
        
        <h1 class="main-title" onclick="showHome()">INFOCULMEY</h1>
        
        <div class="credits-right">Idea por Rodolfo G. Horrisberger</div>
        
        <div class="admin-access">
            <span id="status-mode">Modo Lectura</span>
            <button id="admin-btn" onclick="toggleAdmin()">🔑 Acceso</button>
        </div>
    </header>

    <main id="home-screen" class="container">
        <div class="card-option" onclick="viewSection('tesoreria')">
            <div class="card-content">
                <h2>TESORERÍA</h2>
                <p>Balances y movimientos financieros.</p>
                <span class="btn-enter">Ingresar →</span>
            </div>
        </div>
        <div class="card-option" onclick="viewSection('prensa')">
            <div class="card-content">
                <h2>PRENSA</h2>
                <p>Boletín informativo oficial.</p>
                <span class="btn-enter">Leer más →</span>
            </div>
        </div>
    </main>

    <section id="view-tesoreria" class="detail-view" style="display:none">
        <div class="glass-panel">
            <button class="back-link" onclick="showHome()">← Volver al Menú</button>
            <h2 class="section-title">Tesorería</h2>
            <div class="balance-display">
                <small>BALANCE NETO</small>
                <p id="money-display">$0,00</p>
            </div>
            <div class="admin-only admin-box">
                <h3>Cargar Movimiento</h3>
                <div class="form-group">
                    <input type="text" id="trans-desc" placeholder="Descripción">
                    <input type="number" id="trans-amount" placeholder="Monto (ej: -500)">
                    <button class="btn-save" onclick="addTransaction()">Guardar</button>
                </div>
            </div>
            <table>
                <thead><tr><th>Concepto</th><th>Importe</th></tr></thead>
                <tbody id="history-body"></tbody>
            </table>
        </div>
    </section>

    <section id="view-prensa" class="detail-view" style="display:none">
        <div class="glass-panel">
            <button class="back-link" onclick="showHome()">← Volver al Menú</button>
            <h2 class="section-title">Prensa</h2>
            <div class="admin-only admin-box">
                <h3>Nueva Publicación</h3>
                <textarea id="news-input" placeholder="Escriba aquí el comunicado..."></textarea>
                <button class="btn-save" onclick="addNews()">Publicar</button>
            </div>
            <div id="news-container"><p class="empty-news">Sin novedades.</p></div>
        </div>
    </section>

    <script src="script.js"></script>
</body>
</html>
