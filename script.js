// script.js - Actualización de Seguridad y Persistencia
const firebaseConfig = {
    apiKey: "TU_API_KEY", 
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO_ID",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicialización segura
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    var db = firebase.firestore();
    // Habilitar persistencia local (opcional para modo offline)
    db.settings({ experimentalForceLongPolling: true }); 
}
// 2. CONSTANTES Y DATOS
const categorias = ["Of Sup", "Of Jefe", "Of Sub", "Subof Sup", "Subof Sub", "Gendarme"];
const listaDocumentos = [
    { id: 1, titulo: "Reglamento de Aptitud Física GNA", desc: "Normativas y estándares de evaluación anual." },
    { id: 2, titulo: "Manual de Entrenamiento Funcional", desc: "Guía de ejercicios para el personal operativo." },
    { id: 3, titulo: "Protocolo de Pruebas de Resistencia", desc: "Instrucciones para el test de 2000 metros." },
    { id: 4, titulo: "Nutrición y Rendimiento Deportivo", desc: "Recomendaciones dietéticas para el servicio." },
    { id: 5, titulo: "Manual de Natación y Salvamento", desc: "Técnicas de rescate acuático y flotación." },
    { id: 6, titulo: "Prevención de Lesiones en Servicio", desc: "Ejercicios de movilidad y estiramiento." },
    { id: 7, titulo: "Directiva de Educación Física 2026", desc: "Cronograma oficial de actividades anuales." },
    { id: 8, titulo: "Primeros Auxilios y RCP", desc: "Protocolo de actuación ante emergencias." },
    { id: 9, titulo: "Planilla de Evaluación de Cuadros", desc: "Formulario oficial para registro de notas." },
    { id: 10, titulo: "Técnicas de Defensa Personal", desc: "Manual de procedimientos físicos de seguridad." },
    { id: 11, titulo: "Uso Progresivo de la Fuerza", desc: "Marco legal y acondicionamiento físico." },
    { id: 12, titulo: "Guía de Acondicionamiento en Montaña", desc: "Entrenamiento específico para climas extremos." }
];

let destinoAcceso = ""; // Almacena la página de destino para el login

// 3. INICIALIZACIÓN GENERAL
document.addEventListener('DOMContentLoaded', () => {
    // Renderizado de tabla de asistencia en index.html
    const cuerpo = document.getElementById('tablaCuerpo');
    if (cuerpo) {
        categorias.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-bold bg-gray-50 text-left px-4">${cat}</td>
                <td><input type="number" class="w-full text-center row-cant bg-transparent" placeholder="-" min="0" oninput="calcular(this)"></td>
                <td><input type="number" class="w-full text-center row-pres bg-transparent" placeholder="-" min="0" oninput="calcular(this)"></td>
                <td class="row-aus bg-gray-100">-</td>
                <td class="row-total font-bold bg-gray-100">-</td>
            `;
            cuerpo.appendChild(tr);
        });
    }

    // Renderizado de biblioteca en biblioteca.html
    const grid = document.getElementById('gridDocumentos');
    if (grid) {
        listaDocumentos.forEach(doc => {
            const card = document.createElement('div');
            card.className = "documento-card bg-white p-5 rounded-xl shadow hover:shadow-xl transition-all border-l-4 border-green-800 flex flex-col justify-between h-64";
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <span class="text-3xl">📄</span>
                        <span class="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded font-bold uppercase">Oficial</span>
                    </div>
                    <h3 class="font-bold text-gray-900 leading-tight mb-2">${doc.titulo}</h3>
                    <p class="text-xs text-gray-500">${doc.desc}</p>
                </div>
                <a href="#" class="mt-4 flex items-center justify-center gap-2 bg-green-800 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm">
                    📥 DESCARGAR
                </a>
            `;
            grid.appendChild(card);
        });
    }

    // Inicialización de gráficos si existen
    if (document.getElementById('chartSemanal')) {
        renderCharts();
    }

    // Manejo de parámetros URL para abrir modales automáticamente
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openModal') === 'true') openModal();
    if (urlParams.get('openLogin') === 'true') {
        destinoAcceso = urlParams.get('destino') || "estadisticas.html";
        solicitarAcceso(destinoAcceso);
    }
});

