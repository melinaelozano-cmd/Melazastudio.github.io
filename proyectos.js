/* ==========================================================================
   MELAZA STUDIO — DATOS COMPARTIDOS
   Usado por index.html (pelotas) y proyecto.html (plantilla de cada trabajo).
   Para completar un trabajo, editá los campos de su objeto en PROJECTS.
   ========================================================================== */

/* Programas disponibles (clave → nombre + ícono) */
const TOOLS = {
  indesign:     { name: "InDesign",      image: "assets/adobe_indesign.png", blurb: "Maquetación editorial. Lo uso para dar orden a zines, libros y catálogos donde conviven ilustración, fotografía y materiales escaneados." },
  lightroom:    { name: "Lightroom",     image: "assets/adobe_lightroom.png", blurb: "Revelado y color. Lo uso para dar coherencia a las fotos de mis procesos y piezas: costura, papel, tinta y pintura." },
  photoshop:    { name: "Photoshop",     image: "assets/adobe_photoshop.png", blurb: "Retoque y collage digital. Lo uso para mezclar texturas reales —papel, tela, acuarela— y pintar encima de materiales escaneados." },
  figma:        { name: "Figma",         image: "assets/figma.png", blurb: "Diseño de interfaces. Lo uso para prototipar sitios y apps donde lo digital conserva el carácter de lo hecho a mano." },
  aftereffects: { name: "After Effects", image: "assets/adobe_after_effects.png", blurb: "Animación y motion. Lo uso para dar movimiento a ilustraciones y texturas reales digitalizadas." },
  blender:      { name: "Blender",       image: "assets/blender.png", blurb: "Modelado y animación 3D. Lo uso para sumar volumen, luz y profundidad a mis piezas." },
  illustrator:  { name: "Illustrator",   image: "assets/adobe_illustrator.png", blurb: "Ilustración vectorial. Lo uso para llevar un trazo hecho a mano a formas limpias y escalables: logos, patrones y piezas gráficas." }
};

/* Correo que recibe los mensajes del formulario de contacto (proyecto.html).
   Dejalo vacío hasta definirlo: mientras tanto el formulario avisa que falta conectarlo. */
/* ----------------------------------------------------------------------------
   FORMULARIO DE CONTACTO
   1) Poné acá el mail donde querés recibir los mensajes.
   2) El primer mensaje que se envíe hace que FormSubmit (servicio gratuito, sin
      cuenta) te mande UN mail de activación a esa casilla: abrilo y confirmá.
   3) Desde ahí, cada mensaje del formulario te llega a tu bandeja de entrada
      (revisá también spam la primera vez). Al responder, contestás directo al
      mail de quien escribió.
   ---------------------------------------------------------------------------- */
const CONTACT_EMAIL = "Melinaelozano@gmail.com";

/* WhatsApp: el link abre un chat directo con este número (formato internacional, sin "+": 54 9 + característica + número) */
const CONTACT_WHATSAPP = "5491167096336";
const CONTACT_WHATSAPP_LABEL = "+54 11 6709 6336";
const whatsappURL = (texto) => `https://wa.me/${CONTACT_WHATSAPP}` + (texto ? `?text=${encodeURIComponent(texto)}` : '');

/* HTML del formulario (lo usan proyecto.html y contacto.html) */
function contactFormHTML() {
  const chips = ['Identidad de marca', 'UX / UI', 'Diseño de producto', 'Sitio web', 'Motion Graphics', 'Otros']
    .map(t => `<label class="ct-chip"><input type="checkbox" name="interes" value="${t}"><span>${t}</span></label>`).join('');
  return `
    <fieldset class="ct-chips"><legend>¿Qué querés crear?</legend>${chips}</fieldset>
    <div class="ct-row">
      <label class="ct-f"><span>Nombre</span><input name="nombre" type="text" autocomplete="name" placeholder="Tu nombre" required></label>
      <label class="ct-f"><span>Email</span><input name="email" type="email" autocomplete="email" placeholder="tu@email.com" required></label>
    </div>
    <label class="ct-f"><span>Mensaje</span><textarea name="mensaje" rows="5" placeholder="Contame tu idea, plazos o referencias" required></textarea></label>
    <input class="ct-honey" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="ct-foot">
      <button class="ct-send" type="submit"><b>Enviar mensaje</b><i aria-hidden="true">→</i></button>
      <p class="ct-msg" role="status" aria-live="polite"></p>
    </div>`;
}

