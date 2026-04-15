// --- CONFIGURACIÓN DE CONEXIÓN ---
const SUPABASE_URL = 'https://zvmcjmjbedwaftejdduu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bWNqbWpiZWR3YWZ0ZWpkZHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTI4NDksImV4cCI6MjA5MTc4ODg0OX0.Hm4zcGTr04pY13yOXQx26wR_D6GW-Ry5yiSrWTy556k';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- VARIABLES GLOBALES ---
const ADMIN_PIN = "cthainfo09"; // Tu PIN actualizado
let currentBalance = 0;
let financeChart = null;
let editIdTesoreria = null;
let editIdPrensa = null;

// --- INICIO DE LA APLICACIÓN ---
window.onload = () => {
    iniciarPantallaDeCarga();
    fetchData(); 
};

// --- CINEMÁTICA DE LA BARRA DE CARGA ---
function iniciarPantallaDeCarga() {
    const bar = document.getElementById('progress-bar');
    
    // Iniciamos el movimiento visual de la barra
    if (bar) {
        setTimeout(() => {
            bar.style.width = '100%';
        }, 100);
    }

    // Esperamos a que la barra complete su recorrido (2s en CSS) para ocultar el loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) {
            loader.classList.add('loader-hidden');
        }
    }, 2100); 
}

// --- OBTENCIÓN DE DATOS (RESTAURACIÓN DE VISTA) ---
async function fetchData() {
    try {
        const { data: tesoreria, error: errT } = await _supabase
            .from('tesoreria')
            .select('*')
            .order('id', { ascending: true });

        const { data: prensa, error: errP } = await _supabase
            .from('prensa')
            .select('*')
            .order('id', { ascending: false });

        if (errT) throw errT;
        if (errP) throw errP;

        if (tesoreria) renderTesoreria(tesoreria);
        if (prensa) renderPrensa(prensa);

    } catch (e) {
        console.error("Error al sincronizar con Supabase:", e);
    }
}

// --- RENDERIZADO DE TESORERÍA ---
function renderTesoreria(datos) {
    const historyBody = document.getElementById('history-body');
    const adminTesoreriaList = document.getElementById('admin-tesoreria-list');
    const moneyDisplay = document.getElementById('money-display');
    
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
            const row = `<tr>
                <td>${item.descripcion}</td>
                <td style="color:${monto >= 0 ? '#4ade80':'#f87171'}">
                    ${monto >= 0 ? '+' : ''}${monto.toLocaleString('es-AR')}
                </td>
            </tr>`;
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

    if (moneyDisplay) moneyDisplay.innerText = `$${currentBalance.toLocaleString('es-AR')}`;
    inicializarGrafica(etiquetas, historialSaldos);
}

// --- RENDERIZADO DE PRENSA ---
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
            const adminItem = `<div style="padding:10px; background:rgba(255,255,255,0.05); margin-bottom:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <div><small>${noticia.fecha}</small><p style="font-size:0.8rem; margin:0;">${noticia.texto.substring(0,30)}...</p></div>
                <div>
                    <button onclick="prepararEdicionPrensa(${noticia.id}, '${noticia.fecha}', \`${noticia.texto}\`)" style="background:#eab308; border:none; padding:5px; border-radius:5px; color:white; cursor:pointer;">✏️</button>
                    <button onclick="borrarRegistro('prensa', ${noticia.id})" style="background:#ef4444; border:none; padding:5px; border-radius:5px; color:white; cursor:pointer;">🗑️</button>
                </div></div>`;
            adminPrensaList.insertAdjacentHTML('beforeend', adminItem);
        }
    });
}

// --- ACCIONES DE GUARDADO ---
async function agregarTesoreria() {
    const desc = document.getElementById('t-desc').value;
    const monto = parseFloat(document.getElementById('t-monto').value);
    if(!desc || isNaN(monto)) return alert("Datos inválidos");

    try {
        if(editIdTesoreria) {
            await _supabase.from('tesoreria').update({descripcion: desc, monto: monto}).eq('id', editIdTesoreria);
            editIdTesoreria = null;
            document.getElementById('btn-t-save').innerText = "GUARDAR MOVIMIENTO";
        } else {
            await _supabase.from('tesoreria').insert([{descripcion: desc, monto: monto}]);
        }
        limpiarYRefrescar();
    } catch (e) { alert("Error al guardar en Supabase"); }
}

async function agregarPrensa() {
    const fecha = document.getElementById('p-fecha').value;
    const texto = document.getElementById('p-texto').value;
    if(!fecha || !texto) return alert("Completa los campos");

    try {
        if(editIdPrensa) {
            await _supabase.from('prensa').update({fecha: fecha, texto: texto}).eq('id', editIdPrensa);
            editIdPrensa = null;
            document.getElementById('btn-p-save').innerText = "PUBLICAR NOTICIA";
        } else {
            await _supabase.from('prensa').insert([{fecha: fecha, texto: texto}]);
        }
        limpiarYRefrescar();
    } catch (e) { alert("Error al publicar"); }
}

async function borrarRegistro(tabla, id) {
    if(!confirm("¿Eliminar permanentemente?")) return;
    await _supabase.from(tabla).delete().eq('id', id);
    fetchData();
}

function prepararEdicionTesoreria(id, desc, monto) {
    editIdTesoreria = id;
    document.getElementById('t-desc').value = desc;
    document.getElementById('t-monto').value = monto;
    document.getElementById('btn-t-save').innerText = "ACTUALIZAR";
}

function prepararEdicionPrensa(id, fecha, texto) {
    editIdPrensa = id;
    document.getElementById('p-fecha').value = fecha;
    document.getElementById('p-texto').value = texto;
    document.getElementById('btn-p-save').innerText = "ACTUALIZAR";
}

function limpiarYRefrescar() {
    document.getElementById('t-desc').value = ""; document.getElementById('t-monto').value = "";
    document.getElementById('p-fecha').value = ""; document.getElementById('p-texto').value = "";
    fetchData();
}

// --- NAVEGACIÓN ---
function verificarPin() {
    if (document.getElementById('admin-pin').value === ADMIN_PIN) {
        viewSection('admin-panel');
        document.getElementById('admin-pin').value = "";
    } else alert("PIN Incorrecto");
}

function viewSection(s) {
    const sections = ['home-screen', 'view-tesoreria', 'view-prensa', 'view-login', 'view-admin-panel'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    let targetId = s.startsWith('view-') ? s : 'view-' + s;
    let target = document.getElementById(targetId) || document.getElementById(s);
    
    if (target) {
        target.style.display = 'flex';
        window.scrollTo(0,0);
    }
}

function showHome() { viewSection('home-screen'); }

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
