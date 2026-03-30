// 1. Configuración de Gráficos (Chart.js)
const ctx = document.getElementById('financeChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Web', 'Käsestangen', 'Otros'],
        datasets: [{
            data: [12, 19, 3],
            backgroundColor: ['#4facfe', '#00f2fe', '#7117ea'],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#ffffff' } }
        }
    }
});

// 2. Lógica de Interfaz y Modo Oscuro
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    // Aquí puedes guardar la preferencia en localStorage si lo deseas
});

// 3. REGISTRO DEL SERVICE WORKER (Para permitir la instalación)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registrado con éxito:', registration.scope);
            })
            .catch(error => {
                console.log('Fallo en el registro del SW:', error);
            });
    });
}

// 4. Lógica para detectar el evento de instalación (Opcional)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Evita que el navegador muestre el banner automático demasiado rápido
    e.preventDefault();
    deferredPrompt = e;
    console.log('La app está lista para ser instalada en PC o Móvil');
});
