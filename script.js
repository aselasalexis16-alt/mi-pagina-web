/* BASE DE DATOS EN MEMORIA LOCAL */
let users = JSON.parse(localStorage.getItem('sm_users')) || [
  { name: 'Administrador SkillMatch', email: 'admin@skillmatch.com', password: 'admin', role: 'admin' },  
  { name: 'Prof. Carlos Mendoza', email: 'carlos@test.com', password: '123', role: 'profesor', subject: 'Matemáticas y Cálculo', examScore: 90 },
  { name: 'Dra. María Gómez', email: 'maria@test.com', password: '123', role: 'profesor', subject: 'Física y Química', examScore: 85 },
  { name: 'Ing. Alejandro Silva', email: 'alejo@test.com', password: '123', role: 'profesor', subject: 'Programación y Desarrollo', examScore: 95 }
];

let bookings = JSON.parse(localStorage.getItem('sm_bookings')) || [];

let currentUser = null;
let tempRegisterData = null;

// Estado del Examen
let currentExamSubject = '';
let examQuestions = [];
let currentQuestionIdx = 0;
let selectedAnswers = [];
let examTimer = null;
let timeLeft = 900; // 15 minutos en segundos

/* BANCO DE PREGUNTAS (20 PREGUNTAS POR MATERIA) */
const questionBank = {
  'Matemáticas y Cálculo': [
    { q: "¿Cuál es la derivada de f(x) = x³ + 5x?", opts: ["3x² + 5", "3x + 5", "x² + 5", "3x²"], ans: 0 },
    { q: "¿Cuánto es el valor de lim (x->0) sin(x)/x?", opts: ["0", "1", "Infinito", "No existe"], ans: 1 },
    { q: "¿Cuál es la integral indefinida de 1/x dx?", opts: ["ln|x| + C", "e^x + C", "x² / 2", "-1/x²"], ans: 0 },
    { q: "Resuelve para x: 2x + 8 = 20", opts: ["x = 5", "x = 6", "x = 4", "x = 8"], ans: 1 },
    { q: "¿Cuál es el determinante de una matriz identidad 2x2?", opts: ["0", "1", "2", "-1"], ans: 1 },
    { q: "¿Qué representa la primera derivada de la posición respecto al tiempo?", opts: ["Aceleración", "Velocidad", "Distancia", "Fuerza"], ans: 1 },
    { q: "¿Cuál es la solución de x² - 9 = 0?", opts: ["x = 3", "x = -3", "x = ±3", "x = 81"], ans: 2 },
    { q: "¿Cuánto es cos(0)?", opts: ["0", "1", "-1", "0.5"], ans: 1 },
    { q: "¿Cómo se llama un triángulo con sus tres lados iguales?", opts: ["Isósceles", "Escaleno", "Equilátero", "Rectángulo"], ans: 2 },
    { q: "¿Cuál es la pendiente de la recta y = 4x - 7?", opts: ["-7", "4", "7", "-4"], ans: 1 },
    { q: "¿Cuál es la raíz cuadrada de 144?", opts: ["10", "11", "12", "14"], ans: 2 },
    { q: "¿A qué es igual log10(100)?", opts: ["1", "2", "10", "100"], ans: 1 },
    { q: "¿Cuál es la suma de los ángulos internos de un triángulo?", opts: ["90°", "180°", "360°", "270°"], ans: 1 },
    { q: "¿A qué es equivalente a^0 (con a ≠ 0)?", opts: ["0", "1", "a", "Infinito"], ans: 1 },
    { q: "¿Cuál es el dominio de f(x) = √(x - 3)?", opts: ["x ≥ 3", "x > 3", "x ≤ 3", "Todos los reales"], ans: 0 },
    { q: "¿Cuál es el valor aproximado de Pi?", opts: ["2.718", "3.1416", "1.618", "1.414"], ans: 1 },
    { q: "Si f(x) = 2x, ¿cuál es la función inversa f⁻¹(x)?", opts: ["x/2", "2/x", "x - 2", "-2x"], ans: 0 },
    { q: "¿Cuál es el resultado de 7!", opts: ["5040", "700", "120", "40320"], ans: 0 },
    { q: "¿Cuál es el valor absoluto de -15?", opts: ["-15", "15", "0", "1"], ans: 1 },
    { q: "¿Cuál es el área de un círculo con radio r?", opts: ["2πr", "πr²", "πd", "4πr²"], ans: 1 }
  ],
  'Física y Química': [
    { q: "¿Cuál es la Segunda Ley de Newton?", opts: ["F = m * a", "E = mc²", "PV = nRT", "F = G*(m1*m2)/r²"], ans: 0 },
    { q: "¿Cuál es el número atómico del Carbono?", opts: ["12", "6", "1", "8"], ans: 1 },
    { q: "¿A qué velocidad viaja la luz en el vacío?", opts: ["300.000 km/s", "150.000 km/s", "3.000 km/s", "1.000 km/s"], ans: 0 },
    { q: "¿Qué partícula subatómica tiene carga negativa?", opts: ["Protón", "Neutrón", "Electrón", "Quark"], ans: 2 },
    { q: "Aceleración de la gravedad estándar en la Tierra:", opts: ["9.8 m/s²", "10.5 m/s²", "8.9 m/s²", "12 m/s²"], ans: 0 },
    { q: "¿Cuál es el PH neutro de una sustancia acuosa?", opts: ["0", "7", "14", "1"], ans: 1 },
    { q: "Fórmula química del agua:", opts: ["HO2", "H2O", "CO2", "NaCl"], ans: 1 },
    { q: "¿Qué ley establece que la materia no se crea ni se destruye?", opts: ["Ley de Lavoisier", "Ley de Boyle", "Ley de Ohm", "Ley de Hooke"], ans: 0 },
    { q: "Unidad de medida de la resistencia eléctrica en el SI:", opts: ["Voltio", "Ampere", "Ohmio", "Watt"], ans: 2 },
    { q: "¿Qué gas es el más abundante en la atmósfera terrestre?", opts: ["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Hidrógeno"], ans: 1 },
    { q: "¿Qué mide un barómetro?", opts: ["Temperatura", "Presión atmosférica", "Humedad", "Viento"], ans: 1 },
    { q: "¿A cuántos grados Kelvin equivale 0° Celsius?", opts: ["273.15 K", "0 K", "-273.15 K", "100 K"], ans: 0 },
    { q: "¿Cuál es el elemento químico con símbolo 'Fe'?", opts: ["Flúor", "Hierro", "Fósforo", "Francio"], ans: 1 },
    { q: "Energía asociada al movimiento de los cuerpos:", opts: ["Energía Potencial", "Energía Cinética", "Energía Térmica", "Energía Nuclear"], ans: 1 },
    { q: "Proceso por el cual un líquido pasa a gas:", opts: ["Condensación", "Evaporación", "Sublimación", "Fusión"], ans: 1 },
    { q: "¿Qué es el trabajo mecánico en física?", opts: ["Fuerza x Distancia", "Masa x Aceleración", "Fuerza / Tiempo", "Potencia x Masa"], ans: 0 },
    { q: "¿Qué tipo de enlace comparte electrones de forma equitativa?", opts: ["Iónico", "Covalente", "Metálico", "Puente de Hidrógeno"], ans: 1 },
    { q: "Unidad de frecuencia en el Sistema Internacional:", opts: ["Joule", "Hertz", "Pascal", "Newton"], ans: 1 },
    { q: "¿Cuál es la masa molar aproximada del Oxígeno molecular (O2)?", opts: ["16 g/mol", "32 g/mol", "8 g/mol", "64 g/mol"], ans: 1 },
    { q: "¿Quién formuló la Teoría de la Relatividad?", opts: ["Isaac Newton", "Albert Einstein", "Niels Bohr", "Galileo Galilei"], ans: 1 }
  ],
  'Programación y Desarrollo': [
    { q: "¿Qué significa HTML?", opts: ["HyperText Markup Language", "HighText Machine Language", "Hyperlink Text Mode", "Home Tool Markup"], ans: 0 },
    { q: "¿Cuál es la complejidad temporal de una búsqueda binaria?", opts: ["O(n)", "O(1)", "O(log n)", "O(n²)"], ans: 2 },
    { q: "¿Qué estructura de datos opera bajo el principio LIFO?", opts: ["Cola (Queue)", "Pila (Stack)", "Lista Enlazada", "Árbol"], ans: 1 },
    { q: "¿En JavaScript, qué devuelve typeof []?", opts: ["array", "object", "null", "undefined"], ans: 1 },
    { q: "¿Qué palabra clave declara una variable de bloque inmutable en JS?", opts: ["var", "let", "const", "static"], ans: 2 },
    { q: "¿Qué método convierte una cadena de JSON a objeto JS?", opts: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.convert()"], ans: 1 },
    { q: "¿Qué comando Git clona un repositorio localmente?", opts: ["git pull", "git fetch", "git clone", "git fork"], ans: 2 },
    { q: "¿Qué es SQL?", opts: ["Structured Query Language", "Simple Quality Language", "Software Query Logic", "System Quick Link"], ans: 0 },
    { q: "¿Qué protocolo es seguro para la transferencia web de datos?", opts: ["HTTP", "HTTPS", "FTP", "SMTP"], ans: 1 },
    { q: "¿Cuál de estos NO es un lenguaje de programación?", opts: ["Python", "Java", "CSS", "C++"], ans: 2 },
    { q: "¿En CSS, qué propiedad cambia el color de fondo?", opts: ["color", "background-color", "bg-color", "fill"], ans: 1 },
    { q: "¿Para qué sirve la cláusula GROUP BY en SQL?", opts: ["Ordenar datos", "Agrupar filas con valores iguales", "Filtrar resultados", "Unir tablas"], ans: 1 },
    { q: "¿Qué es una API REST?", opts: ["Un motor de base de datos", "Una interfaz de programación de aplicaciones", "Un entorno de desarrollo", "Un compilador de JS"], ans: 1 },
    { q: "¿Cuál es la salida de 3 + '3' en JavaScript?", opts: ["6", "'33'", "NaN", "Error"], ans: 1 },
    { q: "¿Qué operador realiza comparación estricta en valor y tipo en JS?", opts: ["==", "=", "===", "!="], ans: 2 },
    { q: "¿Qué es Docker?", opts: ["Una base de datos", "Una plataforma de contenedores", "Un framework frontend", "Un editor de código"], ans: 1 },
    { q: "¿Qué concepto POO permite crear una clase a partir de otra?", opts: ["Encapsulamiento", "Polimorfismo", "Herencia", "Abstracción"], ans: 2 },
    { q: "¿Qué puerto usa por defecto el protocolo HTTP?", opts: ["443", "80", "22", "8080"], ans: 1 },
    { q: "¿Qué realiza la función Array.prototype.map()?", opts: ["Filtra elementos", "Transforma cada elemento devolviendo un nuevo arreglo", "Modifica el arreglo original", "Busca un elemento"], ans: 1 },
    { q: "¿Qué representa la palabra 'async' en JS?", opts: ["Una función que retorna una Promesa", "Una función sincrónica", "Un hilo secundario", "Un ciclo infinito"], ans: 0 }
  ],
  'Inglés y Lenguas': [
    { q: "Choose the correct option: 'She ___ to school every day.'", opts: ["go", "goes", "going", "gone"], ans: 1 },
    { q: "What is the past participle of the verb 'To Break'?", opts: ["Broke", "Breaked", "Broken", "Breaking"], ans: 2 },
    { q: "Select the synonym of 'Enormous':", opts: ["Tiny", "Huge", "Weak", "Narrow"], ans: 1 },
    { q: "Which sentence is in the Present Perfect tense?", opts: ["I am eating pizza", "I ate pizza", "I have eaten pizza", "I will eat pizza"], ans: 2 },
    { q: "Complete: 'If it rains tomorrow, we ___ the match.'", opts: ["cancel", "will cancel", "canceled", "had canceled"], ans: 1 },
    { q: "What is the antonym of 'Ancient'?", opts: ["Old", "Modern", "Historic", "Traditional"], ans: 1 },
    { q: "Choose the correct modal verb: 'You ___ wear a seatbelt while driving.'", opts: ["might", "must", "could", "would"], ans: 1 },
    { q: "What is the correct plural form of 'Child'?", opts: ["Childs", "Childrens", "Children", "Childes"], ans: 2 },
    { q: "Select the correct preposition: 'He is interested ___ learning languages.'", opts: ["on", "at", "in", "for"], ans: 2 },
    { q: "Which word is an adverb?", opts: ["Quick", "Quickly", "Quickness", "Quicker"], ans: 1 },
    { q: "Complete: 'There isn't ___ milk in the fridge.'", opts: ["some", "any", "many", "no"], ans: 1 },
    { q: "What is the comparative form of 'Bad'?", opts: ["Badder", "Worse", "Worst", "More bad"], ans: 1 },
    { q: "Choose the correct spelling:", opts: ["Accommodate", "Acomodate", "Accomodate", "Acommodate"], ans: 0 },
    { q: "What does the idiom 'Piece of cake' mean?", opts: ["Something difficult", "Something very easy", "A sweet food", "A birthday gift"], ans: 1 },
    { q: "Identify the passive voice sentence:", opts: ["The dog bit the man", "The man was bitten by the dog", "The man is biting a dog", "The dog will bite"], ans: 1 },
    { q: "Complete: 'Neither John ___ Mary came to the party.'", opts: ["or", "nor", "and", "but"], ans: 1 },
    { q: "Select the past tense of 'To Catch':", opts: ["Catched", "Caught", "Cought", "Cot"], ans: 1 },
    { q: "Which phrase expresses a suggestion?", opts: ["You must stop", "How about going to the park?", "I am sleeping", "Where are you?"], ans: 1 },
    { q: "What is the correct indirect question format: 'Where is the station?' -> 'Do you know...'", opts: ["where is the station?", "where the station is?", "where is station?", "where station is?"], ans: 1 },
    { q: "Select the sentence with correct punctuation:", opts: ["i like apples, oranges and bananas.", "I like apples, oranges, and bananas.", "I like, apples oranges and bananas", "i like apples oranges, and bananas"], ans: 1 }
  ]
};

/* CONTROL DE MODALES Y CAMPOS */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function toggleTeacherFields() {
  const role = document.getElementById('regRole').value;
  const teacherFields = document.getElementById('teacherFields');
  if (role === 'teacher') {
    teacherFields.classList.remove('hidden');
  } else {
    teacherFields.classList.add('hidden');
  }
}

/* REGISTRO Y VERIFICACIÓN DE CORREO */
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;
  const subject = document.getElementById('regSubject').value;
  const isHuman = document.getElementById('humanCaptcha').checked;

  if (!isHuman) {
    alert('Por favor marca la casilla "Soy humano" para continuar.');
    return;
  }

 tempRegisterData = { name, email, password, role, subject, examScore: 0 };

closeModal('registerModal');

if (tempRegisterData.role === 'teacher') {
    startExam(tempRegisterData.subject);
} else {
    users.push(tempRegisterData);
    localStorage.setItem('sm_users', JSON.stringify(users));
    alert('Registrado exitosamente.');
    openModal('loginModal');
}

    openModal('loginModal');
  }

