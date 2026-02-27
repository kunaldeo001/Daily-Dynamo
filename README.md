# Daily Dynamo ⚡️

Daily Dynamo is a whimsical and interactive day planner designed to spark joy and boost productivity through AI-driven insights and focused tools.

## Features

- **AI Daily Spark**: Start your day with a creative challenge tailored to your current mood. Includes a visualization mode!
- **Spark History**: Look back at your previous daily challenges to see how far you've come.
- **Focus Dynamo**: A built-in Pomodoro timer with audio cues to help you maintain your flow.
- **Dynamo Central**: Organize tasks into **Productive**, **Self-Care**, and **Whimsical** columns.
- **Main Quest**: Designate one primary goal for the day with a special celebration upon completion.
- **AI Task Breakdown**: Use the Productivity Wizard to break down intimidating tasks into three fun, actionable sub-steps.
- **Momentum Tracker**: Visualize your achievements with a real-time productivity dashboard and completion stats.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **AI**: [Google Genkit](https://github.com/firebase/genkit) (Gemini 2.5 Flash & Imagen 4)
- **Backend**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Charts**: [Recharts](https://recharts.org/)

## Environment Variables

To use the AI features in production (e.g., Vercel, Firebase App Hosting, or GitHub Actions), ensure you set the following environment variable:

- `GOOGLE_GENAI_API_KEY`: Your Google AI Studio API Key.

*Note: If this key is missing, the app will gracefully fall back to hand-crafted "Dynamo Sparks" so the experience remains delightful.*

---

*Stay Sparky!*
