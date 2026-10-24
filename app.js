// 1. CONFIGURACIÓN FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyB8Co7NZdYnpWfIEclFnAdwUGs-3jF88y0",
  authDomain: "chatbtox.firebaseapp.com",
  projectId: "chatbtox",
  storageBucket: "chatbtox.firebasestorage.app",
  messagingSenderId: "39237371874",
  appId: "1:39237371874:web:64ae19fbfa72701b72dbbb"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. CONFIGURACIÓN DE ACCESO Y USUARIOS
const CODIGO_SECRETO = "2026";
const USUARIOS_VALIDOS = {
  "Edward": "160923",
  "navidad": "160923"
};

let miUsuario = localStorage.getItem('chat_usuario') || "";
let miFoto = localStorage.getItem('chat_foto') || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";

// ==========================================
// MENSAJE DE RESPALDO DE LA IA
// ==========================================
function consultarGeminiReal() {
  const aiInput = document.getElementById('ai-input');
  const aiMessagesBox = document.getElementById('ai-messages');
  
  if (!aiInput || !aiMessagesBox) return;
  const texto = aiInput.value.trim();
  if (texto === "") return;

  // 1. Mostrar mensaje del usuario inmediatamente
  const userDiv = document.createElement('div');
  userDiv.className = 'msg-group user';
  userDiv.innerHTML = `<div class="msg-bubble">${texto}<span class="msg-time">Ahora</span></div>`;
  aiMessagesBox.appendChild(userDiv);

  aiInput.value = ''; // Limpia el input al instante
  aiMessagesBox.scrollTop = aiMessagesBox.scrollHeight;

  // 2. Indicador de "Escribiendo..."
  const typingId = 'typing-' + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.className = 'msg-group bot';
  typingDiv.id = typingId;
  typingDiv.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-robot" style="color:#818cf8;"></i></div>
    <div class="msg-bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  aiMessagesBox.appendChild(typingDiv);
  aiMessagesBox.scrollTop = aiMessagesBox.scrollHeight;

  // 3. Respuesta con el mensaje técnico solicitado tras un breve retraso
  setTimeout(() => {
    document.getElementById(typingId)?.remove();

    const respuestaTexto = "Estamos teniendo problemas técnicos y pronto se va a restablecer la conexión con la IA.";

    const botDiv = document.createElement('div');
    botDiv.className = 'msg-group bot';
    botDiv.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid fa-robot" style="color:#818cf8;"></i></div>
      <div class="msg-bubble">${respuestaTexto}<span class="msg-time">Ahora</span></div>
    `;
    aiMessagesBox.appendChild(botDiv);
    aiMessagesBox.scrollTop = aiMessagesBox.scrollHeight;
  }, 600);
}

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
function iniciarApp() {
  const aiView = document.getElementById('ai-view');
  const loginScreen = document.getElementById('login-screen');
  const secretChatScreen = document.getElementById('secret-chat-screen');
  const modalSettings = document.getElementById('modal-settings');

  const btnSettings = document.getElementById('btn-settings');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnDevOptions = document.getElementById('btn-dev-options');
  const devInputZone = document.getElementById('dev-input-zone');
  const btnVerifyCode = document.getElementById('btn-verify-code');
  const devCodeInput = document.getElementById('dev-code');

  const btnLoginSubmit = document.getElementById('btn-login-submit');
  const btnBackAi = document.getElementById('btn-back-ai');
  const btnLock = document.getElementById('btn-lock');

  // Ajustes y Modales
  if (btnSettings) btnSettings.onclick = () => modalSettings.classList.remove('hidden');
  if (btnCloseModal) btnCloseModal.onclick = () => {
    modalSettings.classList.add('hidden');
    devInputZone.classList.add('hidden');
    devCodeInput.value = '';
  };

  if (btnDevOptions) btnDevOptions.onclick = () => devInputZone.classList.toggle('hidden');

  if (btnVerifyCode) btnVerifyCode.onclick = () => {
    if (devCodeInput.value === CODIGO_SECRETO) {
      modalSettings.classList.add('hidden');
      aiView.classList.add('hidden');
      devInputZone.classList.add('hidden');
      devCodeInput.value = '';
      loginScreen.classList.remove('hidden');
    } else {
      alert("PIN de desarrollador incorrecto.");
    }
  };

  // Login de Usuarios
  if (btnLoginSubmit) btnLoginSubmit.onclick = () => {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (USUARIOS_VALIDOS[user] && USUARIOS_VALIDOS[user] === pass) {
      miUsuario = user;
      localStorage.setItem('chat_usuario', miUsuario);
      loginScreen.classList.add('hidden');
      secretChatScreen.classList.remove('hidden');
      document.getElementById('my-avatar-img').src = miFoto;
      document.getElementById('user-display-name').innerText = `Hola, ${miUsuario}`;
      cargarMensajesEnTiempoReal();
    } else {
      alert("Usuario o contraseña incorrectos.");
    }
  };

  if (btnBackAi) btnBackAi.onclick = () => {
    loginScreen.classList.add('hidden');
    aiView.classList.remove('hidden');
  };

  if (btnLock) btnLock.onclick = () => {
    secretChatScreen.classList.add('hidden');
    aiView.classList.remove('hidden');
  };

  // Fotos de Perfil
  const btnChangePhoto = document.getElementById('btn-change-photo');
  const myAvatarImg = document.getElementById('my-avatar-img');

  function cambiarFoto() {
    const url = prompt("Pega la URL de tu nueva foto de perfil:", miFoto);
    if (url && url.trim() !== "") {
      miFoto = url.trim();
      localStorage.setItem('chat_foto', miFoto);
      myAvatarImg.src = miFoto;
    }
  }

  if (btnChangePhoto) btnChangePhoto.onclick = cambiarFoto;
  if (myAvatarImg) myAvatarImg.onclick = cambiarFoto;

  // BOTÓN E INPUT DE LA IA (ENLACE DIRECTO)
  const aiSendBtn = document.getElementById('ai-send');
  const aiInput = document.getElementById('ai-input');

  if (aiSendBtn) {
    aiSendBtn.onclick = (e) => {
      e.preventDefault();
      consultarGeminiReal();
    };
  }

  if (aiInput) {
    aiInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        consultarGeminiReal();
      }
    };
  }

  // ==========================================
  // CHAT PRIVADO EN TIEMPO REAL (FIREBASE)
  // ==========================================
  const secretSendBtn = document.getElementById('secret-send');
  const secretInput = document.getElementById('secret-input');

  function enviarMensajeReal() {
    if (!secretInput) return;
    const txt = secretInput.value.trim();
    if (!txt) return;

    db.collection('mensajes').add({
      texto: txt,
      autor: miUsuario,
      foto: miFoto,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      secretInput.value = '';
    });
  }

  if (secretSendBtn) {
    secretSendBtn.onclick = (e) => {
      e.preventDefault();
      enviarMensajeReal();
    };
  }

  if (secretInput) {
    secretInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        enviarMensajeReal();
      }
    };
  }
}

// Ejecutar inmediatamente al cargar el script
iniciarApp();

function cargarMensajesEnTiempoReal() {
  const secretBox = document.getElementById('secret-messages');
  if (!secretBox) return;

  db.collection('mensajes')
    .orderBy('timestamp', 'asc')
    .onSnapshot((snapshot) => {
      secretBox.innerHTML = '';
      snapshot.forEach((doc) => {
        const m = doc.data();
        const esMio = m.autor === miUsuario;
        const avatar = m.foto || "https://via.placeholder.com/35";
        
        secretBox.innerHTML += `
          <div class="msg-group ${esMio ? 'user' : 'bot'}">
            <img class="msg-avatar" src="${avatar}" style="border-radius:50%; object-fit:cover;">
            <div class="msg-bubble">
              <small style="display:block; font-size:0.65em; opacity:0.7; margin-bottom:2px;">${m.autor}</small>
              ${m.texto}
            </div>
          </div>
        `;
      });
      secretBox.scrollTop = secretBox.scrollHeight;
    });
}