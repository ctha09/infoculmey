let isAdmin = false;
let currentBalance = 0;

// ==========================================
// BASE DE DATOS PERMANENTE (Edita esto aquí)
// ==========================================
const datosInicialesTesoreria = [
    { desc: "Venta de bonos", amount: 20000 },
    // Puedes agregar más líneas aquí siguiendo el mismo formato
];

const datosInicialesPrensa = [
    { fecha: "13/02/2026", texto: "Bienvenidos al portal oficial de INFOCULMEY." },
];
// ==========================================

// Función que se ejecuta al cargar la página
window.onload = function() {
    cargarDatosPermanentes();
};

function cargarDatosPermanentes() {
    const historyBody = document.getElementById('history-body');
    const newsContainer = document.getElementById('news-container');
    
    // Limpiar contenedores por si acaso
    historyBody.innerHTML = "";
    
    // Cargar Tesorería desde el código
    datosInicialesTesoreria.forEach(item => {
        currentBalance += item.amount;
        const row = `<tr>
            <td>${item.desc}</td>
            <td style="color:${item.amount >= 0 ? '#4ade80':'#f87171'}">
                ${item.amount >= 0 ? '+' : ''}${item.amount.toLocaleString('es-AR')}
            </td>
        </tr>`;
        historyBody.insertAdjacentHTML('beforeend', row);
    });
    
    actualizarDisplayDinero();

    // Cargar Prensa desde el código
    if(datosInicialesPrensa.length > 0) {
        newsContainer.innerHTML = "";
        datosInicialesPrensa.forEach(noticia => {
            const id = Math.random().toString(36).substr(2, 9);
            const post = `
                <div id="post-${id}" class="news-item">
                    <button class="del-news" onclick="deleteNews('${id}')" style="display:none">Eliminar</button>
                    <small style="color:var(--primary)">${noticia.fecha}</small>
                    <p style="margin-top:10px; line-height:1.6;">${noticia.texto.replace(/\n/g, '<br>')}</p>
                </div>`;
            newsContainer.insertAdjacentHTML('beforeend', post);
        });
    }
}

function actualizarDisplayDinero() {
    document.getElementById('money-display').innerText = `$${currentBalance.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
}

// --- Funciones de Interfaz ---

function toggleAdmin() {
    if (!isAdmin) {
        const pass = prompt("Acceso Administrador. Ingrese PIN:");
        if (pass === "031223") {
            isAdmin = true;
            actualizarInterfaz();
            alert("MODO ADMINISTRADOR ACTIVADO");
        } else {
            alert("PIN Incorrecto.");
        }
    } else {
        isAdmin = false;
        actualizarInterfaz();
        alert("MODO LECTURA ACTIVADO");
    }
}

function actualizarInterfaz() {
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? "block" : "none";
    });
    
    document.querySelectorAll('.del-news').forEach(btn => {
        btn.style.display = isAdmin ? "block" : "none";
    });

    const status = document.getElementById('status-mode');
    status.innerText = isAdmin ? "MODO EDICIÓN" : "Modo Lectura";
    status.style.color = isAdmin ? "#ffc107" : "#64748b";
}

function viewSection(section) {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('view-' + section).style.display = 'flex';
    actualizarInterfaz();
}

function showHome() {
    document.getElementById('home-screen').style.display = 'flex';
    document.getElementById('view-tesoreria').style.display = 'none';
    document.getElementById('view-prensa').style.display = 'none';
}

// --- Funciones para agregar datos en vivo (Temporales hasta recargar) ---

function addTransaction() {
    const desc = document.getElementById('trans-desc').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    
    if (desc && !isNaN(amount)) {
        currentBalance += amount;
        actualizarDisplayDinero();
        
        const row = `<tr>
            <td>${desc}</td>
            <td style="color:${amount >= 0 ? '#4ade80':'#f87171'}">
                ${amount >= 0 ? '+' : ''}${amount.toLocaleString('es-AR')}
            </td>
        </tr>`;
        
        document.getElementById('history-body').insertAdjacentHTML('afterbegin', row);
        document.getElementById('trans-desc').value = ""; 
        document.getElementById('trans-amount').value = "";
    }
}

function addNews() {
    const text = document.getElementById('news-input').value;
    if (text.trim() !== "") {
        const container = document.getElementById('news-container');
        if(container.querySelector('.empty-news')) container.innerHTML = "";
        
        const id = Date.now();
        const post = `
            <div id="post-${id}" class="news-item">
                <button class="del-news" onclick="deleteNews(${id})" style="display:${isAdmin?'block':'none'}">Eliminar</button>
                <small style="color:var(--primary)">${new Date().toLocaleDateString()}</small>
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
