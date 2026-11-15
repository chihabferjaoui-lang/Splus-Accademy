(function () {
  const levels = [
    { code: "A1", name: "Beginner" },
    { code: "A2", name: "Elementary" },
    { code: "B1", name: "Intermediate" },
    { code: "B2", name: "Upper Intermediate" },
    { code: "C1", name: "Advanced" },
    { code: "C2", name: "Proficient" }
  ];
  const questionCount = 25;
  const questionsPerLevel = 50;
  const placementHistoryKey = "splus:placement-questions:v1";
  const progressHistoryKey = "splus:level-progress:v1";
  const questionBank = window.levelTestQuestionBank || [];
  let questions = [];
  let selectedAnswers = [];
  let currentQuestion = 0;
  let testMode = "placement";
  let chosenLevel = "";

  function getQuestionsForLevel(level) {
    return questionBank.filter(question => question.level === level);
  }

  function validateQuestionBank() {
    levels.forEach(level => {
      const bank = getQuestionsForLevel(level.code);
      if (bank.length !== questionsPerLevel) {
        throw new Error(`Expected ${questionsPerLevel} ${level.code} questions; found ${bank.length}.`);
      }
      bank.forEach((question, index) => {
        if (
          !question.q ||
          !Array.isArray(question.a) ||
          question.a.length !== 4 ||
          new Set(question.a).size !== 4 ||
          !Number.isInteger(question.c) ||
          question.c < 0 ||
          question.c > 3
        ) {
          throw new Error(`Invalid ${level.code} question at bank index ${index}.`);
        }
      });
    });
    if (new Set(questionBank.map(question => `${question.level}:${question.q}`)).size !== questionBank.length) {
      throw new Error("Question bank contains duplicate prompts.");
    }
  }

  function readPlacementHistory() {
    let stored;
    try {
      stored = window.localStorage.getItem(placementHistoryKey);
    } catch (error) {
      console.error("Could not read placement-question history.", error);
      throw new Error("This browser cannot access saved test history, so a no-repeat placement test cannot start.");
    }
    if (!stored) return new Set();
    let keys;
    try {
      keys = JSON.parse(stored);
    } catch (error) {
      console.error("Saved placement-question history is invalid.", error);
      throw new Error("Saved test history is unreadable. Reset it before starting another placement test.");
    }
    if (!Array.isArray(keys) || !keys.every(key => typeof key === "string")) {
      throw new Error("Saved test history is invalid. Reset it before starting another placement test.");
    }
    return new Set(keys);
  }

  function savePlacementHistory(keys) {
    try {
      window.localStorage.setItem(placementHistoryKey, JSON.stringify([...keys]));
    } catch (error) {
      console.error("Could not save placement-question history.", error);
      throw new Error("Could not save test history. Check this browser's storage settings and try again.");
    }
  }

  function shuffled(items, random = Math.random) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function prepareQuestion(question, random) {
    const answers = question.a.map((text, index) => ({
      text,
      correct: index === question.c
    }));
    const shuffledAnswers = shuffled(answers, random);
    return {
      ...question,
      a: shuffledAnswers.map(answer => answer.text),
      c: shuffledAnswers.findIndex(answer => answer.correct)
    };
  }

  function buildLevelSample(level) {
    const random = Math.random;
    return shuffled(getQuestionsForLevel(level), random)
      .slice(0, questionCount)
      .map(question => prepareQuestion(question, random));
  }

  function buildPlacementSample(seenQuestions) {
    const random = Math.random;
    const sample = [];
    const availableByLevel = levels.map(level => ({
      ...level,
      questions: getQuestionsForLevel(level.code)
        .filter(question => !seenQuestions.has(`${question.level}:${question.q}`))
    }));
    const insufficientLevel = availableByLevel.find(level => level.questions.length < 4);
    if (insufficientLevel) {
      throw new Error(
        `There are not enough unused ${insufficientLevel.code} questions left for a balanced placement test. Reset placement history to start a new cycle.`
      );
    }
    const extraLevels = availableByLevel.filter(level => level.questions.length >= 5);
    if (extraLevels.length === 0) {
      throw new Error("There are not enough unused questions for a 25-question placement test. Reset placement history to start a new cycle.");
    }
    const extraLevel = extraLevels[Math.floor(random() * extraLevels.length)];
    availableByLevel.forEach(level => {
      const count = level.code === extraLevel.code ? 5 : 4;
      sample.push(...shuffled(level.questions, random).slice(0, count));
    });
    return shuffled(sample, random).map(question => prepareQuestion(question, random));
  }

  function beginTest(sample, mode, level) {
    questions = sample;
    selectedAnswers = Array(questionCount).fill(null);
    currentQuestion = 0;
    testMode = mode;
    chosenLevel = level || "";
    document.getElementById("landingSection").style.display = "none";
    document.getElementById("resultSection").style.display = "none";
    document.getElementById("quizSection").style.display = "block";
    showQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startLevelTest() {
    const level = document.getElementById("chosenLevel").value;
    if (!levels.some(item => item.code === level)) {
      window.alert("Choose a valid CEFR level.");
      return;
    }
    beginTest(buildLevelSample(level), "level", level);
  }

  function startPlacementTest() {
    try {
      const seenQuestions = readPlacementHistory();
      const sample = buildPlacementSample(seenQuestions);
      const updatedHistory = new Set(seenQuestions);
      sample.forEach(question => updatedHistory.add(`${question.level}:${question.q}`));
      savePlacementHistory(updatedHistory);
      beginTest(sample, "placement", "");
    } catch (error) {
      console.error("Could not start placement test.", error);
      window.alert(error.message);
    }
  }

  function resetPlacementHistory() {
    if (!window.confirm("Reset saved placement-test history? Previously used questions may appear again.")) return;
    try {
      window.localStorage.removeItem(placementHistoryKey);
    } catch (error) {
      console.error("Could not reset placement-test history.", error);
      window.alert("Could not reset saved placement history in this browser.");
      return;
    }
    window.alert("Placement-test history has been reset.");
  }

  function readPreviousProgress(level) {
    let stored;
    try {
      stored = window.localStorage.getItem(`${progressHistoryKey}:${level}`);
    } catch (error) {
      console.error("Could not read saved progress score.", error);
      throw new Error("Could not read the previous progress score from this browser.");
    }
    if (!stored) return null;
    let record;
    try {
      record = JSON.parse(stored);
    } catch (error) {
      console.error("Saved progress score is invalid.", error);
      throw new Error("The previous progress score is unreadable.");
    }
    if (!record || !Number.isInteger(record.correct) || record.correct < 0 || record.correct > questionCount) {
      throw new Error("The previous progress score is invalid.");
    }
    return record;
  }

  function saveProgress(level, correct) {
    const record = { correct, completedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(`${progressHistoryKey}:${level}`, JSON.stringify(record));
    } catch (error) {
      console.error("Could not save progress score.", error);
      throw new Error("The test result is ready, but this browser could not save it for progress comparison.");
    }
  }

  function showQuestion() {
    const question = questions[currentQuestion];
    document.getElementById("questionCounter").textContent =
      `Question ${currentQuestion + 1} of ${questionCount}`;
    document.getElementById("questionText").textContent =
      `${question.level} · ${question.area}\n${question.q}`;
    document.getElementById("progressFill").style.width =
      `${((currentQuestion + 1) / questionCount) * 100}%`;

    const answersBox = document.getElementById("answersBox");
    answersBox.innerHTML = "";
    question.a.forEach((answer, index) => {
      const button = document.createElement("button");
      button.className = "answer-btn";
      button.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
      button.setAttribute("aria-pressed", String(selectedAnswers[currentQuestion] === index));
      if (selectedAnswers[currentQuestion] === index) button.classList.add("selected");
      button.onclick = () => selectAnswer(index);
      answersBox.appendChild(button);
    });

    document.getElementById("previousBtn").disabled = currentQuestion === 0;
    const nextButton = document.getElementById("nextBtn");
    nextButton.disabled = selectedAnswers[currentQuestion] === null;
    nextButton.textContent = currentQuestion === questionCount - 1 ? "Finish Test" : "Next Question";
  }

  function selectAnswer(index) {
    selectedAnswers[currentQuestion] = index;
    document.querySelectorAll(".answer-btn").forEach((answerButton, answerIndex) => {
      answerButton.classList.toggle("selected", answerIndex === index);
      answerButton.setAttribute("aria-pressed", String(answerIndex === index));
    });
    document.getElementById("nextBtn").disabled = false;
  }

  function previousQuestion() {
    if (currentQuestion === 0) return;
    currentQuestion--;
    showQuestion();
  }

  function nextQuestion() {
    if (selectedAnswers[currentQuestion] === null) return;
    if (currentQuestion < questionCount - 1) {
      currentQuestion++;
      showQuestion();
      return;
    }
    showResult();
  }

  function scoreQuestions(selectedQuestions) {
    return selectedQuestions.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.c ? 1 : 0);
    }, 0);
  }

  function showResult() {
    document.getElementById("quizSection").style.display = "none";
    document.getElementById("resultSection").style.display = "block";

    const scores = levels.map(level => {
      const levelQuestions = questions.filter(question => question.level === level.code);
      const correct = levelQuestions.reduce((total, question) => {
        const index = questions.indexOf(question);
        return total + (selectedAnswers[index] === question.c ? 1 : 0);
      }, 0);
      return {
        ...level,
        correct,
        total: levelQuestions.length,
        threshold: Math.ceil(levelQuestions.length * 0.75)
      };
    });

    const resultLevel = document.getElementById("resultLevel");
    const resultMessage = document.getElementById("resultMessage");
    const breakdownTitle = document.getElementById("breakdownTitle");
    const breakdown = document.getElementById("levelBreakdown");

    if (testMode === "level") {
      const correct = scoreQuestions(questions);
      const threshold = Math.ceil(questionCount * 0.75);
      resultLevel.textContent = `${chosenLevel} · ${levels.find(level => level.code === chosenLevel).name} progress test`;
      document.getElementById("resultScore").textContent = `${correct} of ${questionCount} correct`;
      let previous = null;
      let progressWarning = "";
      try {
        previous = readPreviousProgress(chosenLevel);
        saveProgress(chosenLevel, correct);
      } catch (error) {
        console.error("Could not update progress comparison.", error);
        progressWarning = error.message;
      }
      const progressComparison = previous
        ? `Previous test: ${previous.correct}/${questionCount}; change: ${correct - previous.correct >= 0 ? "+" : ""}${correct - previous.correct}.`
        : "This is your first saved progress score for this level on this browser.";
      resultMessage.textContent = correct >= threshold
        ? `You met the ${threshold}/${questionCount} screening benchmark for this ${chosenLevel} sample.`
        : `You scored below the ${threshold}/${questionCount} screening benchmark for this ${chosenLevel} sample.`;
      breakdownTitle.textContent = "Sample details";
      breakdown.innerHTML = `<p><strong>Level:</strong> ${chosenLevel}</p><p>${progressComparison}</p>`;
      if (progressWarning) breakdown.innerHTML += `<p><strong>Progress history:</strong> ${progressWarning}</p>`;
    } else {
      const totalCorrect = scoreQuestions(questions);
      let placement = -1;
      for (let index = 0; index < scores.length; index++) {
        if (scores[index].correct < scores[index].threshold) break;
        placement = index;
      }
      const placedLevel = placement >= 0 ? scores[placement] : null;
      resultLevel.textContent = placedLevel
        ? `${placedLevel.code} · ${placedLevel.name}`
        : "Below A1 · Foundation";
      document.getElementById("resultScore").textContent = `${totalCorrect} of ${questionCount} correct`;
      resultMessage.textContent = placedLevel
        ? `Your indicative placement is ${placedLevel.code}. The screening benchmark is 75% or higher at this level and each lower level.`
        : "Your score did not meet the A1 screening benchmark. A foundation-level course may be a good starting point.";
      breakdownTitle.textContent = "Score by level";
      breakdown.innerHTML = scores.map(level => `
        <p><strong>${level.code} · ${level.name}:</strong> ${level.correct}/${level.total}
          — ${level.correct >= level.threshold ? "benchmark met" : "benchmark not met"}</p>
      `).join("");
    }

    document.getElementById("assessmentLimit").textContent =
      "This 25-question multiple-choice test is a screening estimate, not a certified CEFR exam. It samples grammar, vocabulary, reading, and functional language; it does not assess speaking, listening, or extended writing. Progress scores and placement-question history are saved only in this browser.";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restartTest() {
    currentQuestion = 0;
    selectedAnswers = [];
    document.getElementById("resultSection").style.display = "none";
    document.getElementById("landingSection").style.display = "block";
    document.getElementById("progressFill").style.width = "0%";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initialize() {
    validateQuestionBank();
  }

  window.startLevelTest = startLevelTest;
  window.startPlacementTest = startPlacementTest;
  window.resetPlacementHistory = resetPlacementHistory;
  window.previousQuestion = previousQuestion;
  window.nextQuestion = nextQuestion;
  window.restartTest = restartTest;
  initialize();
})();
