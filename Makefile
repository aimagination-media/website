# AImagination Studio Portfolio Website - Makefile
# Local development and testing commands

.PHONY: help serve serve-python serve-node serve-php install-deps test clean

# Default port for local development
PORT := 8000

# Help command - shows available targets
help:
	@echo "AImagination Studio Portfolio Website - Development Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make serve        - Start local development server (auto-detects Python/Node/PHP)"
	@echo "  make serve-python - Start server using Python's built-in server"
	@echo "  make serve-node   - Start server using Node.js serve package"
	@echo "  make serve-php    - Start server using PHP's built-in server"
	@echo "  make install-deps - Install Node.js dependencies for development"
	@echo "  make test         - Run basic tests and validation"
	@echo "  make clean        - Clean temporary files"
	@echo "  make update-content - Generate content, commit, and push"
	@echo "  make open         - Open the website in default browser"
	@echo ""
	@echo "Configuration:"
	@echo "  PORT=$(PORT)      - Change port with: make serve PORT=3000"

# Auto-detect and start the best available server
serve:
	@echo "🚀 Starting AImagination Studio Portfolio Website..."
	@echo "📍 Website will be available at: http://localhost:$(PORT)"
	@echo ""
	@if command -v python3 >/dev/null 2>&1; then \
		echo "🐍 Using Python 3 server..."; \
		python3 -m http.server $(PORT); \
	elif command -v python >/dev/null 2>&1; then \
		echo "🐍 Using Python server..."; \
		python -m http.server $(PORT); \
	elif command -v npx >/dev/null 2>&1; then \
		echo "📦 Using Node.js serve..."; \
		npx serve -p $(PORT); \
	elif command -v php >/dev/null 2>&1; then \
		echo "🐘 Using PHP server..."; \
		php -S localhost:$(PORT); \
	else \
		echo "❌ No suitable server found. Please install Python, Node.js, or PHP."; \
		echo "   Or use any other static file server."; \
		exit 1; \
	fi

# Python server (most common)
serve-python:
	@echo "🐍 Starting Python development server on port $(PORT)..."
	@echo "📍 Open: http://localhost:$(PORT)"
	@if command -v python3 >/dev/null 2>&1; then \
		python3 -m http.server $(PORT); \
	elif command -v python >/dev/null 2>&1; then \
		python -m http.server $(PORT); \
	else \
		echo "❌ Python not found. Please install Python or use another server."; \
		exit 1; \
	fi

# Node.js server
serve-node:
	@echo "📦 Starting Node.js development server on port $(PORT)..."
	@echo "📍 Open: http://localhost:$(PORT)"
	@if command -v npx >/dev/null 2>&1; then \
		npx serve -p $(PORT); \
	else \
		echo "❌ Node.js/npx not found. Installing serve package..."; \
		npm install -g serve && npx serve -p $(PORT); \
	fi

# PHP server
serve-php:
	@echo "🐘 Starting PHP development server on port $(PORT)..."
	@echo "📍 Open: http://localhost:$(PORT)"
	@if command -v php >/dev/null 2>&1; then \
		php -S localhost:$(PORT); \
	else \
		echo "❌ PHP not found. Please install PHP or use another server."; \
		exit 1; \
	fi

# Install Node.js dependencies for development tools
install-deps:
	@echo "📦 Installing development dependencies..."
	@if command -v npm >/dev/null 2>&1; then \
		npm install -g serve live-server http-server; \
		echo "✅ Installed: serve, live-server, http-server"; \
	else \
		echo "❌ npm not found. Please install Node.js first."; \
		exit 1; \
	fi

# Open website in default browser
open:
	@echo "🌐 Opening website in browser..."
	@if command -v xdg-open >/dev/null 2>&1; then \
		xdg-open http://localhost:$(PORT); \
	elif command -v open >/dev/null 2>&1; then \
		open http://localhost:$(PORT); \
	elif command -v start >/dev/null 2>&1; then \
		start http://localhost:$(PORT); \
	else \
		echo "Please manually open: http://localhost:$(PORT)"; \
	fi

