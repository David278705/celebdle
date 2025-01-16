export default {
  es: {
    // Títulos, labels, textos...
    gameTitle: "Celebdle",
    questionIconAlt: "Icono de Pregunta",
    rulesModalTitle: "Reglas del juego",
    rulesList: [
      "🎮 Regla 1: Solo puedes jugar una vez al día.",
      "🕵️‍♂️ Regla 2: Tienes 6 pistas (4 de texto, 1 de audio, 1 de imagen).",
      "🏆 Regla 3: Intenta adivinar a la celebridad antes de agotar las pistas.",
    ],
    placeholderGuess: "¿Quién crees que es?",
    guessButton: "Adivinar",
    skipButton: "Saltar",
    closeButton: "Cerrar",
    landingTitle: "¡Bienvenido a Celebdle!",
    landingTitleWelcome: "¡Bienvenido a ",
    // Sección de estadísticas
    statsTitle: "ESTADÍSTICAS",
    statsFoundLabel: "Encontrado",
    statsCurrentStreakLabel: "Racha actual",
    statsMaxStreakLabel: "Racha máxima",
    statsCloseButton: "Cerrar",
    // Si deseas traducir la "X" por otra cosa, o dejarla igual
    statsXLabel: "X",
    landingDescription:
      "Adivina la celebridad del día con pistas generadas por IA y compite contra tus amigos para ver quién acierta más rápido.",
    landingPlayButton: "¡Comienza a jugar!",
    poweredBy: "powered by",

    // ====== FOOTER keys (nuevas) ======
    footerCopyright(year) {
      return `© ${year} Celebdle. Todos los derechos reservados.`;
    },
    footerTerms: "Términos y Condiciones",
    footerPrivacy: "Política de Privacidad",
    footerCookies: "Política de Cookies",
    footerDmca: "Créditos / DMCA",

    // Clue label dinámico
    clueLabel(index) {
      return `Pista ${index + 1} ${
        index + 1 <= 4
          ? "(Texto)"
          : index + 1 == 5
          ? "(Audio Entrevista)"
          : "(Imagen Borrosa)"
      }`;
    },

    // Mensajes de resultado
    correctAnswer(name) {
      return `¡Correcto! Era "${name}"`;
    },
    wrongAnswer(name) {
      return `Se acabaron las pistas o adivinaste mal. La respuesta era "${name}".`;
    },
    attemptsLabel(attempts) {
      return `Te tomó ${attempts} intento(s)/acción(es).`;
    },
    nextCelebrityTimer(time) {
      return `La próxima celebridad llegará en ${time}.`;
    },
  },

  en: {
    gameTitle: "Celebdle",
    questionIconAlt: "Question Mark Icon",
    rulesModalTitle: "Game Rules",
    rulesList: [
      "🎮 Rule 1: You can only play once a day.",
      "🕵️‍♂️ Rule 2: You have 6 clues (4 text, 1 audio, 1 image).",
      "🏆 Rule 3: Try to guess the celebrity before you run out of clues.",
    ],
    placeholderGuess: "Who do you think it is?",
    guessButton: "Guess",
    skipButton: "Skip",
    closeButton: "Close",
    landingTitle: "Welcome to Celebdle!",
    landingTitleWelcome: "Welcome to",
    landingDescription:
      "Guess the celebrity of the day with AI-generated clues and compete against your friends to see who can guess faster.",
    landingPlayButton: "Start playing!",
    poweredBy: "powered by",
    statsTitle: "STATISTICS",
    statsFoundLabel: "Found",
    statsCurrentStreakLabel: "Current Streak",
    statsMaxStreakLabel: "Max Streak",
    statsCloseButton: "Close",
    statsXLabel: "X",

    // ====== FOOTER keys (nuevas) ======
    footerCopyright(year) {
      return `© ${year} Celebdle. All rights reserved.`;
    },
    footerTerms: "Terms & Conditions",
    footerPrivacy: "Privacy Policy",
    footerCookies: "Cookies Policy",
    footerDmca: "Credits / DMCA",

    // Clue label dinámico
    clueLabel(index) {
      return `Clue ${index + 1} ${
        index + 1 <= 4
          ? "(Text)"
          : index + 1 == 5
          ? "(Interview Audio)"
          : "(Blurred Image)"
      }`;
    },

    // Mensajes de resultado
    correctAnswer(name) {
      return `Correct! It was "${name}"`;
    },
    wrongAnswer(name) {
      return `You're out of clues or guessed incorrectly. The answer was "${name}".`;
    },
    attemptsLabel(attempts) {
      return `It took you ${attempts} attempt(s)/action(s).`;
    },
    nextCelebrityTimer(time) {
      return `The next celebrity will arrive in ${time}.`;
    },
  },
};
