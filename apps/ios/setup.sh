#!/bin/bash

# ADHD Focus iOS Setup Script

echo "🧠 ADHD Focus iOS Setup"
echo "========================"

# Check if xcodegen is installed
if ! command -v xcodegen &> /dev/null; then
    echo "📦 Installing XcodeGen..."
    brew install xcodegen
else
    echo "✅ XcodeGen already installed"
fi

# Generate Xcode project
echo "🔨 Generating Xcode project..."
cd "$(dirname "$0")"
xcodegen generate

if [ $? -eq 0 ]; then
    echo "✅ Project generated successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Open ADHDFocus.xcodeproj"
    echo "2. Select your Personal Team for signing"
    echo "3. Change Bundle ID to something unique"
    echo "4. Connect iPhone and press Cmd+R"
    echo ""
    echo "Opening Xcode..."
    open ADHDFocus.xcodeproj
else
    echo "❌ Failed to generate project"
    exit 1
fi