/* REGISTRO Y VERIFICACIÓN DE CORREO */
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;
  const subject = document.getElementById('regSubject').value;
  const isHuman = document.getElementById('humanCaptcha').checked;

  if (!isHuman) {
    alert('Por favor marca la casilla "Soy humano" para continuar.');
    return;
  }

  tempRegisterData = { name, email, password, role, subject, examScore: 0 };

  closeModal('registerModal');

  if (tempRegisterData.role === 'teacher') {
    startExam(tempRegisterData.subject);
  } else {
    users.push(tempRegisterData);
    localStorage.setItem('sm_users', JSON.stringify(users));
    alert('Registrado exitosamente. Ahora puedes iniciar sesión.');
    openModal('loginModal');
  }
}

/* INICIO DE SESIÓN Y CAMBIO DINÁMICO DE NAVEGACIÓN */
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const found = users.find(u => u.email === email && u.password === password);

  if (!found) {
    alert('Credenciales incorrectas o el usuario no existe.');
    return;
  }

  currentUser = found;
  closeModal('loginModal');

  // Ocultar landing pública
  document.getElementById('publicView').classList.add('hidden');

  // Reemplazar barra de navegación superior
  document.getElementById('publicNav').classList.add('hidden');
  document.getElementById('userNav').classList.remove('hidden');
  document.getElementById('navUserName').textContent = currentUser.name;
  
  // Asignar etiqueta según el rol
  if (currentUser.role === 'admin') {
    document.getElementById('navUserRole').textContent = 'Administrador';
  } else if (currentUser.role === 'teacher') {
    document.getElementById('navUserRole').textContent = `Tutor (${currentUser.subject})`;
  } else {
    document.getElementById('navUserRole').textContent = 'Estudiante';
  }

  // Cargar panel correspondiente
  if (currentUser.role === 'admin') {
    document.getElementById('adminDashboard').classList.remove('hidden');
    renderAdminUsersList();
  } else if (currentUser.role === 'student') {
    document.getElementById('studentDashboard').classList.remove('hidden');
    renderTutors();
  } else {
    document.getElementById('teacherDashboard').classList.remove('hidden');
    renderTeacherPanel();
  }
}

