class Key {
  static SETTINGS_LOCAL_KEY = "MEMORIA_X_SETTINGS";
  static STATS_LOCAL_KEY = "MEMORIA_X_STATS";
  static RESULT_SESSION_KEY = "MEMORIA_X_RESULT";
  static LAST_READ_DATETIME_KEY = "MEMORIA_X_LAST_READ_DATETIME";
}

class Data {
  async #post(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async loadSubjects() {
    const res = await fetch(`api/load_subjects.php`);
    return await res.json();
  }

  async loadSubject(id) {
    if (id == null) return null;

    const res = await fetch(`api/load_subject.php?id=${id}`);
    if (!res.ok) return null;
    return await res.json();
  }

  async addSubject(name) {
    if (name == null) return;
    const res = await this.#post("api/add.php", { name });
    const text = await res.text();
    return text ? Number(text) : -1;
  }

  deleteSubject(id) {
    if (id == null) return;
    this.#post("api/delete.php", { id });
  }

  renameSubject(id, name) {
    if (id == null || name == null) return;
    this.#post("api/rename_subject.php", { id, name });
  }

  updateQuestions(id, questions) {
    if (id == null || questions == null) return;
    this.#post("api/update_questions.php", { id, questions });
  }

  async length() {
    const res = await fetch("api/length.php");
    const text = await res.text();
    return text ? Number(text) : -1;
  }
}

class Settings {
  static LOCAL_STORAGE_KEY = Key.SETTINGS_LOCAL_KEY;
  static DEFAULT_SETTINGS = {
    format: "split",
    answer: "input",
    order: "sequence",
    blank: "fixed",
  };

  load() {
    try {
      const raw = localStorage.getItem(Settings.LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : { ...Settings.DEFAULT_SETTINGS };
    } catch {
      return { ...Settings.DEFAULT_SETTINGS };
    }
  }

  save(settings) {
    localStorage.setItem(Settings.LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }
}

class Stats {
  static LOCAL_STORAGE_KEY = Key.STATS_LOCAL_KEY;
  static LAST_READ_DATETIME_KEY = Key.LAST_READ_DATETIME_KEY;
  static DEFAULT_STATS = {
    home_id: null,
    editor_id: null,
  };

  constructor() {
    const raw = localStorage.getItem(Stats.LAST_READ_DATETIME_KEY);
    const datetime = raw ? new Date(Number(raw)) : new Date(0);
    const date = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate());

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diff = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 0) {
      localStorage.setItem(Stats.LAST_READ_DATETIME_KEY, now.getTime());
      this.save(Stats.DEFAULT_STATS);
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(Stats.LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : { ...Stats.DEFAULT_STATS };
    } catch {
      return { ...Stats.DEFAULT_STATS };
    }
  }

  save(settings) {
    localStorage.setItem(Stats.LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }
}
