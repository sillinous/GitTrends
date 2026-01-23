
# GitTrend AI: Strategic Portfolio Synthesizer

<p align="center">
  <img src="https://storage.googleapis.com/aistudio-ux-team-public/app-maker/project_bgs/03.png" alt="GitTrend AI Banner" width="800">
</p>

<p align="center">
  <strong>Transforming GitHub trends into actionable business intelligence and high-impact media.</strong>
</p>

<p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Gemini_AI-8E44AD?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

---

## 🚀 Vision

**GitTrend AI** is not just another repository trend tracker. It's a high-level strategic intelligence platform designed to convert raw GitHub data into actionable business insights, competitive analysis, and high-impact marketing collateral. Powered by the Google Gemini family of models (including Flash, Pro, and Veo), this tool serves as a co-pilot for venture capitalists, tech leads, product managers, and developer advocates to navigate and capitalize on the rapidly evolving open-source landscape.

This project, created by **[Your GitHub Username/Name Here]**, demonstrates the power of multi-modal AI in synthesizing complex information into valuable, decision-ready formats.

## ✨ Core Features

This application integrates several advanced AI-driven features to provide a comprehensive analysis and content creation workflow:

*   **📈 AI-Powered Trend Discovery**: Leverages the Gemini API with Google Search grounding to discover trending or the newest repositories on any topic. Users can filter by timeframe to pinpoint market momentum.

*   **🧠 Deep Strategic Audits**: Goes beyond star counts and commit history. It generates a comprehensive business and technical audit for any repository, evaluating:
    *   **Maintenance Risk** (including bus factor and contributor velocity).
    *   **Enterprise Readiness Score**.
    *   **SaaS Monetization Potential**.
    *   **Market Trajectory** (from Stable Niche to Market Disruption).
    *   **Commercial Alternatives & Displacement Analysis**.

*   **🎬 Cinematic Video Generation**: Instantly produces professional, cinematic video pitches for single repositories or portfolio reels using **Google's Veo model**, transforming static analysis into a compelling visual narrative for stakeholders.

*   **💼 Portfolio Management**: Allows users to curate and manage a personalized portfolio of key repositories. This portfolio becomes the foundation for deeper, cross-project analysis.

*   **📝 Multi-Repo Synthesis Studio**: The core of the application. Users can select multiple repositories from their portfolio to generate high-level strategic documents and media, including:
    *   **VC Investment Memos**: Outlining market alpha, GTM strategy, and defensible moats.
    *   **M&A Audits**: Evaluating strategic IP fit and build-vs-buy calculus.
    *   **Viral Social Media Content**: Crafting engaging LinkedIn posts and multi-tweet threads.
    *   **Technical Newsletters**: Categorizing projects into "Adopt, Trial, Assess" frameworks.

## 🛠️ Tech Stack & Architecture

This application is built with a modern, performant, and scalable frontend stack, with the Gemini API at its core.

*   **Frontend**: `React` & `TypeScript` for a robust, type-safe user interface.
*   **Styling**: `Tailwind CSS` for rapid, utility-first styling and a sleek, modern design.
*   **AI Engine**: `@google/genai` SDK for seamless integration with:
    *   **`gemini-3-flash-preview`**: For quick summaries, content generation, and initial trend discovery.
    *   **`gemini-3-pro-preview`**: For deep, multi-faceted strategic analysis and complex document synthesis.
    *   **`veo-3.1-fast-generate-preview`**: For state-of-the-art, text-to-video generation.
*   **Data Visualization**: `Recharts` for creating insightful and interactive charts, such as language distribution pies and momentum bar charts.
*   **UI/UX**: Responsive design with a focus on dark-mode aesthetics and intuitive, workflow-oriented interactions.

## ⚙️ How It Works

The user workflow is designed to be a funnel from broad discovery to specific, high-value output:

1.  **Discover**: A user enters a topic (e.g., 'RAG', 'DePIN') and a timeframe. The app calls the Gemini API, which uses Google Search to find and rank relevant repositories.
2.  **Analyze**: The user receives a curated list of projects with key metrics. They can click any repository to trigger a deep-dive strategic audit, generating a detailed view of its technical and business viability.
3.  **Curate**: Promising repositories are added to a personal portfolio, which is persisted in `localStorage`.
4.  **Synthesize**: The user selects multiple assets from their portfolio and launches the **Production Studio**. Here, they choose a content type, and the Gemini Pro model synthesizes a cohesive narrative or strategic document based on the combined strengths and contexts of the selected repos.

---

*This project is a demonstration of cutting-edge AI capabilities and is intended for educational and strategic exploration purposes.*
