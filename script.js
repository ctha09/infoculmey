let isAdmin = false;
let currentBalance = 0;

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
    
    // Mostrar u ocultar botones de borrar noticias
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

function addTransaction() {
    const desc = document.getElementById('trans-desc').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    
    if (desc && !isNaN(amount)) {
        currentBalance += amount;
        document.getElementById('money-display').innerText = `$${currentBalance.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
        
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
        document.getElementById(`post-${id}`).remove();
    }
}
