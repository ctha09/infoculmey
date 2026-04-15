// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = 'https://zvmcjmjbedwaftejdduu.supabase.co'; // La Project URL que encontrás en API Settings
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bWNqbWpiZWR3YWZ0ZWpkZHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTI4NDksImV4cCI6MjA5MTc4ODg0OX0.Hm4zcGTr04pY13yOXQx26wR_D6GW-Ry5yiSrWTy556k'; // Pegá acá la Publishable key de tu foto
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// --- VARIABLES GLOBALES ---
const ADMIN_PIN = "031223";
let currentBalance = 0;
let financeChart = null;
let deferredPrompt;

// --- INICIO DE LA APP ---
window.onload = () => {
    fetchData(); // Carga datos desde la base de datos al iniciar
    iniciarPantallaDeCarga();
    chequearPlataforma();
};

// --- CARGA DE DATOS DESDE SUPABASE ---
async function fetchData() {
    // Traer datos de Tesorería (ordenados por ID para que el gráfico sea cronológico)
    const { data: tesoreria, error: errT } = await _supabase
        .from('tesoreria')
        .select('*')
        .order('id', { ascending: true });

    // Traer datos de Prensa (ordenados por fecha de creación, los más nuevos primero)
    const { data: prensa, error: errP } = await _supabase
        .from('prensa')
        .select('*')
        .order('creado_at', { ascending: false });

    if (errT) console.error("Error cargando Tesorería:", errT.message);
    else renderTesoreria(tesoreria);

    if (errP) console.error("Error cargando Prensa:", errP.message);
    else renderPrensa(prensa);
}

// --- RENDERIZADO DE TESORERÍA ---
function renderTesoreria(datos) {
    const historyBody = document.getElementById('history-body');
    currentBalance = 0;
    if (historyBody) historyBody.innerHTML = "";
    
    let historialSaldos = [0]; 
    let etiquetas = ["Inicio"]; 

    datos.forEach(item => {
        const monto = parseFloat(item.monto);
        currentBalance += monto;
        historialSaldos.push(currentBalance);
        etiquetas.push(item.descripcion);
        
        if (historyBody) {
            const row = `<tr>
                <td>${item.descripcion}</td>
                <td style="color:${monto >= 0 ? '#4ade80':'#f87171'}">
                    ${monto >= 0 ? '+' : ''}${monto.toLocaleString('es-AR')}
                </td>
            </tr>`;
            historyBody.insertAdjacentHTML('beforeend', row);
        }
    });

    actualizarDisplayDinero();
    inicializarGrafica(etiquetas, historialSaldos);
}

// --- RENDERIZADO DE PRENSA ---
function renderPrensa(noticias) {
    const newsContainer = document.getElementById('news-container');
    if(newsContainer) {
        newsContainer.innerHTML = "";
        noticias.forEach(noticia => {
            const post = `<div class="news-item" style="margin-bottom:20px; padding:20px; background:rgba(255,255,255,0.03); border-radius:15px; border-left:4px solid #3b82f6;">
                <small style="color:#3b82f6; font-weight:bold;">${noticia.fecha}</small>
                <p style="margin-top:10px; line-height:1.6;">${noticia.texto}</p>
            </div>`;
            newsContainer.insertAdjacentHTML('beforeend', post);
        });
    }
}

// --- LÓGICA DE ADMINISTRACIÓN (PIN Y CARGA) ---
function verificarPin() {
    const pinIngresado = document.getElementById('admin-pin').value;
    if (pinIngresado === ADMIN_PIN) {
        viewSection('admin-panel');
        document.getElementById('admin-pin').value = ""; 
    } else {
        alert("PIN Incorrecto");
    }
}

async function agregarTesoreria() {
    const desc = document.getElementById('t-desc').value;
    const montoInput = document.getElementById('t-monto').value;

    if (!desc || !montoInput) return alert("Completar todos los campos");

    // Limpiamos el valor por si viene con un "+" manual
    const montoLimpio = parseFloat(montoInput.replace('+', ''));

    const { error } = await _supabase
        .from('tesoreria')
        .insert([{ descripcion: desc, monto: montoLimpio }]);

    if (error) {
        alert("Error de Supabase: " + error.message);
        console.error(error);
    } else {
        alert("¡Saldo actualizado!");
        document.getElementById('t-desc').value = "";
        document.getElementById('t-monto').value = "";
        fetchData(); // Recargar datos para actualizar balance y gráfico
    }
}

async function agregarPrensa() {
    const fecha = document.getElementById('p-fecha').value;
    const texto = document.getElementById('p-texto').value;

    if (!fecha || !texto) return alert("Completar todos los campos");

    const { error } = await _supabase
        .from('prensa')
        .insert([{ fecha: fecha, texto: texto }]);

    if (error) {
        alert("Error al publicar noticia: " + error.message);
    } else {
        alert("¡Noticia publicada!");
        document.getElementById('p-fecha').value = "";
        document.getElementById('p-texto').value = "";
        fetchData();
    }
}

// --- NAVEGACIÓN Y UI ---
function viewSection(section) {
    const sections = ['home-screen', 'view-tesoreria', 'view-prensa', 'view-login', 'view-admin-panel'];
    sections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });
    
    const target = document.getElementById('view-' + section) || document.getElementById(section);
    if (target) {
        // Usamos flex para mantener el diseño centrado si es necesario
        target.style.display = (section === 'login') ? 'flex' : 'flex';
    }
    
    window.scrollTo(0,0);
}

function showHome() {
    viewSection('home-screen');
}

function actualizarDisplayDinero() {
    const display = document.getElementById('money-display');
    if (display) display.innerText = `$${currentBalance.toLocaleString('es-AR')}`;
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

function iniciarPantallaDeCarga() {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('progress-bar');
    setTimeout(() => { if(bar) bar.style.width = '100%'; }, 100);
    setTimeout(() => { if(loader) loader.classList.add('loader-hidden'); }, 3200);
}

// --- LÓGICA DE INSTALACIÓN (PWA) ---
function chequearPlataforma() {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIos && !isStandalone) {
        document.getElementById('install-area').style.display = 'block';
        document.getElementById('btn-install-app').onclick = (e) => {
            e.preventDefault();
            document.getElementById('ios-modal').style.display = 'block';
        };
    }
}

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

// SERVICE WORKER CON ACTUALIZACIÓN AUTOMÁTICA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Recarga cuando el nuevo SW está listo
                        window.location.reload(); 
                    }
                });
            });
        });
    });
}
