# Sallie Development Workflow

## 🚀 Quick Start

### Local Development
```bash
# Clone and setup
git clone https://github.com/rachellefriloux-alt/Sallie.git
cd Sallie
./scripts/setup-dev.sh

# Start backend
py -3.11 server/sallie_main_server.py

# Start frontend (new terminal)
cd web && npm run dev

# Start mobile (new terminal)
cd mobile/android && ./gradlew installDebug
```

### Azure Development
```bash
# Deploy to Azure
az webapp deploy --name sallie-studio-backend --resource-group Sallie --src-path azure-deploy.zip

# View logs
az webapp log tail --name sallie-studio-backend --resource-group Sallie

# Scale up
az webapp update --name sallie-studio-backend --resource-group Sallie --sku B2
```

## 🛠️ Development Tools

### Database Management
- **Local**: Docker PostgreSQL + Redis
- **Azure**: sallie-studio-db + sallie-studio-redis
- **Migrations**: `alembic upgrade head`

### AI Services
- **OpenAI**: GPT-4, GPT-3.5
- **Anthropic**: Claude
- **Azure Cognitive**: Vision, Speech, Text
- **Google**: Gemini

### Testing
```bash
# Backend tests
pytest tests/ -v

# Frontend tests
cd web && npm test

# Integration tests
pytest integration/ -v
```

## 📋 Git Workflow

### Branch Strategy
- `main`: Production
- `develop`: Integration
- `feature/*`: Features
- `hotfix/*`: Emergency fixes

### Commit Messages
```
feat: add new AI service integration
fix: resolve database connection issue
docs: update API documentation
test: add integration tests for auth
```

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Submit PR with description
5. Code review and merge

## 🔧 Environment Configuration

### Local (.env)
```bash
API_HOST=127.0.0.1
API_PORT=8000
DATABASE_URL=postgresql://localhost/sallie
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
GEMINI_API_KEY=your-key
```

### Azure (App Settings)
- Configure through Azure CLI or Portal
- Use Key Vault for secrets
- Enable Application Insights

## 📊 Monitoring

### Local
- Backend logs: `logs/sallie.log`
- Health checks: `http://localhost:8742/health`
- API docs: `http://localhost:8742/docs`

### Azure
- Application Insights
- Azure Monitor
- Log Analytics
- Health probes

## 🚀 Deployment

### Automated (GitHub Actions)
- Push to `main` triggers deployment
- Tests run automatically
- Azure Web App updates

### Manual
```bash
# Build deployment package
zip -r deploy.zip . -x ".git/*" "node_modules/*"

# Deploy to Azure
az webapp deploy --name sallie-studio-backend --resource-group Sallie --src-path deploy.zip
```

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Kill processes on ports 8000, 3000, 8742
2. **Database connection**: Check PostgreSQL/Redis status
3. **API keys**: Verify environment variables
4. **Docker issues**: Restart Docker Desktop

### Debug Commands
```bash
# Check processes
lsof -i :8000
lsof -i :3000
lsof -i :8742

# Check Docker
docker ps
docker logs <container>

# Check Azure
az webapp config show --name sallie-studio-backend --resource-group Sallie
az webapp log tail --name sallie-studio-backend --resource-group Sallie
```

## 📚 Resources

- [API Documentation](http://localhost:8742/docs)
- [Azure Portal](https://portal.azure.com)
- [GitHub Repository](https://github.com/rachellefriloux-alt/Sallie)
- [Development Wiki](https://github.com/rachellefriloux-alt/Sallie/wiki)