/* CERRAR SESIÓN */
function logout() {
  currentUser = null;

  // Ocultar todos los paneles privados
  document.getElementById('studentDashboard').classList.add('hidden');
  document.getElementById('teacherDashboard').classList.add('hidden');
  document.getElementById('adminDashboard').classList.add('hidden');

  // Restaurar barra de navegación pública
  document.getElementById('userNav').classList.add('hidden');
  document.getElementById('publicNav').classList.remove('hidden');

  // Mostrar landing page
  document.getElementById('publicView').classList.remove('hidden');
}

/* INICIAR EXAMEN */
function startExam(subject) {
  currentExamSubject = subject;
  examQuestions = questionBank[subject] || questionBank['Matemáticas y Cálculo'];
  currentQuestionIdx = 0;
  selectedAnswers = new Array(20).fill(null);

  document.getElementById('examSubjectTitle').textContent = subject;
  openModal('examModal');
  renderQuestion();
  startExamTimer();
}

function renderQuestion() {
  const q = examQuestions[currentQuestionIdx];
  document.getElementById('currentQNum').textContent = currentQuestionIdx + 1;
  document.getElementById('questionText').textContent = q.q;

  const progressPercent = ((currentQuestionIdx + 1) / 20) * 100;
  document.getElementById('examProgressBar').style.width = `${progressPercent}%`;

  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';

  q.opts.forEach((optText, i) => {
    const btn = document.createElement('button');
    btn.className = `option-btn ${selectedAnswers[currentQuestionIdx] === i ? 'selected' : ''}`;
    btn.textContent = `${String.fromCharCode(65 + i)}. ${optText}`;
    btn.onclick = () => selectOption(i);
    container.appendChild(btn);
  });

  document.getElementById('nextQBtn').disabled = selectedAnswers[currentQuestionIdx] === null;
  document.getElementById('nextQBtn').textContent = currentQuestionIdx === 19 ? 'Finalizar Examen' : 'Siguiente Pregunta';
}

