// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_KEY = 'TU_KEY_PUBLISHABLE';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- VARIABLES GLOBALES ---
const ADMIN_PIN = "031223";
let currentBalance = 0;
let financeChart = null;
let deferredPrompt;

// IDs para controlar el modo edición
let editIdTesoreria = null;
let editIdPrensa = null;

// --- INICIO DE LA APP ---
window.onload = () => {
    fetchData(); 
    iniciarPantallaDeCarga();
    chequearPlataforma();
};

// --- CARGA DE DATOS DESDE SUPABASE ---
async function fetchData() {
    const { data: tesoreria, error: errT } = await _supabase
        .from('tesoreria')
        .select('*')
        .order('id', { ascending: true });

    const { data: prensa, error: errP } = await _supabase
        .from('prensa')
        .select('*')
        .order('creado_at', { ascending: false });

    if (!errT) renderTesoreria(tesoreria);
    if (!errP) renderPrensa(prensa);
}

// --- RENDERIZADO DE TESORERÍA (PÚBLICO Y ADMIN) ---
function renderTesoreria(datos) {
    const historyBody = document.getElementById('history-body');
    const adminTesoreriaList = document.getElementById('admin-tesoreria-list');
    currentBalance = 0;
    
    if (historyBody) historyBody.innerHTML = "";
    if (adminTesoreriaList) adminTesoreriaList.innerHTML = "";
    
    let historialSaldos = [0]; 
    let etiquetas = ["Inicio"]; 

    datos.forEach(item => {
        const monto = parseFloat(item.monto);
        currentBalance += monto;
        historialSaldos.push(currentBalance);
        etiquetas.push(item.descripcion);
        
        // Vista pública (Tabla)
        if (historyBody) {
            const row = `<tr>
                <td>${item.descripcion}</td>
                <td style="color:${monto >= 0 ? '#4ade80':'#f87171'}">
                    ${monto >= 0 ? '+' : ''}${monto.toLocaleString('es-AR')}
                </td>
            </tr>`;
            historyBody.insertAdjacentHTML('beforeend', row);
        }

        // Vista Admin (Lista con botones)
        if (adminTesoreriaList) {
            const adminItem = `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.05); margin-bottom:8px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:bold; font-size:0.9rem;">${item.descripcion}</span>
                        <small style="color:${monto >= 0 ? '#4ade80':'#f87171'}">$${monto.toLocaleString('es-AR')}</small>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="prepararEdicionTesoreria(${item.id}, '${item.descripcion}', ${monto})" style="background:#eab308; border:none; color:white; padding:8px; border-radius:8px; cursor:pointer;">✏️</button>
                        <button onclick="borrarRegistro('tesoreria', ${item.id})" style="background:#ef4444; border:none; color:white; padding:8px; border-radius:8px; cursor:pointer;">🗑️</button>
                    </div>
                </div>`;
            adminTesoreriaList.insertAdjacentHTML('beforeend', adminItem);
        }
    });

    actualizarDisplayDinero();
    inicializarGrafica(etiquetas, historialSaldos);
}

// --- RENDERIZADO DE PRENSA (PÚBLICO Y ADMIN) ---
function renderPrensa(noticias) {
    const newsContainer = document.getElementById('news-container');
    const adminPrensaList = document.getElementById('admin-prensa-list');
    
    if(newsContainer) newsContainer.innerHTML = "";
    if(adminPrensaList) adminPrensaList.innerHTML = "";

    noticias.forEach(noticia => {
        // Vista pública
        const post = `<div class="news-item" style="margin-bottom:20px; padding:20px; background:rgba(255,255,255,0.03); border-radius:15px; border-left:4px solid #3b82f6;">
            <small style="color:#3b82f6; font-weight:bold;">${noticia.fecha}</small>
            <p style="margin-top:10px; line-height:1.6;">${noticia.texto}</p>
        </div>`;
        if(newsContainer) newsContainer.insertAdjacentHTML('beforeend', post);

        // Vista Admin
        if(adminPrensaList) {
            const adminItem = `
                <div style="padding:12px; background:rgba(255,255,255,0.05); margin-bottom:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <small style="color:#3b82f6; font-weight:bold;">${noticia.fecha}</small>
                        <div style="display:flex; gap:5px;">
                            <button onclick="prepararEdicionPrensa(${noticia.id}, '${noticia.fecha}', \`${noticia.texto}\`)" style="background:#eab308; border:none; color:white; padding:6px; border-radius:6px; cursor:pointer;">✏️</button>
                            <button onclick="borrarRegistro('prensa', ${noticia.id})" style="background:#ef4444; border:none; color:white; padding:6px; border-radius:6px; cursor:pointer;">🗑️</button>
                        </div>
                    </div>
                    <p style="font-size:0.8rem; opacity:0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${noticia.texto}</p>
                </div>`;
            adminPrensaList.insertAdjacentHTML('beforeend', adminItem);
        }
    });
}

