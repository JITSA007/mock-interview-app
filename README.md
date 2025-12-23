# 🎙️ MockMate - AI Mock Interviewer

MockMate is a free, open-source web application that helps users practice for job interviews. It uses AI to simulate a real conversation based on a specific job description provided by the user.

**Built for the "Zero Cost" stack:** No expensive API subscriptions required.

![Project Status](https://img.shields.io/badge/Status-Active-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

-   **Custom Scenarios:** Enter any Company Name, Job Role, and Job Description.
-   **Voice Interface:** Speak to the AI using your microphone (Speech-to-Text).
-   **AI Audio Response:** The AI replies with voice output (Text-to-Speech).
-   **Smart Context:** The AI remembers your previous answers and asks relevant follow-up questions.
-   **100% Free:** Uses the Groq API (Free Tier) and native Browser Speech APIs.

## 🛠️ Tech Stack

-   **Frontend:** Next.js 14 (React)
-   **Styling:** Tailwind CSS
-   **AI Model:** Llama 3 (via Groq Cloud SDK)
-   **Voice Engine:** Native Web Speech API (`window.webkitSpeechRecognition` & `speechSynthesis`)
-   **Icons:** Lucide React

## 🚀 Getting Started

Follow these steps to run the project locally or in GitHub Codespaces.

### Prerequisites

1.  **Node.js** (Installed automatically in Codespaces).
2.  **Groq API Key**: Get a free key at [console.groq.com](https://console.groq.com).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/mock-interview-app.git](https://github.com/YOUR_USERNAME/mock-interview-app.git)
    cd mock-interview-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a file named `.env.local` in the root directory and add your API key:
    ```bash
    GROQ_API_KEY=gsk_your_key_here_xxxxxxxxxxxxx
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```

5.  **Open in Browser:**
    Navigate to `http://localhost:3000`.

## ⚠️ Important Note on Browser Compatibility

This app uses the **Web Speech API**.
-   ✅ **Works Best:** Google Chrome, Microsoft Edge (Desktop).
-   ⚠️ **Limited Support:** Firefox, Safari (Mobile).
-   If the microphone doesn't start, please try using Chrome on a Desktop/Laptop.

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements (like adding a dashboard for interview scores), feel free to fork the repo and submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