function selectOption(index) {
  selectedAnswers[currentQuestionIdx] = index;
  renderQuestion();
}

function nextQuestion() {
  if (currentQuestionIdx < 19) {
    currentQuestionIdx++;
    renderQuestion();
  } else {
    finishExam();
  }
}

function startExamTimer() {
  timeLeft = 900;
  updateTimerDisplay();
  
  examTimer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(examTimer);
      finishExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  document.getElementById('timerDisplay').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function finishExam() {
  clearInterval(examTimer);
  closeModal('examModal');

  let correctCount = 0;
  examQuestions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.ans) {
      correctCount++;
    }
  });

  const percentage = (correctCount / 20) * 100;
  const passed = percentage >= 60;

  const iconBox = document.getElementById('examResultIcon');
  const title = document.getElementById('examResultTitle');
  const text = document.getElementById('examResultText');

  if (passed) {
    iconBox.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 4rem;"></i>';
    title.textContent = '¡Felicidades! Examen Aprobado';
    text.textContent = `Aprobaste con ${correctCount} de 20 respuestas correctas (${percentage}%). Tu registro como tutor ha sido aprobado.`;
    
    tempRegisterData.examScore = percentage;
    users.push(tempRegisterData);
    localStorage.setItem('sm_users', JSON.stringify(users));
  } else {
    iconBox.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #ef4444; font-size: 4rem;"></i>';
    title.textContent = 'Examen No Aprobado';
    text.textContent = `Obtuviste ${correctCount} de 20 aciertos (${percentage}%). Se requiere un mínimo del 60% para registrarte como Maestro.`;
  }

  openModal('examResultModal');
}