/* Envío real: POST a FormSubmit (llega por mail). Si falla la red, abre el correo del visitante. */
async function enviarContacto(form) {
  const msg = form.querySelector('.ct-msg, .cp-msg'), btn = form.querySelector('.ct-send, .cp-send');
  const say = (t, kind) => { msg.textContent = t; msg.className = 'ct-msg ' + (kind || ''); };
  if (form._honey && form._honey.value) return;                     // anti-spam (campo trampa)
  const nombre = form.nombre.value.trim(), email = form.email.value.trim(), texto = form.mensaje.value.trim();
  const intereses = [...form.querySelectorAll('input[name="interes"]:checked')].map(i => i.value).join(', ');
  if (!nombre || !/\S+@\S+\.\S+/.test(email) || !texto) { say('Completá tu nombre, un email válido y el mensaje.', 'err'); return; }
  if (!CONTACT_EMAIL) { say('Falta definir CONTACT_EMAIL en proyectos.js para recibir los mensajes.', 'err'); return; }
  btn.disabled = true; btn.classList.add('sending'); say('Enviando…');
  const files = form._files || [];                                   // imágenes opcionales (solo la página de contacto)
  try {
    const campos = {
      Nombre: nombre, Email: email, Interes: intereses || '—', Mensaje: texto,
      _subject: 'Nuevo mensaje desde el portfolio — ' + nombre, _replyto: email, _template: 'table', _captcha: 'false'
    };
    let opts;
    if (files.length) {                                              // con imágenes: multipart (FormSubmit las adjunta al mail)
      const fd = new FormData();
      Object.entries(campos).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f, i) => fd.append('imagen_' + (i + 1), f, f.name));
      opts = { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd };
    } else {
      opts = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(campos) };
    }
    const r = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CONTACT_EMAIL), opts);
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.success === false || d.success === 'false') throw new Error('envio');
    form.reset();
    say('¡Listo! Recibí tu mensaje y te respondo pronto.', 'ok');
    form.dispatchEvent(new CustomEvent('ct:sent'));
  } catch (err) {
    const body = `${texto}\n\nInterés: ${intereses || '—'}\n— ${nombre} (${email})`;
    say(files.length ? 'No pude enviarlo desde acá. Se abre tu correo: adjuntá las imágenes ahí.' : 'No pude enviarlo desde acá. Se abre tu correo para mandarlo igual.', 'err');
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Consulta desde el portfolio')}&body=${encodeURIComponent(body)}`;
  } finally {
    btn.disabled = false; btn.classList.remove('sending');
  }
}

/* Video de YouTube limpio y simple: se ve solo la imagen del proyecto con un botón de play.
   Recién al tocar play se carga el reproductor de YouTube (con el mínimo de interfaz: sin videos relacionados). */
