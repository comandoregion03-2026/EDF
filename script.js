// script.js - Sistema de Gestión Educación Física GNA
//

// 2. CONSTANTES
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

let destinoAcceso = ""; 

// 3. INICIALIZACIÓN DE LA INTERFAZ
document.addEventListener('DOMContentLoaded', () => {
    // Renderizado de tabla de asistencia
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

    // Renderizado de biblioteca
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

    // Gráficos y Modales
    if (document.getElementById('chartSemanal')) renderCharts();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openModal') === 'true') openModal();
});

// 4. FUNCIÓN GUARDAR (CORREGIDA)
async function guardarDatos() {
    if (!db) return alert("Firebase no configurado");

    // Recopilación de datos
    const data = {
        unidad: document.getElementById('unidad').value,
        jerarquia: document.getElementById('jerarquia').value,
        profesor: document.getElementById('profesor').value,
        fecha: document.getElementById('fecha').value,
        hInicio: document.getElementById('hInicio').value,
        hFin: document.getElementById('hFin').value,
        fuerzaEfectiva: document.getElementById('fuerzaEfectiva').value,
        tema: document.getElementById('tema').value,
        novedades: document.getElementById('novedades').value || "Sin novedades",
        totalAsistentes: document.getElementById('totalGral').innerText,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Validación de campos obligatorios
    if (!data.unidad || !data.profesor || !data.fecha || !data.tema) {
        return alert("⚠️ Por favor complete los campos obligatorios (Unidad, Profesor, Fecha y Tema).");
    }

    try {
        // Guardar en Firestore
        await db.collection("registros_clase").add(data);
        
        // Mostrar notificación de éxito
        mostrarToast("✅ Registro guardado correctamente");

        // LIMPIEZA DE CAMPOS
        document.getElementById('formAsistencia').reset();
        
        // Limpiar elementos que no son inputs (celdas de la tabla)
        document.querySelectorAll('.row-aus, .row-total').forEach(td => td.innerText = "-");
        document.getElementById('totalCant').innerText = "0";
        document.getElementById('totalPres').innerText = "0";
        document.getElementById('totalAus').innerText = "0";
        document.getElementById('totalGral').innerText = "0";

        closeModal();
    } catch (e) {
        console.error("Error al guardar:", e);
        alert("❌ Error al guardar en la base de datos.");
    }
}

// 5. NOTIFICACIÓN EMERGENTE (TOAST)
function mostrarToast(mensaje) {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-900 text-white px-8 py-4 rounded-full shadow-2xl z-[2000] font-bold border-2 border-yellow-500 animate-bounce";
    toast.innerHTML = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 6. CÁLCULOS DE ASISTENCIA
function calcular(input) {
    const fila = input.closest('tr');
    const cantidad = parseInt(fila.querySelector('.row-cant').value) || 0;
    const presente = parseInt(fila.querySelector('.row-pres').value) || 0;

    const ausente = Math.max(0, cantidad - presente);
    fila.querySelector('.row-aus').innerText = ausente || "-";
    fila.querySelector('.row-total').innerText = (presente + ausente) || "-";
    sumarTotales();
}

function sumarTotales() {
    let tCant = 0, tPres = 0, tAus = 0, tGral = 0;
    document.querySelectorAll('.row-cant').forEach(i => tCant += parseInt(i.value) || 0);
    document.querySelectorAll('.row-pres').forEach(i => tPres += parseInt(i.value) || 0);
    document.querySelectorAll('.row-aus').forEach(i => tAus += parseInt(i.innerText) || 0);
    document.querySelectorAll('.row-total').forEach(i => tGral += parseInt(i.innerText) || 0);

    document.getElementById('totalCant').innerText = tCant;
    document.getElementById('totalPres').innerText = tPres;
    document.getElementById('totalAus').innerText = tAus;
    document.getElementById('totalGral').innerText = tGral;
}

// 7. UTILIDADES DE NAVEGACIÓN
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.toggle('hidden');
}

function openModal() { document.getElementById('modalAsistencia').classList.remove('hidden'); }
function closeModal() { document.getElementById('modalAsistencia').classList.add('hidden'); }

function solicitarAcceso(pagina) {
    destinoAcceso = pagina;
    document.getElementById('modalLogin').classList.remove('hidden');
}

function verificarAcceso() {
    const mi = document.getElementById('loginMI').value;
    const ce = document.getElementById('loginCE').value;
    if ((mi === "32559315" && ce === "70965") || (mi === "30819237" && ce === "88908")) {
        window.location.href = destinoAcceso;
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

function closeLoginModal() { document.getElementById('modalLogin').classList.add('hidden'); }

// 8. GRÁFICOS
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
}

async function guardarDatos() {
    if (!window.db) return alert("Firebase no configurado");

    const { collection, addDoc, serverTimestamp } = window.firestoreLib;

    const data = {
        unidad: document.getElementById('unidad').value,
        jerarquia: document.getElementById('jerarquia').value,
        profesor: document.getElementById('profesor').value,
        fecha: document.getElementById('fecha').value,
        hInicio: document.getElementById('hInicio').value,
        hFin: document.getElementById('hFin').value,
        fuerzaEfectiva: document.getElementById('fuerzaEfectiva').value,
        tema: document.getElementById('tema').value,
        novedades: document.getElementById('novedades').value || "Sin novedades",
        totalAsistentes: document.getElementById('totalGral').innerText,
        creadoEn: serverTimestamp() // Usamos la versión modular
    };

    if (!data.unidad || !data.profesor || !data.fecha || !data.tema) {
        return alert("⚠️ Por favor complete los campos obligatorios.");
    }

    try {
        // Nueva sintaxis modular: addDoc(coleccion, data)
        await addDoc(collection(window.db, "registros_clase"), data);
        
        mostrarToast("✅ Registro guardado correctamente");
        document.getElementById('formAsistencia').reset();
        
        document.querySelectorAll('.row-aus, .row-total').forEach(td => td.innerText = "-");
        ["totalCant", "totalPres", "totalAus", "totalGral"].forEach(id => document.getElementById(id).innerText = "0");

        closeModal();
    } catch (e) {
        console.error("Error al guardar:", e);
        alert("❌ Error al guardar en la base de datos.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Esperar un momento a que Firebase se inicialice
    setTimeout(() => {
        if (window.db) {
            const { collection, query, orderBy, onSnapshot } = window.firestoreLib;
            const q = query(collection(window.db, "registros_clase"), orderBy("creadoEn", "desc"));
            
            onSnapshot(q, (querySnapshot) => {
                const tbody = document.getElementById('cuerpoTablaDoc');
                tbody.innerHTML = "";
                
                if (querySnapshot.empty) {
                    tbody.innerHTML = "<tr><td colspan='6' class='p-8 text-center'>No hay registros guardados.</td></tr>";
                    return;
                }

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const tr = document.createElement('tr');
                    tr.className = "border-b hover:bg-gray-50 transition-colors";
                    tr.innerHTML = `
                        <td class="p-4 font-semibold">${data.fecha || '-'}</td>
                        <td class="p-4">${data.unidad || '-'}</td>
                        <td class="p-4">${data.jerarquia || ''} ${data.profesor || '-'}</td>
                        <td class="p-4 text-sm">${data.tema || '-'}</td>
                        <td class="p-4 text-center font-bold text-green-800">${data.totalAsistentes || '0'}</td>
                        <td class="p-4 text-xs italic text-gray-500">${data.novedades || 'Sin novedades'}</td>
                    `;
                    tbody.appendChild(tr);
                });
            });
        }
    }, 1000); 
});