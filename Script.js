let modoAngulo = "RAD";
let esOscuro = false;
let audio = null;
let errorAudioInterval = null;

function agregarValor(valor) {
  clearErrorState();
  document.getElementById("resultado").value += valor;
}

function limpiarResultado() {
  clearErrorState();
  document.getElementById("resultado").value = "";
}

function borrarUltimo() {
  clearErrorState();
  const actual = document.getElementById("resultado").value;
  document.getElementById("resultado").value = actual.slice(0, -1);
}

function cambiarModoAngulo() {
  modoAngulo = modoAngulo === "RAD" ? "GRAD" : "RAD";
  document.getElementById("indicador-angulo").innerText = modoAngulo;
  playAudio(modoAngulo === "RAD" ? "audio/radianes.mp3" : "audio/grados.mp3");
}

function cambiarTema() {
  document.body.classList.toggle("tema-oscuro");
  esOscuro = !esOscuro;
  const botonTema = document.getElementById("boton-tema");
  botonTema.innerText = esOscuro ? "Modo claro" : "Modo oscuro";
}

function abrirManual() {
  clearErrorState();
  document.querySelector(".seccion-calculadora").classList.add("oculta");
  document.querySelector(".seccion-manual").classList.add("active");
}

function cerrarManual() {
  clearErrorState();
  document.querySelector(".seccion-manual").classList.remove("active");
  document.querySelector(".seccion-calculadora").classList.remove("oculta");
}

function calcular() {
  clearErrorState();
  let resultadoInput = document.getElementById("resultado");
  try {
    let expresion = resultadoInput.value;

    expresion = expresion
      .replace(/π/g, "Math.PI")
      .replace(/\be\b/g, "Math.E") // Evita conflictos con funciones como exp()
      .replace(/√\(([^)]+)\)/g, "Math.sqrt($1)")
      .replace(/log\(([^)]+)\)/g, "Math.log10($1)")
      .replace(/ln\(([^)]+)\)/g, "Math.log($1)")
      .replace(/%/g, "*0.01")
      .replace(/\^/g, "**")
      .replace(/(-?\d+(\.\d+)?|\([^()]*\))!/g, (match) => {
        const num = match.slice(0, -1);
        return `calcularFactorial("${num}")`;
      });

    // ✅ CORREGIDO: Manejamos las funciones trigonométricas según RAD o GRAD
    expresion = expresion.replace(/\b(sin|cos|tan|asin|acos|atan|exp)\(([^)]+)\)/g, (_, funcion, valor) => {
      let conversion;
      if (["sin", "cos", "tan"].includes(funcion)) {
        if (modoAngulo === "GRAD") {
          conversion = `Math.${funcion}((${valor}) * (Math.PI / 200))`;
        } else {
          conversion = `Math.${funcion}(${valor})`;
        }
        return conversion;
      } else if (["asin", "acos", "atan"].includes(funcion)) {
        if (modoAngulo === "GRAD") {
          return `(Math.${funcion}(${valor}) * (200 / Math.PI))`;
        } else {
          return `Math.${funcion}(${valor})`;
        }
      } else {
        return `Math.${funcion}(${valor})`;
      }
    });

    const resultado = eval(expresion);

    if (typeof resultado === "number" && !isNaN(resultado) && isFinite(resultado)) {
      resultadoInput.value = resultado;
      playAudio("audio/bueno.mp3");
    } else {
      throw new Error("Resultado no válido");
    }
  } catch (error) {
    resultadoInput.value = "Error";
    setErrorState();
  }
}

function envolverFuncion(funcion) {
  clearErrorState();
  const input = document.getElementById("resultado");
  const valor = input.value;
  input.value = `${funcion}(${valor})`;
}

function playAudio(src) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  audio = new Audio(src);
  audio.play();
}

function playErrorAudioRepeatedly() {
  if (errorAudioInterval) return;

  audio = new Audio("audio/error.mp3");
  audio.loop = true;
  audio.play();
  errorAudioInterval = setInterval(() => {
    if (audio.paused) audio.play();
  }, 2000);
}

function setErrorState() {
  const resultadoInput = document.getElementById("resultado");
  resultadoInput.classList.add("parpadeo-error");
  playErrorAudioRepeatedly();
}

function clearErrorState() {
  const resultadoInput = document.getElementById("resultado");
  resultadoInput.classList.remove("parpadeo-error");
  resultadoInput.style.color = esOscuro ? "#fff" : "#000";
  if (audio) {
    audio.pause();
    audio = null;
  }
  if (errorAudioInterval) {
    clearInterval(errorAudioInterval);
    errorAudioInterval = null;
  }
}

function calcularFactorial(n) {
  let valor;
  try {
    valor = eval(n);
  } catch {
    throw new Error("Factorial inválido");
  }

  if (valor < 0 || !Number.isInteger(valor)) {
    throw new Error("Factorial inválido");
  }

  if (valor === 0 || valor === 1) return 1;

  let resultado = 1;
  for (let i = 2; i <= valor; i++) {
    resultado *= i;
  }
  return resultado;
}

function factorial() {
  clearErrorState();
  const input = document.getElementById("resultado");
  const valor = input.value;
  input.value = `${valor}!`;
}

