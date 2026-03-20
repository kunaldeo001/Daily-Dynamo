# Daily Dynamo ⚡️

Daily Dynamo is a whimsical and interactive 3D day planner designed to spark joy and boost productivity through AI-driven insights and focused tools.

## 🚀 Features

- **AI Daily Spark**: Start your day with a creative challenge tailored to your mood. Includes a **3D Flip Card** visualization mode!
- **Dynamo Central**: Organize tasks into **Productive**, **Self-Care**, and **Whimsical** columns with 3D perspective effects.
- **Main Quest**: Designate one primary goal for the day with a golden spotlight and a celebratory win state.
- **Focus Dynamo**: A built-in Pomodoro timer with audio cues and custom presets.
- **Dynamo Archive**: Generate an AI "Wrap-up" summary of your day's achievements.
- **Momentum Tracker**: Earn titles like **Productivity Paladin** or **Whimsy Warrior** as you complete tasks.
- **3D Interactive UI**: Modern, high-energy interface with hardware-accelerated 3D transforms and motion.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **AI**: [Google Genkit](https://github.com/firebase/genkit) (Gemini 2.5 Flash & Imagen 4)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **Charts**: [Recharts](https://recharts.org/)

## 📦 Getting Started

### Prerequisites
- Node.js installed
- A [Google AI Studio API Key](https://aistudio.google.com/)

### Installation
1. Clone your repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file and add:
   ```text
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

### Running Locally
```bash
npm run dev
```

## 🐙 How to Commit & Push to GitHub

If you are using the terminal, run these commands:

1. **Initialize Git** (if not already done):
   ```bash
   git init
   ```
2. **Stage your changes**:
   ```bash
   git add .
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: initial release of Daily Dynamo with 3D UI and AI features"
   ```
4. **Link to your GitHub repo**:
   ```bash
   git remote add origin https://github.com/yourusername/daily-dynamo.git
   ```
5. **Push to the main branch**:
   ```bash
   git push -u origin main
   ```

---

*Stay Sparky!*
