// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = 'sb_publishable__kUv47MYA0ym6Fw7WF4c8A_jLozY3mQ';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bWNqbWpiZWR3YWZ0ZWpkZHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTI4NDksImV4cCI6MjA5MTc4ODg0OX0.Hm4zcGTr04pY13yOXQx26wR_D6GW-Ry5yiSrWTy556k';

// Variable para la instancia de Supabase
let _supabase;

// --- VARIABLES GLOBALES ---
const ADMIN_PIN = "cthainfo09";
let currentBalance = 0;
let financeChart = null;
let editIdTesoreria = null;
let editIdPrensa = null;

// --- INICIO DE LA APP ---
window.onload = () => {
    // 1. Forzar que el loader se vaya pase lo que pase tras 3 segundos
    iniciarPantallaDeCarga();
    
    // 2. Intentar inicializar Supabase
    try {
        if (typeof supabase !== 'undefined') {
            _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            fetchData(); 
        } else {
            console.error("Librería Supabase no detectada");
        }
    } catch (e) {
        console.error("Error al iniciar Supabase:", e);
    }

    chequearPlataforma();
};

// --- CARGA DE DATOS (CON SEGURIDAD) ---
async function fetchData() {
    if (!_supabase) return;
    try {
        const { data: tesoreria, error: errT } = await _supabase
            .from('tesoreria')
            .select('*')
            .order('id', { ascending: true });

        const { data: prensa, error: errP } = await _supabase
            .from('prensa')
            .select('*')
            .order('creado_at', { ascending: false });

        if (!errT && tesoreria) renderTesoreria(tesoreria);
        if (!errP && prensa) renderPrensa(prensa);
    } catch (e) {
        console.error("Fallo en la comunicación con la DB:", e);
    }
}

// --- RENDERIZADO ---
function renderTesoreria(datos) {
    const historyBody = document.getElementById('history-body');
    const adminTesoreriaList = document.getElementById('admin-tesoreria-list');
    currentBalance = 0;
    
    if (historyBody) historyBody.innerHTML = "";
    if (adminTesoreriaList) adminTesoreriaList.innerHTML = "";
    
    let historialSaldos = [0]; 
    let etiquetas = ["Inicio"]; 

    datos.forEach(item => {
        const monto = parseFloat(item.monto) || 0;
        currentBalance += monto;
        historialSaldos.push(currentBalance);
        etiquetas.push(item.descripcion);
        
        if (historyBody) {
            const row = `<tr><td>${item.descripcion}</td><td style="color:${monto >= 0 ? '#4ade80':'#f87171'}">${monto >= 0 ? '+' : ''}${monto.toLocaleString('es-AR')}</td></tr>`;
            historyBody.insertAdjacentHTML('beforeend', row);
        }

        if (adminTesoreriaList) {
            const adminItem = `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.05); margin-bottom:8px; border-radius:10px;">
                <div><span style="font-weight:bold;">${item.descripcion}</span><br><small>$${monto}</small></div>
                <div>
                    <button onclick="prepararEdicionTesoreria(${item.id}, '${item.descripcion}', ${monto})" style="background:#eab308; border:none; padding:5px 10px; border-radius:5px; color:white; cursor:pointer;">✏️</button>
                    <button onclick="borrarRegistro('tesoreria', ${item.id})" style="background:#ef4444; border:none; padding:5px 10px; border-radius:5px; color:white; cursor:pointer;">🗑️</button>
                </div></div>`;
            adminTesoreriaList.insertAdjacentHTML('beforeend', adminItem);
        }
    });
    actualizarDisplayDinero();
    inicializarGrafica(etiquetas, historialSaldos);
}

function renderPrensa(noticias) {
    const newsContainer = document.getElementById('news-container');
    const adminPrensaList = document.getElementById('admin-prensa-list');
    if(newsContainer) newsContainer.innerHTML = "";
    if(adminPrensaList) adminPrensaList.innerHTML = "";

    noticias.forEach(noticia => {
        const post = `<div class="news-item" style="margin-bottom:20px; padding:20px; background:rgba(255,255,255,0.03); border-radius:15px; border-left:4px solid #3b82f6;">
            <small style="color:#3b82f6; font-weight:bold;">${noticia.fecha}</small><p style="margin-top:10px;">${noticia.texto}</p></div>`;
        if(newsContainer) newsContainer.insertAdjacentHTML('beforeend', post);

        if(adminPrensaList) {
            const adminItem = `<div style="padding:10px; background:rgba(255,255,255,0.05); margin-bottom:10px; border-radius:10px;">
                <div style="display:flex; justify-content:space-between;">
                    <small>${noticia.fecha}</small>
                    <div>
                        <button onclick="prepararEdicionPrensa(${noticia.id}, '${noticia.fecha}', \`${noticia.texto}\`)" style="background:#eab308; border:none; padding:5px; border-radius:5px; color:white; cursor:pointer;">✏️</button>
                        <button onclick="borrarRegistro('prensa', ${noticia.id})" style="background:#ef4444; border:none; padding:5px; border-radius:5px; color:white; cursor:pointer;">🗑️</button>
                    </div>
                </div><p style="font-size:0.7rem; opacity:0.6;">${noticia.texto.substring(0,40)}...</p></div>`;
            adminPrensaList.insertAdjacentHTML('beforeend', adminItem);
        }
    });
}