// 4. LÓGICA DE VALIDACIÓN DE IDENTIDAD (MODAL ÚNICO)
function solicitarAcceso(pagina) {
    destinoAcceso = pagina;
    const modal = document.getElementById('modalLogin');
    
    if (modal) {
        document.getElementById('loginMI').value = "";
        document.getElementById('loginCE').value = "";
        document.getElementById('loginError').classList.add('hidden');
        modal.classList.remove('hidden');
    } else {
        // Redirige al index para usar el modal centralizado si no está en la página actual
        window.location.href = `index.html?openLogin=true&destino=${pagina}`;
    }
}

function verificarAcceso() {
    const mi = document.getElementById('loginMI').value;
    const ce = document.getElementById('loginCE').value;
    
    // Credenciales autorizadas
    if ((mi === "32559315" && ce === "70965") || (mi === "30819237" && ce === "88908")) {
        window.location.href = destinoAcceso;
    } else {
        const errorMsg = document.getElementById('loginError');
        if (errorMsg) errorMsg.classList.remove('hidden');
        else alert("Acceso denegado. Datos incorrectos.");
    }
}

function closeLoginModal() {
    const modal = document.getElementById('modalLogin');
    if (modal) modal.classList.add('hidden');
}

// 5. LÓGICA DE ASISTENCIA Y CÁLCULOS
function calcular(input) {
    const fila = input.closest('tr');
    const cantidad = parseInt(fila.querySelector('.row-cant').value) || 0;
    const presente = parseInt(fila.querySelector('.row-pres').value) || 0;

    const ausente = Math.max(0, cantidad - presente);
    fila.querySelector('.row-aus').innerText = ausente === 0 ? "-" : ausente;
    fila.querySelector('.row-total').innerText = (presente + ausente) === 0 ? "-" : (presente + ausente);
    sumarTotales();
}

function sumarTotales() {
    let tCant = 0, tPres = 0, tAus = 0, tGral = 0;
    const fuerzaEfectiva = parseInt(document.getElementById('fuerzaEfectiva').value) || 0;

    document.querySelectorAll('.row-cant').forEach(i => tCant += parseInt(i.value) || 0);
    document.querySelectorAll('.row-pres').forEach(i => tPres += parseInt(i.value) || 0);
    document.querySelectorAll('.row-aus').forEach(i => {
        let val = parseInt(i.innerText);
        tAus += isNaN(val) ? 0 : val;
    });
    document.querySelectorAll('.row-total').forEach(i => {
        let val = parseInt(i.innerText);
        tGral += isNaN(val) ? 0 : val;
    });

    document.getElementById('totalCant').innerText = tCant;
    document.getElementById('totalPres').innerText = tPres;
    document.getElementById('totalAus').innerText = tAus;
    document.getElementById('totalGral').innerText = tGral;

    const labelCant = document.getElementById('totalCant');
    if (fuerzaEfectiva > 0 && tCant !== fuerzaEfectiva) {
        labelCant.classList.add('text-error');
    } else {
        labelCant.classList.remove('text-error');
    }
}