function closeExamResult() {
  closeModal('examResultModal');
  openModal('loginModal');
}

/* RENDERING DE TUTORES Y RESERVAS */
function renderTutors() {
  const grid = document.getElementById('tutorsGrid');
  const searchVal = document.getElementById('searchTutor').value.toLowerCase();
  const subjectVal = document.getElementById('filterSubject').value;

  grid.innerHTML = '';

  const teachers = users.filter(u => u.role === 'teacher');

  const filtered = teachers.filter(t => {
    const matchName = t.name.toLowerCase().includes(searchVal) || t.subject.toLowerCase().includes(searchVal);
    const matchSubject = subjectVal === 'ALL' || t.subject === subjectVal;
    return matchName && matchSubject;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="text-muted">No se encontraron profesores disponibles con los filtros seleccionados.</p>';
    return;
  }

  filtered.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tutor-card';
    card.innerHTML = `
      <div>
        <div class="tutor-header">
          <div class="tutor-avatar">${t.name.charAt(0)}</div>
          <div>
            <h4>${t.name}</h4>
            <small class="text-muted">${t.subject}</small>
          </div>
        </div>
        <p><i class="fa-solid fa-graduation-cap"></i> Examen Técnico Aprobado</p>
        <div style="margin-top: 0.5rem;">
          <span class="tutor-score-badge">Calificación Examen: ${t.examScore}%</span>
        </div>
      </div>
      <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <span style="font-size: 0.85rem; color: var(--text-muted);">Precio Clase:</span>
          <strong>$15.000 COP</strong>
        </div>
        <button class="btn btn-primary btn-block" onclick="openBookingModal('${t.email}')">
          <i class="fa-solid fa-calendar-check"></i> Agendar Clase ($7.500 Abono)
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterTutors() {
  renderTutors();
}

let selectedTeacherForBooking = null;

function openBookingModal(teacherEmail) {
  selectedTeacherForBooking = users.find(u => u.email === teacherEmail);
  document.getElementById('bookingTutorName').textContent = selectedTeacherForBooking.name;
  document.getElementById('bookingSubject').textContent = selectedTeacherForBooking.subject;
  openModal('bookingModal');
}

function handleBookingSubmit(e) {
  e.preventDefault();
  const dateTime = document.getElementById('bookingDateTime').value;
  const paymentMethod = document.getElementById('paymentMethod').value;

  const newBooking = {
    id: Date.now(),
    studentEmail: currentUser.email,
    studentName: currentUser.name,
    teacherEmail: selectedTeacherForBooking.email,
    teacherName: selectedTeacherForBooking.name,
    subject: selectedTeacherForBooking.subject,
    dateTime: dateTime,
    depositPaid: 7500,
    totalPrice: 15000,
    status: 'Pendiente',
    paymentMethod: paymentMethod
  };

  bookings.push(newBooking);
  localStorage.setItem('sm_bookings', JSON.stringify(bookings));

  closeModal('bookingModal');
  alert('¡Abono de $7.500 COP realizado exitosamente! La solicitud de clase ha sido enviada al profesor.');
}

/* PANEL DEL TUTOR */
function renderTeacherPanel() {
  const container = document.getElementById('classRequestsList');
  container.innerHTML = '';

  const myRequests = bookings.filter(b => b.teacherEmail === currentUser.email);

  if (myRequests.length === 0) {
    container.innerHTML = '<p class="text-muted">No tienes solicitudes de clases agendadas actualmente.</p>';
    return;
  }

  myRequests.forEach(req => {
    const div = document.createElement('div');
    div.style.cssText = 'background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--border-color);';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4><i class="fa-solid fa-user-graduate"></i> Estudiante: ${req.studentName}</h4>
        <span class="tutor-score-badge" style="background:${req.status === 'Aprobada' ? '#d1fae5' : '#fef3c7'}; color:${req.status === 'Aprobada' ? '#059669' : '#b45309'};">${req.status}</span>
      </div>
      <p style="font-size:0.9rem; margin-top:0.4rem;"><strong>Fecha y Hora:</strong> ${new Date(req.dateTime).toLocaleString()}</p>
      <p style="font-size:0.9rem;"><strong>Abono Confirmado:</strong> $7.500 COP (${req.paymentMethod.toUpperCase()})</p>
      
      <div style="display:flex; gap:0.5rem; margin-top:1rem;">
        ${req.status === 'Pendiente' ? `
          <button class="btn btn-sm btn-primary" onclick="updateBookingStatus(${req.id}, 'Aprobada')">Aceptar Clase</button>
          <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="updateBookingStatus(${req.id}, 'Rechazada')">Rechazar</button>
        ` : ''}
        <button class="btn btn-sm btn-secondary" onclick="openChatWithStudent('${req.studentName}')">Enviar Mensaje</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function updateBookingStatus(bookingId, newStatus) {
  const b = bookings.find(item => item.id === bookingId);
  if (b) {
    b.status = newStatus;
    localStorage.setItem('sm_bookings', JSON.stringify(bookings));
    renderTeacherPanel();
  }
}

function openChatWithStudent(studentName) {
  const chatBox = document.getElementById('teacherChatBox');
  chatBox.innerHTML = `
    <div style="border-bottom:1px solid var(--border-color); padding-bottom:0.5rem; margin-bottom:1rem;">
      <strong>Mensajes con: ${studentName}</strong>
    </div>
    <div style="background:#d1fae5; padding:0.8rem; border-radius:8px; margin-bottom:0.5rem; font-size:0.9rem;">
      <strong>Sistema SkillMatch:</strong> El estudiante realizó el pago del abono inicial ($7.500 COP).
    </div>
    <div style="display:flex; gap:0.5rem; margin-top:1.5rem;">
      <input type="text" id="chatMsgInput" placeholder="Escribe tu mensaje o enlace de reunión..." style="flex:1; padding:0.5rem; border:1px solid var(--border-color); border-radius:6px;">
      <button class="btn btn-primary btn-sm" onclick="sendTeacherMessage()">Enviar</button>
    </div>
  `;
}

function sendTeacherMessage() {
  const input = document.getElementById('chatMsgInput');
  if (input && input.value.trim() !== '') {
    alert(`Mensaje enviado al estudiante: "${input.value}"`);
    input.value = '';
  }
}

/* FUNCIONES DEL PANEL ADMINISTRADOR */
function renderAdminUsersList() {
  const tbody = document.getElementById('adminUsersTableBody');
  const countSpan = document.getElementById('totalUsersCount');
  
  tbody.innerHTML = '';
  countSpan.textContent = users.length;

  users.forEach((u, index) => {
    const tr = document.createElement('tr');

    let extraInfo = '-';
    if (u.role === 'teacher') {
      extraInfo = `${u.subject} (Examen: ${u.examScore || 0}%)`;
    }

    let roleBadge = '';
    if (u.role === 'admin') {
      roleBadge = '<span class="badge-role admin">Administrador</span>';
    } else if (u.role === 'teacher') {
      roleBadge = '<span class="badge-role teacher">Tutor</span>';
    } else {
      roleBadge = '<span class="badge-role student">Estudiante</span>';
    }

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td>${roleBadge}</td>
      <td>${extraInfo}</td>
      <td>
        ${u.role !== 'admin' ? `
          <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="deleteUser('${u.email}')">
            <i class="fa-solid fa-user-xmark"></i> Eliminar
          </button>
        ` : '<em>Protegida</em>'}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteUser(email) {
  if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${email}?`)) {
    users = users.filter(u => u.email !== email);
    localStorage.setItem('sm_users', JSON.stringify(users));
    renderAdminUsersList();
  }
}

function clearAllUsers() {
  if (confirm('¿Quieres reiniciar la lista de usuarios a los valores predeterminados?')) {
    localStorage.removeItem('sm_users');
    location.reload();
  }
}