// --- CONFIGURACIÓN DE ESTADO INICIAL ---
let isAdmin = false;
let currentBalance = 0;
let financeChart = null; 

// Datos iniciales incluyendo la venta solicitada
const datosInicialesTesoreria = [
    { desc: "Fondo 2025", amount: 460550 },
    { desc: "Venta de pizzas", amount: 75000 },
    { desc: "Web", amount: -40000 },
    { desc: "Venta de käsestangen", amount: 29500 } // Agregado aquí
];

const datosInicialesPrensa = [
    { fecha: "17/03/2026", texto: "Hoy se venderán käsestangen a las 3:45 pm (Primaria)" },
    { fecha: "13/02/2026", texto: "Bienvenidos al portal oficial de INFOCULMEY." }
];

window.onload = function() {
    cargarDatosPermanentes();
    iniciarPantallaDeCarga();
};

function iniciarPantallaDeCarga() {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('progress-bar');
    setTimeout(() => { if(bar) bar.style.width = '100%'; }, 100);
    setTimeout(() => { if(loader) loader.classList.add('loader-hidden'); }, 3200);
}

function cargarDatosPermanentes() {
    const historyBody = document.getElementById('history-body');
    const newsContainer = document.getElementById('news-container');
    currentBalance = 0;
    if (historyBody) historyBody.innerHTML = "";
    
    let historialSaldos = [0]; 
    let etiquetas = ["Inicio"]; 

    datosInicialesTesoreria.forEach(item => {
        currentBalance += item.amount;
        historialSaldos.push(currentBalance);
        etiquetas.push(item.desc);

        if (historyBody) {
            const row = `<tr><td>${item.desc}</td><td style="color:${item.amount >= 0 ? '#4ade80':'#f87171'}">${item.amount >= 0 ? '+' : ''}${item.amount.toLocaleString('es-AR')}</td></tr>`;
            historyBody.insertAdjacentHTML('beforeend', row);
        }
    });

    actualizarDisplayDinero();
    inicializarGrafica(etiquetas, historialSaldos);

    if(datosInicialesPrensa.length > 0 && newsContainer) {
        newsContainer.innerHTML = "";
        datosInicialesPrensa.forEach(noticia => {
            const id = Math.random().toString(36).substr(2, 9);
            const post = `<div id="post-${id}" class="news-item" style="margin-bottom:30px; padding:20px; background:rgba(255,255,255,0.03); border-radius:15px; border-left:4px solid var(--primary);">
                <button class="del-news" onclick="deleteNews('${id}')" style="display:none; float:right; background:#f87171; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Eliminar</button>
                <small style="color:var(--primary); font-weight:bold;">${noticia.fecha}</small>
                <p style="margin-top:10px; line-height:1.6;">${noticia.texto.replace(/\n/g, '<br>')}</p>
            </div>`;
            newsContainer.insertAdjacentHTML('beforeend', post);
        });
    }
}

function inicializarGrafica(etiquetas, datos) {
    const canvas = document.getElementById('finance-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (financeChart) financeChart.destroy();

    const isMobile = window.innerWidth < 768;

    let gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    financeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [{
                label: 'Saldo Acumulado',
                data: datos,
                fill: true,
                backgroundColor: gradient,
                borderColor: '#3b82f6',
                borderWidth: isMobile ? 2 : 3,
                tension: 0.4,
                pointRadius: isMobile ? 0 : 4,
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                x: { display: !isMobile, ticks: { color: '#64748b' } }
            }
        }
    });
}

function actualizarDisplayDinero() {
    const display = document.getElementById('money-display');
    if (display) display.innerText = `$${currentBalance.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
}

function toggleAdmin() {
    if (!isAdmin) {
        const pass = prompt("Acceso Administrador. Ingrese PIN:");
        if (pass === "031223") {
            isAdmin = true;
            actualizarInterfaz();
            alert("MODO ADMINISTRADOR ACTIVADO");
        } else { alert("PIN Incorrecto."); }
    } else {
        isAdmin = false;
        actualizarInterfaz();
        alert("MODO LECTURA ACTIVADO");
    }
}

function actualizarInterfaz() {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? "block" : "none");
    document.querySelectorAll('.del-news').forEach(btn => btn.style.display = isAdmin ? "block" : "none");
    const status = document.getElementById('status-mode');
    if (status) {
        status.innerText = isAdmin ? "MODO EDICIÓN" : "Modo Lectura";
        status.style.color = isAdmin ? "#ffc107" : "#64748b";
    }
}

function viewSection(section) {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('view-' + section).style.display = 'flex';
    if (section === 'tesoreria' && financeChart) financeChart.resize();
    actualizarInterfaz();
}

function showHome() {
    document.getElementById('home-screen').style.display = 'flex';
    document.getElementById('view-tesoreria').style.display = 'none';
    document.getElementById('view-prensa').style.display = 'none';
}

function addTransaction() {
    const desc = document.getElementById('trans-desc').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    if (desc && !isNaN(amount)) {
        datosInicialesTesoreria.push({ desc: desc, amount: amount });
        cargarDatosPermanentes();
        document.getElementById('trans-desc').value = ""; 
        document.getElementById('trans-amount').value = "";
    }
}

function addNews() {
    const text = document.getElementById('news-input').value;
    if (text.trim() !== "") {
        const container = document.getElementById('news-container');
        const id = Date.now();
        const post = `<div id="post-${id}" class="news-item" style="margin-bottom:30px; padding:20px; background:rgba(255,255,255,0.03); border-radius:15px; border-left:4px solid var(--primary);">
            <button class="del-news" onclick="deleteNews('${id}')" style="display:${isAdmin?'block':'none'}; float:right; background:#f87171; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Eliminar</button>
            <small style="color:var(--primary); font-weight:bold;">${new Date().toLocaleDateString()}</small>
            <p style="margin-top:10px; line-height:1.6;">${text.replace(/\n/g, '<br>')}</p>
        </div>`;
        container.insertAdjacentHTML('afterbegin', post);
        document.getElementById('news-input').value = "";
    }
}

function deleteNews(id) {
    if(confirm("¿Eliminar publicación?")) {
        const el = document.getElementById(`post-${id}`);
        if(el) el.remove();
    }
}
