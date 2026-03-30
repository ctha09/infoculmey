let currentBalance = 0;
let financeChart = null;
let deferredPrompt;

// Datos actualizados: Se agregó la compra de pilas
const datosInicialesTesoreria = [
    { desc: "Fondo 2025", amount: 460550 },
    { desc: "Venta de pizzas", amount: 75000 },
    { desc: "Venta de käsestangen", amount: 29500 },
    { desc: "Gastos Web", amount: -40000 },
    { desc: "Compra de pilas para nuevas calculadoras", amount: -48452 }
];

const datosInicialesPrensa = [
    { fecha: "30/03/2026", texto: "Actualización de tesorería: Compra de insumos para calculadoras." },
    { fecha: "17/03/2026", texto: "Venta de käsestangen a las 3:45 pm" },
    { fecha: "13/02/2026", texto: "Bienvenidos al portal INFOCULMEY." }
];

window.onload = () => {
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

    if(newsContainer) {
        newsContainer.innerHTML = "";
        datosInicialesPrensa.slice().reverse().forEach(noticia => {
            const post = `<div class="news-item" style="margin-bottom:20px; padding:20px; background:rgba(255,255,255,0.03); border-radius:15px; border-left:4px solid #3b82f6;">
                <small style="color:#3b82f6; font-weight:bold;">${noticia.fecha}</small>
                <p style="margin-top:10px; line-height:1.6;">${noticia.texto}</p>
            </div>`;
            newsContainer.insertAdjacentHTML('beforeend', post);
        });
    }
}

function inicializarGrafica(etiquetas, datos) {
    const canvas = document.getElementById('finance-chart');
    if (!canvas) return;
    if (financeChart) financeChart.destroy();
    financeChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [{
                data: datos,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3b82f6',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                x: { grid: { display: false }, ticks: { color: '#64748b' } }
            }
        }
    });
}

function actualizarDisplayDinero() {
    const display = document.getElementById('money-display');
    if (display) display.innerText = `$${currentBalance.toLocaleString('es-AR')}`;
}

function viewSection(section) {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('view-' + section).style.display = 'flex';
    window.scrollTo(0,0);
}

function showHome() {
    document.getElementById('home-screen').style.display = 'flex';
    document.getElementById('view-tesoreria').style.display = 'none';
    document.getElementById('view-prensa').style.display = 'none';
}

// PWA Logic (Instalación)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-area').style.display = 'block';
});

document.getElementById('btn-install-app').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            document.getElementById('install-area').style.display = 'none';
        }
        deferredPrompt = null;
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}
