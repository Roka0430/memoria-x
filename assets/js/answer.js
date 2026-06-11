class MemoriaAnswer {
  static SETTINGS = {
    format: {
      split: "split",
      full: "full",
    },
    answer: {
      input: "input",
      flip: "flip",
    },
    order: {
      sequence: "sequence",
      random: "random",
    },
    blank: {
      fixed: "fixed",
      auto: "auto",
    },
  };

  constructor() {
    this.dataApp = new Data();
    this.settingsApp = new Settings();
    this.statsApp = new Stats();
  }

  async init() {
    const { id, mistake } = this.#getUrlParams();
    if (id === null) {
      window.location.assign(location.pathname);
      return;
    }

    const stats = this.statsApp.load();
    stats.home_id = id;
    this.statsApp.save(stats);

    this.mistakeMode = mistake;
    if (this.mistakeMode) {
      const raw = sessionStorage.getItem(Key.RESULT_SESSION_KEY);
      if (raw === null) {
        const url = new URL(window.location.href);
        url.searchParams.delete("mistake");
        window.location.href = url.toString();
        return;
      }
      this.prevSubject = JSON.parse(raw);
      sessionStorage.removeItem(Key.RESULT_SESSION_KEY);
    }

    this.subjectOrigin = await this.dataApp.loadSubject(id);
    if (this.subjectOrigin === null) {
      window.location.assign(location.pathname);
      return;
    }

    this.settings = this.settingsApp.load();

    this.ui = this.#getUi();
    this.#bindEvent();

    if (this.settings.blank === MemoriaAnswer.SETTINGS.blank.fixed) this.ui.questionSentence.classList.add("fixed");
    if (this.settings.answer === MemoriaAnswer.SETTINGS.answer.flip) this.ui.answerForm.classList.add("hidden");

    this.#start();
  }

  #getUrlParams() {
    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");
    const idInt = Number(id);

    return {
      id: Number.isInteger(idInt) ? idInt : null,
      mistake: params.has("mistake"),
    };
  }

  #getUi() {
    const ui = {};
    [...document.querySelectorAll("[data-ui]")].forEach((el) => (ui[el.dataset.ui] = el));
    return ui;
  }

  #bindEvent() {
    window.addEventListener("keydown", (e) => this.#windowKeydown(e));
    this.ui.answerInput.addEventListener("keydown", (e) => this.#keydownAnswerInput(e));
  }

  #windowKeydown(e) {
    if (e.key == "Escape") {
      window.location.assign(location.pathname);
      e.preventDefault();
    }

    if (e.key === " " && this.settings.answer === MemoriaAnswer.SETTINGS.answer.flip) {
      this.#answer(true);
      this.#scrollQuestionSentence();
      e.preventDefault();
    }

    if (e.key === "/" && document.activeElement !== this.ui.answerInput) {
      this.ui.answerInput.focus();
      e.preventDefault();
    }
  }

  #keydownAnswerInput(e) {
    if (e.key === "Enter") {
      this.#answer();
      this.#scrollQuestionSentence();
    }

    if (e.key === "Tab") {
      this.#answer(true);
      this.#scrollQuestionSentence();
      e.preventDefault();
    }

    if (e.key === "End" || e.key === "Insert") this.#openBlank();

    if (e.key === "ArrowUp") this.#restorePreviousInput();
  }

  #scrollQuestionSentence() {
    const currentBlank = this.ui.questionSentence.querySelector(".current");
    const height = this.ui.questionSentence.clientHeight;
    const top = currentBlank.offsetTop;
    this.ui.questionSentence.scrollTo({ top: top - height / 2, behavior: "smooth" });
  }

  #start() {
    if (!this.mistakeMode) {
      this.subject = structuredClone(this.subjectOrigin);
    } else {
      this.subject = structuredClone(this.prevSubject);
      for (const [i, mistakes] of Object.entries(this.prevSubject.mistake)) {
        if (mistakes.includes(true)) continue;
        this.subject.questions[i] = null;
      }
      this.subject.questions = this.subject.questions.filter((question) => question !== null);
    }

    if (this.settings.order === MemoriaAnswer.SETTINGS.order.random) this.#randomShuffle(this.subject.questions);
    if (this.settings.format === MemoriaAnswer.SETTINGS.format.full)
      this.subject.questions = [this.subject.questions.join("\n\n")];

    this.subject.mistake = Array(this.subject.questions.length).fill(null);

    this.currentQuestionIndex = 0;
    this.currentBlankIndex = 0;
    if (this.settings.answer === MemoriaAnswer.SETTINGS.answer.input) this.ui.answerInput.focus();
    this.#setQuestionSentence();
  }

  #randomShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  #setQuestionSentence() {
    const questionSentence = this.subject.questions[this.currentQuestionIndex];
    const matchedBlanks = questionSentence.match(/；(.*?)；/g);
    if (matchedBlanks === null) {
      this.#nextQuestion();
      return;
    }

    this.subject.mistake[this.currentQuestionIndex] = Array(matchedBlanks.length).fill(false);

    this.ui.questionSentence.classList.add("refresh");
    setTimeout(() => {
      this.ui.questionSentence.classList.remove("refresh");
    }, 150);

    this.#setHeaderInfo();
    const escapedQuestionSentence = this.#escapeHtml(questionSentence);
    const questionSentenceHtml = escapedQuestionSentence.replace(
      /；(.*?)；/g,
      `<span class="blank" data-answer="$1">$1</span>`,
    );
    this.ui.questionSentence.innerHTML = questionSentenceHtml;

    if (this.settings.answer === MemoriaAnswer.SETTINGS.answer.flip)
      this.ui.questionSentence.insertAdjacentHTML("beforeend", `<span class="blank dummy" data-answer=""></span>`);

    const firstBlank = this.ui.questionSentence.querySelector(".blank");
    firstBlank.classList.add("current");
  }

  #escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  #setHeaderInfo() {
    this.ui.subjectName.textContent = this.subject.name;

    if (this.settings.format === MemoriaAnswer.SETTINGS.format.split)
      this.ui.currentIndex.textContent = `${this.currentQuestionIndex + 1}/${this.subject.questions.length}`;
    else this.ui.currentIndex.textContent = "";
  }

  #nextQuestion() {
    this.currentBlankIndex = 0;
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex > this.subject.questions.length - 1) {
      this.#finish();
      return;
    }
    this.#setQuestionSentence();
  }

  #answer(isSkip = false) {
    const input = this.ui.answerInput.value;
    if (!isSkip && input === "") return;

    this.previousInput = input;
    this.ui.answerInput.value = "";

    const currentBlank = this.ui.questionSentence.querySelector(".current");
    const isCorrect = input === currentBlank.dataset.answer;

    if (isSkip || !isCorrect) this.subject.mistake[this.currentQuestionIndex][this.currentBlankIndex] = true;
    if (isSkip || isCorrect) this.#nextBlank(currentBlank);
  }

  #nextBlank(currentBlank) {
    this.currentBlankIndex++;
    const nextBlank = currentBlank.nextElementSibling;
    if (nextBlank === null) {
      this.#nextQuestion();
      return;
    }
    currentBlank.classList.remove("current");
    currentBlank.classList.add("opened");
    nextBlank.classList.add("current");
  }

  #finish() {
    if (this.settings.answer === MemoriaAnswer.SETTINGS.answer.flip) {
      this.#start();
    } else {
      sessionStorage.setItem(Key.RESULT_SESSION_KEY, JSON.stringify(this.subject));
      window.location.replace(`${location.pathname}?result`);
    }
  }

  #openBlank() {
    const currentBlank = this.ui.questionSentence.querySelector(".current");
    currentBlank.classList.add("opened");
    this.subject.mistake[this.currentQuestionIndex][this.currentBlankIndex] = true;
  }

  #restorePreviousInput() {
    if (!this.previousInput) return;
    this.ui.answerInput.value = this.previousInput;
    requestAnimationFrame(() => {
      const end = this.previousInput.length;
      this.ui.answerInput.setSelectionRange(end, end);
    });
  }
}

const answer = new MemoriaAnswer();
answer.init();
