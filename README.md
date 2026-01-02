# Runner Code AI Platform

AI-powered coding assistant platform built with React, TypeScript, and Vite.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ammarsouleiman/Runner_Code_AI_Platform.git
cd Runner_Code_AI_Platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your API keys:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your API keys:
```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_PEXELS_API_KEY=your_pexels_api_key_here
```

### Get API Keys

- **OpenRouter API Key**: Get from [https://openrouter.ai/keys](https://openrouter.ai/keys)
- **Pexels API Key** (optional): Get from [https://www.pexels.com/api/](https://www.pexels.com/api/)

### Development

Run the development server:
```bash
npm run dev
```

### Build

Build for production:
```bash
npm run build
```

### Deploy to GitHub Pages

Deploy to GitHub Pages:
```bash
npm run deploy
```

**⚠️ Important**: Before deploying, you need to set up GitHub Secrets for API keys.

📖 **See detailed setup instructions**: [SETUP_GITHUB_SECRETS.md](./SETUP_GITHUB_SECRETS.md)

Quick setup:
1. Go to your repository: **Settings → Secrets and variables → Actions**
2. Add the following secrets:
   - `VITE_OPENROUTER_API_KEY` - Your OpenRouter API key
   - `VITE_PEXELS_API_KEY` - Your Pexels API key (optional)
3. The GitHub Actions workflow will automatically use these secrets during build

## 🔒 Security Notes

- **Never commit `.env.local`** - it's already in `.gitignore`
- API keys in environment variables starting with `VITE_` will be included in the build bundle
- For production, consider using a backend proxy to hide API keys

## 📝 License

MIT

