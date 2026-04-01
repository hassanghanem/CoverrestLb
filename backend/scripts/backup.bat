@echo off
REM Coverrest LB Backup Script for Windows
REM This script performs automated backups with error handling

echo [%date% %time%] Starting Coverrest LB Backup Process...

REM Change to Laravel directory
cd /d "C:\wamp\www\coverrestlb\backend"

echo [%date% %time%] Creating database backup...
php artisan backup:run --only-db
if %errorlevel% neq 0 (
    echo [%date% %time%] ERROR: Database backup failed!
    exit /b 1
)

echo [%date% %time%] Creating full backup (files + database)...
php artisan backup:run
if %errorlevel% neq 0 (
    echo [%date% %time%] ERROR: Full backup failed!
    exit /b 1
)

echo [%date% %time%] Cleaning up old backups...
php artisan backup:clean

echo [%date% %time%] Monitoring backup health...
php artisan backup:monitor

echo [%date% %time%] Backup process completed successfully!