// --- ACCIONES ADMIN ---
async function borrarRegistro(tabla, id) {
    if(!confirm("¿Borrar permanentemente?")) return;
    const { error } = await _supabase.from(tabla).delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
}

function prepararEdicionTesoreria(id, desc, monto) {
    editIdTesoreria = id;
    document.getElementById('t-desc').value = desc;
    document.getElementById('t-monto').value = monto;
    document.getElementById('btn-t-save').innerText = "ACTUALIZAR";
    document.getElementById('view-admin-panel').scrollTo(0,0);
}

function prepararEdicionPrensa(id, fecha, texto) {
    editIdPrensa = id;
    document.getElementById('p-fecha').value = fecha;
    document.getElementById('p-texto').value = texto;
    document.getElementById('btn-p-save').innerText = "ACTUALIZAR";
    document.getElementById('view-admin-panel').scrollTo(0,0);
}

async function agregarTesoreria() {
    const desc = document.getElementById('t-desc').value;
    const monto = document.getElementById('t-monto').value;
    if(!desc || !monto) return;
    const payload = { descripcion: desc, monto: parseFloat(monto) };
    if(editIdTesoreria) {
        await _supabase.from('tesoreria').update(payload).eq('id', editIdTesoreria);
        editIdTesoreria = null;
        document.getElementById('btn-t-save').innerText = "GUARDAR MOVIMIENTO";
    } else {
        await _supabase.from('tesoreria').insert([payload]);
    }
    limpiarYRefrescar();
}

async function agregarPrensa() {
    const fecha = document.getElementById('p-fecha').value;
    const texto = document.getElementById('p-texto').value;
    if(!fecha || !texto) return;
    const payload = { fecha: fecha, texto: texto };
    if(editIdPrensa) {
        await _supabase.from('prensa').update(payload).eq('id', editIdPrensa);
        editIdPrensa = null;
        document.getElementById('btn-p-save').innerText = "PUBLICAR NOTICIA";
    } else {
        await _supabase.from('prensa').insert([payload]);
    }
    limpiarYRefrescar();
}

function limpiarYRefrescar() {
    document.getElementById('t-desc').value = ""; document.getElementById('t-monto').value = "";
    document.getElementById('p-fecha').value = ""; document.getElementById('p-texto').value = "";
    fetchData();
}

// --- UI / NAVEGACIÓN ---
function verificarPin() {
    if (document.getElementById('admin-pin').value === ADMIN_PIN) {
        viewSection('admin-panel');
        document.getElementById('admin-pin').value = "";
    } else alert("Clave Incorrecta");
}

function viewSection(s) {
    const ids = ['home-screen', 'view-tesoreria', 'view-prensa', 'view-login', 'view-admin-panel'];
    ids.forEach(id => { if(document.getElementById(id)) document.getElementById(id).style.display = 'none'; });
    const target = document.getElementById('view-' + s) || document.getElementById(s);
    if(target) target.style.display = 'flex';
}

function showHome() { viewSection('home-screen'); }
function actualizarDisplayDinero() { 
    const d = document.getElementById('money-display');
    if(d) d.innerText = `$${currentBalance.toLocaleString('es-AR')}`;
}

// --- GRÁFICA ---
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
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// --- CARGA Y PWA ---
function iniciarPantallaDeCarga() {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('progress-bar');
    
    // Animamos la barra
    if(bar) bar.style.width = '100%';
    
    // IMPORTANTE: Quitamos el loader sí o sí a los 3 segundos
    setTimeout(() => { 
        if(loader) {
            loader.classList.add('loader-hidden');
            console.log("Loader ocultado manualmente");
        }
    }, 3000);
}

function chequearPlataforma() {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos && !window.matchMedia('(display-mode: standalone)').matches) {
        const instArea = document.getElementById('install-area');
        if(instArea) instArea.style.display = 'block';
        const btnInst = document.getElementById('btn-install-app');
        if(btnInst) btnInst.onclick = () => document.getElementById('ios-modal').style.display = 'block';
    }
}