// --- FUNCIONES DE ACCIÓN (BORRAR / EDITAR) ---

async function borrarRegistro(tabla, id) {
    if(!confirm("¿Seguro que querés eliminar este registro permanentemente?")) return;
    const { error } = await _supabase.from(tabla).delete().eq('id', id);
    if (error) alert("Error al borrar: " + error.message);
    else fetchData();
}

function prepararEdicionTesoreria(id, desc, monto) {
    editIdTesoreria = id;
    document.getElementById('t-desc').value = desc;
    document.getElementById('t-monto').value = monto;
    document.getElementById('btn-t-save').innerText = "ACTUALIZAR MOVIMIENTO";
    document.getElementById('btn-t-save').style.background = "#eab308";
    window.scrollTo(0,0);
}

function prepararEdicionPrensa(id, fecha, texto) {
    editIdPrensa = id;
    document.getElementById('p-fecha').value = fecha;
    document.getElementById('p-texto').value = texto;
    document.getElementById('btn-p-save').innerText = "ACTUALIZAR NOTICIA";
    document.getElementById('btn-p-save').style.background = "#eab308";
    window.scrollTo(0,0);
}

// --- GUARDADO / ACTUALIZACIÓN ---

async function agregarTesoreria() {
    const desc = document.getElementById('t-desc').value;
    const monto = document.getElementById('t-monto').value;
    if (!desc || !monto) return alert("Completa los campos");

    const payload = { descripcion: desc, monto: parseFloat(monto) };

    if (editIdTesoreria) {
        const { error } = await _supabase.from('tesoreria').update(payload).eq('id', editIdTesoreria);
        if (error) alert(error.message);
        editIdTesoreria = null;
        document.getElementById('btn-t-save').innerText = "GUARDAR MOVIMIENTO";
        document.getElementById('btn-t-save').style.background = "#22c55e";
    } else {
        const { error } = await _supabase.from('tesoreria').insert([payload]);
        if (error) alert(error.message);
    }
    limpiarCampos();
    fetchData();
}

async function agregarPrensa() {
    const fecha = document.getElementById('p-fecha').value;
    const texto = document.getElementById('p-texto').value;
    if (!fecha || !texto) return alert("Completa los campos");

    const payload = { fecha: fecha, texto: texto };

    if (editIdPrensa) {
        const { error } = await _supabase.from('prensa').update(payload).eq('id', editIdPrensa);
        if (error) alert(error.message);
        editIdPrensa = null;
        document.getElementById('btn-p-save').innerText = "PUBLICAR NOTICIA";
        document.getElementById('btn-p-save').style.background = "#3b82f6";
    } else {
        const { error } = await _supabase.from('prensa').insert([payload]);
        if (error) alert(error.message);
    }
    limpiarCampos();
    fetchData();
}

function limpiarCampos() {
    document.getElementById('t-desc').value = "";
    document.getElementById('t-monto').value = "";
    document.getElementById('p-fecha').value = "";
    document.getElementById('p-texto').value = "";
}

// --- NAVEGACIÓN Y PIN ---

function verificarPin() {
    if (document.getElementById('admin-pin').value === ADMIN_PIN) {
        viewSection('admin-panel');
        document.getElementById('admin-pin').value = "";
    } else alert("PIN Incorrecto");
}

function viewSection(section) {
    const ids = ['home-screen', 'view-tesoreria', 'view-prensa', 'view-login', 'view-admin-panel'];
    ids.forEach(id => { if(document.getElementById(id)) document.getElementById(id).style.display = 'none'; });
    const target = document.getElementById('view-' + section) || document.getElementById(section);
    if(target) target.style.display = 'flex';
}

function showHome() { viewSection('home-screen'); }

function actualizarDisplayDinero() {
    const display = document.getElementById('money-display');
    if (display) display.innerText = `$${currentBalance.toLocaleString('es-AR')}`;
}

// --- GRÁFICA Y CARGA ---

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
                pointRadius: 4
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

// --- PWA LOGIC ---
function chequearPlataforma() {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos && !window.matchMedia('(display-mode: standalone)').matches) {
        document.getElementById('install-area').style.display = 'block';
        document.getElementById('btn-install-app').onclick = () => document.getElementById('ios-modal').style.display = 'block';
    }
}
