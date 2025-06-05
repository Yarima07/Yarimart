# Yarimart-Website

Yarimart-Website is an open-source web application developed by YarimaGroup. This repository contains the codebase for the Yarimart e-commerce platform, designed to provide a modern, scalable, and customizable online store experience.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About

Yarimart-Website is intended as a foundational e-commerce website that can be adapted for various business needs. The project aims to deliver a fast, responsive, and user-friendly online shopping experience. It is built with modern JavaScript tooling and follows best practices for web development.

---

## Features

- Modern, responsive design
- Built with TypeScript for type safety and maintainability
- Utilizes Tailwind CSS for flexible and efficient styling
- Fast development workflow using Vite
- Easily customizable and extendable codebase

---

## Tech Stack

- **Frontend Framework:** React (with TypeScript)
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Linting:** ESLint
- **Package Management:** npm
- **Database:** Supabase

---

## Getting Started

Follow these steps to set up the project locally:

1. **Clone the repository**
git clone https://github.com/YarimaGroup/Yarimart-Website.git
cd Yarimart-Website

2. **Install dependencies**
npm install

3. **Set up environment variables**
Copy the `.env.example` file to `.env` and fill in your Supabase credentials:
```
cp .env.example .env
```
Then edit the `.env` file with your Supabase URL, anon key, and service role key.

4. **Run the development server**
npm run dev

5. **Build for production**
npm run build

6. **Preview the production build**
npm run preview

---

## Environment Setup

The application requires the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

These can be found in your Supabase dashboard under Project Settings > API.

---

## Folder Structure

- `/public` — Static assets
- `/src` — Source code (components, pages, utilities, etc.)
- `.bolt` — Configuration or environment files
- `index.html` — Main HTML entry point
- `package.json` — Project metadata and dependencies
- `tailwind.config.js` — Tailwind CSS configuration
- `vite.config.ts` — Vite configuration

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to help improve the project. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or support, please open an issue in this repository.

---

*This README was last updated on May 23, 2025.*

> _A well-crafted README helps others understand, use, and contribute to your project. For more tips, see GitHub's README guidelines and community templates_.