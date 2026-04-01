#!/bin/bash

# Laravel Backup Cron Job Setup Script
# Run this script on your VPS to set up automatic backups

echo "🚀 Setting up Laravel Backup Cron Job..."

# Get current directory (should be your Laravel project root)
PROJECT_PATH=$(pwd)
echo "📁 Project path: $PROJECT_PATH"

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: artisan file not found. Please run this script from your Laravel project root directory."
    exit 1
fi

# Create the cron job entry
CRON_JOB="* * * * * cd $PROJECT_PATH && php artisan schedule:run >> /dev/null 2>&1"

# Add to crontab
echo "⚙️  Adding cron job to crontab..."
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

# Verify the cron job was added
echo "✅ Cron job added successfully!"
echo "📋 Current crontab:"
crontab -l

echo ""
echo "🔄 Testing Laravel scheduler..."
php artisan schedule:list

echo ""
echo "✅ Setup complete! Your backup system will now run automatically:"
echo "   � Daily full backup: 2:00 AM"
echo "   � Daily database backup: 2:00 PM"
echo "   🗑️  Cleanup old backups: Sunday 4:00 AM"
echo "   🔍 Health monitoring: Daily 8:00 AM"
echo ""
echo "📧 Email notifications will be sent to: info@coverrestlb.com"
echo "🔧 Make sure queue worker is running: php artisan queue:work"