# Reset the server (kill process on PORT and restart)
reset:
	@echo "🔄 Resetting server on port $(PORT)..."
	@lsof -ti :$(PORT) | xargs kill -9 2>/dev/null || true
	@echo "✅ Server stopped."
	@$(MAKE) serve

# Run basic tests and validation
test:
	@echo "🧪 Running website validation tests..."
	@echo ""
	@echo "📁 Checking file structure..."
	@test -f index.html || (echo "❌ Missing index.html" && exit 1)
	@test -f en/index.html || (echo "❌ Missing en/index.html" && exit 1)
	@test -f es/index.html || (echo "❌ Missing es/index.html" && exit 1)
	@test -f de/index.html || (echo "❌ Missing de/index.html" && exit 1)
	@test -f assets/css/main.css || (echo "❌ Missing main.css" && exit 1)
	@test -f assets/css/channels.css || (echo "❌ Missing channels.css" && exit 1)
	@test -f assets/js/main.js || (echo "❌ Missing main.js" && exit 1)
	@test -f assets/js/channels.js || (echo "❌ Missing channels.js" && exit 1)
	@test -f .nojekyll || (echo "❌ Missing .nojekyll" && exit 1)
	@test -f CNAME || (echo "❌ Missing CNAME" && exit 1)
	@echo "✅ All required files present"
	@echo ""
	@echo "🔍 Checking HTML syntax..."
	@if command -v tidy >/dev/null 2>&1; then \
		tidy -q -e index.html && echo "✅ index.html syntax OK"; \
		tidy -q -e en/index.html && echo "✅ en/index.html syntax OK"; \
		tidy -q -e es/index.html && echo "✅ es/index.html syntax OK"; \
		tidy -q -e de/index.html && echo "✅ de/index.html syntax OK"; \
	else \
		echo "⚠️  HTML Tidy not installed - skipping syntax check"; \
	fi
	@echo ""
	@echo "🎨 Checking CSS syntax..."
	@if command -v csslint >/dev/null 2>&1; then \
		csslint assets/css/main.css && echo "✅ main.css syntax OK"; \
		csslint assets/css/channels.css && echo "✅ channels.css syntax OK"; \
	else \
		echo "⚠️  CSS Lint not installed - skipping CSS check"; \
	fi
	@echo ""
	@echo "📊 File sizes:"
	@du -h index.html en/index.html es/index.html de/index.html assets/css/*.css assets/js/*.js
	@echo ""
	@echo "✅ Basic validation complete!"

# Clean temporary files
clean:
	@echo "🧹 Cleaning temporary files..."
	@find . -name ".DS_Store" -delete 2>/dev/null || true
	@find . -name "Thumbs.db" -delete 2>/dev/null || true
	@find . -name "*.tmp" -delete 2>/dev/null || true
	@echo "✅ Cleanup complete!"

# Generate content, commit and push
update-content:
	@echo "🔄 Generating content..."
	python3 scripts/generate_content.py
	@echo "💾 Committing changes..."
	git add .
	git commit -m "Update content"
	@echo "🚀 Pushing to repository..."
	git push


# Development workflow - serve and open
dev: serve &
	@sleep 2
	@$(MAKE) open

# Production build check
build-check:
	@echo "🏗️  Production build check..."
	@echo "📋 Verifying GitHub Pages requirements..."
	@test -f .nojekyll && echo "✅ .nojekyll present"
	@test -f CNAME && echo "✅ CNAME present"
	@test -f index.html && echo "✅ Root index.html present"
	@echo "🔗 Checking internal links..."
	@grep -q 'href="en/"' index.html && echo "✅ English link OK"
	@grep -q 'href="es/"' index.html && echo "✅ Spanish link OK"
	@grep -q 'href="de/"' index.html && echo "✅ German link OK"
	@echo "✅ Production build check complete!"

# Show project information
info:
	@echo "AImagination Studio Portfolio Website"
	@echo "====================================="
	@echo ""
	@echo "📁 Project Structure:"
	@find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) | head -20
	@echo ""
	@echo "🌐 Languages: English, Spanish, German"
	@echo "📱 Features: Responsive, Multilingual, GitHub Pages Ready"
	@echo "🎯 Purpose: Educational content portfolio showcase" 