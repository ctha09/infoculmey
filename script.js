// --- CONFIGURACIÓN ---
const SUPABASE_URL = 'TU_URL_ACÁ';
const SUPABASE_KEY = 'TU_KEY_ACÁ';

let _supabase;
const ADMIN_PIN = "cthainfo09";
let currentBalance = 0;
let financeChart = null;
let editIdTesoreria = null;
let editIdPrensa = null;

// --- INICIO ---
window.addEventListener('load', () => {
    // Intentar conectar
    try {
        if (typeof supabase !== 'undefined') {
            _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            fetchData();
        }
    } catch (e) { console.error("Error Supabase:", e); }

    // Quitar loader
    const bar = document.getElementById('progress-bar');
    if(bar) bar.style.width = '100%';
    
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('loader-hidden');
    }, 3000);
});

// --- OBTENER DATOS ---
async function fetchData() {
    if(!_supabase) return;
    const { data: t } = await _supabase.from('tesoreria').select('*').order('id', { ascending: true });
    const { data: p } = await _supabase.from('prensa').select('*').order('creado_at', { ascending: false });
    if(t) renderTesoreria(t);
    if(p) renderPrensa(p);
}

// --- TABLA Y ADMIN TESORERIA ---
function renderTesoreria(datos) {
    const historyBody = document.getElementById('history-body');
    const adminTesoreriaList = document.getElementById('admin-tesoreria-list');
    currentBalance = 0;
    if (historyBody) historyBody.innerHTML = "";
    if (adminTesoreriaList) adminTesoreriaList.innerHTML = "";
    
    let saldos = [0]; let etiquetas = ["Inicio"];

    datos.forEach(item => {
        const m = parseFloat(item.monto) || 0;
        currentBalance += m;
        saldos.push(currentBalance);
        etiquetas.push(item.descripcion);
        
        if (historyBody) {
            historyBody.insertAdjacentHTML('beforeend', `<tr><td>${item.descripcion}</td><td style="color:${m >= 0 ? '#4ade80':'#f87171'}">${m >= 0 ? '+' : ''}${m}</td></tr>`);
        }
        if (adminTesoreriaList) {
            adminTesoreriaList.insertAdjacentHTML('beforeend', `<div style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.05); margin-bottom:5px; border-radius:8px;">
                <span>${item.descripcion} ($${m})</span>
                <div>
                    <button onclick="prepararEdicionTesoreria(${item.id}, '${item.descripcion}', ${m})" style="background:#eab308; border:none; color:white; padding:5px; border-radius:5px;">✏️</button>
                    <button onclick="borrarRegistro('tesoreria', ${item.id})" style="background:#ef4444; border:none; color:white; padding:5px; border-radius:5px;">🗑️</button>
                </div></div>`);
        }
    });
    const d = document.getElementById('money-display');
    if(d) d.innerText = `$${currentBalance.toLocaleString('es-AR')}`;
    inicializarGrafica(etiquetas, saldos);
}

// --- PRENSA ---
function renderPrensa(noticias) {
    const newsContainer = document.getElementById('news-container');
    const adminPrensaList = document.getElementById('admin-prensa-list');
    if(newsContainer) newsContainer.innerHTML = "";
    if(adminPrensaList) adminPrensaList.innerHTML = "";

    noticias.forEach(n => {
        if(newsContainer) newsContainer.insertAdjacentHTML('beforeend', `<div class="news-item" style="margin-bottom:15px; padding:15px; background:rgba(255,255,255,0.03); border-radius:10px; border-left:4px solid #3b82f6;"><small>${n.fecha}</small><p>${n.texto}</p></div>`);
        if(adminPrensaList) {
            adminPrensaList.insertAdjacentHTML('beforeend', `<div style="padding:8px; background:rgba(255,255,255,0.05); margin-bottom:5px; border-radius:8px; display:flex; justify-content:space-between;">
                <small>${n.fecha}</small>
                <div>
                    <button onclick="prepararEdicionPrensa(${n.id}, '${n.fecha}', \`${n.texto}\`)" style="background:#eab308; border:none; color:white; padding:4px; border-radius:4px;">✏️</button>
                    <button onclick="borrarRegistro('prensa', ${n.id})" style="background:#ef4444; border:none; color:white; padding:4px; border-radius:4px;">🗑️</button>
                </div></div>`);
        }
    });
}

// --- ACCIONES ---
async function borrarRegistro(t, id) {
    if(!confirm("¿Borrar?")) return;
    await _supabase.from(t).delete().eq('id', id);
    fetchData();
}

function prepararEdicionTesoreria(id, d, m) {
    editIdTesoreria = id;
    document.getElementById('t-desc').value = d;
    document.getElementById('t-monto').value = m;
    document.getElementById('btn-t-save').innerText = "ACTUALIZAR";
}

function prepararEdicionPrensa(id, f, t) {
    editIdPrensa = id;
    document.getElementById('p-fecha').value = f;
    document.getElementById('p-texto').value = t;
    document.getElementById('btn-p-save').innerText = "ACTUALIZAR";
}

async function agregarTesoreria() {
    const d = document.getElementById('t-desc').value;
    const m = parseFloat(document.getElementById('t-monto').value);
    if(editIdTesoreria) {
        await _supabase.from('tesoreria').update({descripcion: d, monto: m}).eq('id', editIdTesoreria);
        editIdTesoreria = null;
        document.getElementById('btn-t-save').innerText = "GUARDAR";
    } else {
        await _supabase.from('tesoreria').insert([{descripcion: d, monto: m}]);
    }
    limpiar();
}

async function agregarPrensa() {
    const f = document.getElementById('p-fecha').value;
    const t = document.getElementById('p-texto').value;
    if(editIdPrensa) {
        await _supabase.from('prensa').update({fecha: f, texto: t}).eq('id', editIdPrensa);
        editIdPrensa = null;
        document.getElementById('btn-p-save').innerText = "PUBLICAR";
    } else {
        await _supabase.from('prensa').insert([{fecha: f, texto: t}]);
    }
    limpiar();
}

function limpiar() {
    document.getElementById('t-desc').value = ""; document.getElementById('t-monto').value = "";
    document.getElementById('p-fecha').value = ""; document.getElementById('p-texto').value = "";
    fetchData();
}

// --- NAVEGACIÓN ---
function verificarPin() {
    if (document.getElementById('admin-pin').value === ADMIN_PIN) {
        viewSection('admin-panel');
    } else alert("Clave mal");
}

function viewSection(s) {
    const ids = ['home-screen', 'view-tesoreria', 'view-prensa', 'view-login', 'view-admin-panel'];
    ids.forEach(id => { document.getElementById(id).style.display = 'none'; });
    document.getElementById('view-' + s || s).style.display = 'flex';
}

function showHome() { viewSection('home-screen'); }

function inicializarGrafica(e, d) {
    const ctx = document.getElementById('finance-chart');
    if (!ctx) return;
    if (financeChart) financeChart.destroy();
    financeChart = new Chart(ctx, {
        type: 'line',
        data: { labels: e, datasets: [{ data: d, borderColor: '#3b82f6', tension: 0.4 }] },
        options: { plugins: { legend: { display: false } } }
    });
}