function ytId(url) { const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/); return m ? m[1] : null; }
function ytFacade(url, poster, title) {
  const id = ytId(url);
  return id ? `<div class="yt" data-yt="${id}" data-title="${title}"><img src="${poster}" alt="" width="1600" height="900" decoding="async" loading="lazy"><button class="yt-play" type="button" aria-label="Reproducir: ${title}"></button></div>` : '';
}
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('.yt-play'); if (!b) return;
  const box = b.closest('.yt');
  /* YouTube no reproduce videos embebidos cuando la página se abre desde un archivo (file://): ahí se abre directo en YouTube.
     Con la página publicada (https) se reproduce acá mismo. */
  if (location.protocol === 'file:') { window.open('https://youtu.be/' + box.dataset.yt, '_blank', 'noopener'); return; }
  box.innerHTML = `<iframe src="https://www.youtube.com/embed/${box.dataset.yt}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&origin=${encodeURIComponent(location.origin)}" title="${box.dataset.title}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
});

/* Tamaño de las pelotas:
   la más grande mide siempre 1.28^4 veces la más chica (igual que en el diseño
   original con 5 pelotas). Las intermedias se reparten de forma exponencial,
   sin importar cuántos trabajos haya. */
const MAX_GROWTH = Math.pow(1.28, 4);
function sizeFactor(index, total) {
  return total < 2 ? 1 : Math.pow(MAX_GROWTH, index / (total - 1));
}

/* Plantilla base de un trabajo. Cada campo se puede sobrescribir luego. */
function makeProject(id, tools) {
  return {
    id,
    title: String(id),                         // número dentro de la pelota
    number: String(id).padStart(2, "0"),
    name: "Título del proyecto",
    category: "Categoría",
    year: "Año (ej. 2026)",
    client: "Nombre del cliente",
    role: "Rol en el proyecto",
    duration: "Duración (ej. 3 semanas)",
    description: "Texto provisorio: acá va la descripción general del proyecto. Contá el contexto del encargo, el objetivo que se buscaba, las decisiones de diseño más importantes y el resultado final.",
    tools,                                     // claves de TOOLS
    /* Etapas del proyecto. "text" se ve siempre; "more" se despliega al pasar el mouse
       (o al tocar en celular). Cada etapa lleva 2 imágenes con un texto descriptivo cada una. */
    process: ["Brief", "Concepto", "Desarrollo", "Resultado"].map(title => ({
      title,
      text: "Texto provisorio: describí en una o dos líneas qué se hizo en esta etapa y por qué.",
      more: "Texto provisorio ampliado: acá se despliega más información sobre la etapa. Podés contar las decisiones que se tomaron, las herramientas que se usaron, los problemas que aparecieron y cómo se resolvieron.",
      images: [
        { src: "", caption: "Texto descriptivo breve de la imagen." },
        { src: "", caption: "Texto descriptivo breve de la imagen." }
      ]
    })),
    prototype: "",                             // URL de un prototipo de Figma (solo el Proyecto 1 lo usa)
    uiKit: "",                                 // ruta de la imagen del UI Kit ("" = recuadro vacío)
    /* Rutas de las fotos. "" = círculo blanco vacío (placeholder).
       images[0] = círculo principal · images[1] = junto a la descripción */
    images: ["", ""],
    /* Galería final: 6 imágenes (3 grandes y 3 chicas, intercaladas) */
    gallery: Array(6).fill(""),
    cover: "",                                 // imagen dentro de la pelota del contenedor final ("" = placeholder)
    url: `proyecto.html?id=${id}`
  };
}

const PROJECTS = [
  makeProject(1, ["indesign", "photoshop", "illustrator"]),
  makeProject(2, ["figma"]),
  makeProject(3, ["aftereffects", "photoshop"]),
  makeProject(4, ["illustrator", "photoshop"]),
  makeProject(5, ["photoshop", "illustrator"]),
  makeProject(6, ["lightroom", "photoshop"]),
  makeProject(7, ["aftereffects", "illustrator"]),
  makeProject(8, ["illustrator", "figma"])
];

/* Prototipo interactivo de Figma: solo en el Proyecto 1 */
PROJECTS[0].prototype = "https://www.figma.com/proto/24oaxage8DduHyEdIzPkCn/TP3-INT-III?node-id=701-10572&p=f&viewport=58%2C468%2C0.05&t=Cy1DT0ky0v6DoHck-1&scaling=contain&content-scaling=fixed&starting-point-node-id=701%3A10571&show-proto-sidebar=1&page-id=701%3A10571";

/* ==========================================================================
   PROYECTO 8 — MESA (sistema POS gastronómico)
   ========================================================================== */
(function () {
  const p = PROJECTS[7];
  p.name = "Mesa";
  p.logo = "assets/mesa-logo.svg";               // logo de la marca (se muestra en la cabecera del proyecto)
  p.cover = "assets/mesa-principal.jpg";         // círculo del selector final y de la Home
  p.images[0] = "assets/mesa-principal.jpg";     // imagen hero
  p.category = "UX/UI · Sistema POS gastronómico";
  p.year = "2026";
  p.client = "—";
  p.role = "Diseño UX/UI";
  p.duration = "—";
  p.description = "Software de gestión gastronómica pensado como asistente operativo para mozos y cocineros: una terminal compartida, jerarquía visual clara, vocabulario del rubro y feedback en cada paso.";
  const stages = [
    {
      title: "Descubrir",
      text: "Investigación de campo y benchmark para entender el servicio real.",
      more: "Entrevistas a mozos y cocineros. Comparativa de Fudo (9 pasos), MaxiRest (12) y PedidosYa (3) en usabilidad, vocabulario y diseño.",
      captions: ["Benchmark de usabilidad.", "Vocabulario y diseño de la competencia."]
    },
    {
      title: "Definir",
      text: "Del problema a los requisitos: un POS como asistente, no como herramienta administrativa.",
      more: "User personas (Carlos, cocinero; Hugo, mesero) y necesidades clave: botones con verbos claros, jerarquía visual, edición rápida y feedback en cada paso.",
      captions: ["User personas.", "Necesidades y requisitos."]
    },
    {
      title: "Desarrollar",
      text: "Flujos, heurísticas de Nielsen, prototipo y pruebas de usabilidad.",
      more: "Taskflow, userflow y wireflow de las tres instancias críticas: pedido, aviso a cocina y cobro. Las pruebas mostraron que los métodos de pago concentraban la fricción.",
      captions: ["Flows del mozo y la cocina.", "Prototipo y pruebas de usabilidad."]
    },
    {
      title: "Entregar",
      text: "Prototipo final con CTAs unificados y steppers que comunican el estado.",
      more: "Fricciones convertidas en soluciones validadas: un cierre de cuenta en pocos segundos, mesas que rotan más rápido y menos estrés para el personal.",
      captions: ["Prototipo final: vista del salón.", "Prototipo final: pantalla de cobro."]
    }
  ];
  p.process = stages.map(s => ({
    title: s.title, text: s.text, more: s.more,
    images: s.captions.map(c => ({ src: "", caption: c }))
  }));
})();
