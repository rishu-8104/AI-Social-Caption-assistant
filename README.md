# AI Social Caption Assistant 🚀

A modern, responsive web application that generates AI-powered captions for social media platforms. Upload an image and get tailored captions for Instagram, Twitter, Facebook, and LinkedIn. Built with Next.js 14, TypeScript, and Google's Generative AI.

## ✨ Features

- **AI-Powered Caption Generation** - Uses Google's Generative AI to create platform-specific captions
- **Multi-Platform Support** - Instagram, Twitter, Facebook, and LinkedIn
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Image Upload** - Drag & drop or click to upload images (JPEG, PNG, GIF, WebP)
- **Context-Aware** - Add optional context to improve caption relevance
- **Copy to Clipboard** - Easy one-click copying of generated captions
- **Accessibility First** - WCAG 2.1 compliant with keyboard navigation and screen reader support
- **Dark/Light Mode** - Automatic theme detection with manual override
- **Production Ready** - Comprehensive testing, error handling, and performance optimizations

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.30 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Integration**: Google Generative AI
- **Testing**: Jest, React Testing Library, Cypress
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-social-caption-assistant.git
   cd ai-social-caption-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create a .env.local file
   touch .env.local
   ```

   Edit `.env.local` and add your Google AI API key:
   ```env
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Run E2E tests headlessly
npm run test:e2e

# Open Cypress interactive runner
npm run test:e2e:open
```

### Type Checking
```bash
npm run type-check
```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── generate-captions/ # AI caption generation
│   │   └── social/        # Social media integration
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Base UI components (Radix UI)
│   ├── error-boundary.tsx # Error boundary
│   ├── image-uploader.tsx # Main upload component
│   ├── social-auth-button.tsx # Social auth buttons
│   └── theme-provider.tsx # Theme context
├── lib/                  # Utility functions
│   ├── config.ts         # Configuration management
│   ├── social-auth.ts    # Social media authentication
│   └── utils.ts          # General utilities
├── hooks/                # Custom React hooks
├── __tests__/            # Test files
├── cypress/              # E2E tests
├── public/               # Static assets
└── styles/               # Additional styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_AI_API_KEY` | Google AI API key | - | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` | No |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `5242880` (5MB) | No |
| `ALLOWED_FILE_TYPES` | Allowed MIME types | `image/jpeg,image/png,image/gif,image/webp` | No |

### Social Media Integration

The app includes API routes for social media platforms:
- **Facebook**: Authentication and posting capabilities
- **Instagram**: Authentication and posting capabilities
- **Twitter**: Ready for integration
- **LinkedIn**: Ready for integration

### Getting Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add the key to your `.env.local` file

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for design system changes
- Update CSS custom properties in `app/globals.css`
- Customize component styles in individual component files

### AI Behavior
- Adjust AI parameters in `lib/config.ts`
- Modify prompts in `app/api/generate-captions/route.ts`
- Add new platforms by extending the platform array

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Add environment variables** in Vercel dashboard:
   - `GOOGLE_AI_API_KEY`
   - Any other production variables

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker (Alternative)

```bash
# Build the Docker image
docker build -t ai-social-caption-assistant .

# Run the container
docker run -p 3000:3000 -e GOOGLE_AI_API_KEY=your_key ai-social-caption-assistant
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify**: Use `npm run build` and deploy the `out` folder (if using static export)
- **AWS Amplify**: Connect your Git repository
- **Railway**: Connect and deploy automatically
- **Digital Ocean App Platform**: Use the Next.js buildpack

## 📊 Performance

### Optimization Features

- **Image Optimization**: WebP/AVIF support with responsive sizing
- **Code Splitting**: Automatic bundle optimization
- **Tree Shaking**: Dead code elimination
- **Lazy Loading**: Dynamic imports for non-critical components
- **Caching**: Optimized API and static asset caching

### Bundle Analysis
```bash
npm run analyze
```

## 🔒 Security

### Implemented Security Measures

- **Content Security Policy** headers
- **XSS Protection** headers
- **CSRF Protection** via SameSite cookies
- **Input Validation** on all user inputs
- **File Type Validation** for uploads
- **Rate Limiting** (configurable)
- **Environment Variable Validation**

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**
- **Keyboard Navigation** support
- **Screen Reader** compatible
- **Focus Management**
- **ARIA Labels** and landmarks
- **High Contrast** mode support

## 🐛 Error Handling

- **Error Boundaries** for React component errors
- **API Error Handling** with user-friendly messages
- **Network Error Recovery** with retry mechanisms
- **Validation Error Display** for form inputs
- **Loading States** for all async operations

## 📈 Monitoring (Optional)

### Adding Analytics
```typescript
// In app/layout.tsx, uncomment analytics section
// Add your tracking ID to environment variables
```

### Error Reporting
```typescript
// Integrate with services like Sentry
// Add error reporting in error-boundary.tsx
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Write tests for new features
- Follow TypeScript best practices
- Ensure accessibility compliance
- Test on multiple devices/browsers
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google AI](https://ai.google.dev/) for the generative AI API
- [Vercel](https://vercel.com/) for hosting and deployment
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-social-caption-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-social-caption-assistant/discussions)
- **Documentation**: Check the code comments and API routes for detailed implementation

## 🚀 Getting Started with Development

### Prerequisites for Development
- Node.js 18+ (LTS recommended)
- Git
- A code editor (VS Code recommended)
- Google AI API key

### Development Workflow
1. Fork and clone the repository
2. Install dependencies with `npm install`
3. Set up your environment variables
4. Run the development server with `npm run dev`
5. Make your changes and run tests with `npm test`
6. Submit a pull request

---

**Built with ❤️ for the creator community**
