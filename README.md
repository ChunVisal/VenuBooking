# VenuBooking

Event management and ticket booking system — designed for collaborative development.

---

## 🚀 Setup

Prerequisites:

- Node.js (>= 14)
- Git

Get the code and run locally:

```bash
git clone https://github.com/JoeNarthan/VenuBooking.git
cd VenuBooking
npm install
npm start
```

Optional: add any required environment variables to a `.env` file (follow project-specific README or .env.example).

---

## 🧑‍🤝‍🧑 Git Collaboration (recommended workflow)

Always work on a feature branch. Never push directly to `main`.

1. Create a feature branch

```bash
git checkout -b feature/your-task
```

2. Keep your branch up to date with `main`

```bash
git checkout main
git pull origin main
git checkout feature/your-task
git merge main
```

or use rebase if your team prefers:

```bash
git checkout feature/your-task
git fetch origin
git rebase origin/main
```

3. Stage, commit and push changes

```bash
git add .
git commit -m "feat: short description of change"
git push origin feature/your-task
```

4. Open a Pull Request (PR) from `feature/your-task` → `main` on GitHub. Request reviews and address feedback.

5. After merge: update local `main` and remove the feature branch

```bash
git checkout main
git pull origin main
git branch -d feature/your-task
```

---

## 📌 Useful Git Commands

| Action | Command |
|---|---|
| Clone repo | `git clone <url>` |
| Create branch | `git checkout -b <branch>` |
| Switch branch | `git checkout <branch>` |
| Stage changes | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push origin <branch>` |
| Pull | `git pull origin main` |
| Merge | `git merge main` |
| Status | `git status` |
| Log | `git log --oneline --graph --all` |

---

Follow your team's PR template and commit message conventions for consistency.