// 6. GENERACIÓN DE PDF
function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const verdeGna = [26, 58, 58];

    doc.setFontSize(18);
    doc.setTextColor(verdeGna[0], verdeGna[1], verdeGna[2]);
    doc.text("REGISTRO DE ASISTENCIA - GNA", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Unidad: ${document.getElementById('unidad').value || "-"}`, 15, 35);
    doc.text(`Instructor: ${document.getElementById('jerarquia').value || ""} ${document.getElementById('profesor').value || "-"}`, 15, 42);
    doc.text(`Fecha: ${document.getElementById('fecha').value || "-"}`, 15, 49);

    const headers = [["Categoría", "Efectivo", "Presente", "Ausente", "Total"]];
    const data = [];
    
    document.querySelectorAll('#tablaCuerpo tr').forEach(tr => {
        const row = [];
        tr.querySelectorAll('td').forEach((td, index) => {
            if (index === 1 || index === 2) row.push(td.querySelector('input').value || "0");
            else row.push(td.innerText);
        });
        data.push(row);
    });

    doc.autoTable({
        startY: 55,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: { fillStyle: verdeGna }
    });

    doc.save(`Asistencia_${document.getElementById('fecha').value || "GNA"}.pdf`);
}

// 7. PERSISTENCIA EN NUBE (FIREBASE) CON VALIDACIÓN ESTRICTA
async function guardarDatos() {
    if (!db) return alert("Firebase no configurado");
    
    // Captura de todos los campos del formulario
    const data = {
        unidad: document.getElementById('unidad').value,
        jerarquia: document.getElementById('jerarquia').value,
        profesor: document.getElementById('profesor').value,
        fecha: document.getElementById('fecha').value,
        hInicio: document.getElementById('hInicio').value,
        hFin: document.getElementById('hFin').value,
        fuerzaEfectiva: document.getElementById('fuerzaEfectiva').value,
        tema: document.getElementById('tema').value,
        novedades: document.getElementById('novedades').value,
        totalAsistentes: document.getElementById('totalGral').innerText,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Validación: Verifica que ningún campo esté vacío
    const camposVacios = Object.entries(data).filter(([key, value]) => {
        if (key === 'creadoEn' || key === 'novedades') return false; // Novedades opcional si lo prefieres, pero aquí se pide todo obligatorio
        return !value || value.toString().trim() === "" || value === "0";
    });

    // Validación específica para novedades si se requiere estrictamente
    if (!data.novedades || data.novedades.trim() === "") {
        return alert("⚠️ Todos los campos son obligatorios, incluyendo las Novedades (si no hay, escriba 'Sin novedades').");
    }

    if (camposVacios.length > 0) {
        return alert("⚠️ Por favor, complete la planilla íntegramente. Todos los campos son obligatorios para el registro.");
    }

    try {
        await db.collection("registros_clase").add(data);
        alert("✅ Registro guardado exitosamente.");
        closeModal();
        document.getElementById('formAsistencia').reset();
    } catch (e) {
        console.error("Error al guardar:", e);
        alert("❌ Error al guardar en la nube.");
    }
}

// 8. UTILIDADES DE UI
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

function openModal() { 
    const modal = document.getElementById('modalAsistencia');
    if (modal) modal.classList.remove('hidden');
    else window.location.href = "index.html?openModal=true";
}

function closeModal() { 
    const modal = document.getElementById('modalAsistencia');
    if (modal) modal.classList.add('hidden'); 
}

function filtrarDocumentos() {
    const query = document.getElementById('buscador').value.toLowerCase();
    const cards = document.querySelectorAll('.documento-card');
    cards.forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? "flex" : "none";
    });
}

// 9. GRÁFICOS (ESTADÍSTICAS)
function renderCharts() {
    const commonOptions = { responsive: true, maintainAspectRatio: false };

    new Chart(document.getElementById('chartSemanal'), {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
            datasets: [{ label: 'Clases', data: [4, 7, 5, 8, 3], backgroundColor: '#15803d' }]
        },
        options: commonOptions
    });

    new Chart(document.getElementById('chartCategorias'), {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [
                { label: 'Presentes', data: [12, 18, 30, 45, 80, 120], backgroundColor: '#15803d' },
                { label: 'Ausentes', data: [2, 4, 5, 10, 15, 20], backgroundColor: '#ef4444' }
            ]
        },
        options: { indexAxis: 'y', scales: { x: { stacked: true }, y: { stacked: true } }, ...commonOptions }
    });
}