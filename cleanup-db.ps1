# Fix MySQL Database - Manual Cleanup Script
# Run this script AFTER stopping MySQL from XAMPP Control Panel

Write-Host "=== MySQL Database Cleanup Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if database folder exists
$dbPath = "C:\xampp\mysql\data\m@002dcommerce"
if (Test-Path $dbPath) {
    Write-Host "Found database folder: $dbPath" -ForegroundColor Yellow
    
    # Try to delete the folder
    try {
        Write-Host "Attempting to delete database folder..." -ForegroundColor Yellow
        Remove-Item -Path $dbPath -Recurse -Force -ErrorAction Stop
        Write-Host "Database folder deleted successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to delete folder. MySQL might still be running!" -ForegroundColor Red
        Write-Host "Please:" -ForegroundColor Yellow
        Write-Host "  1. Open XAMPP Control Panel" -ForegroundColor Yellow
        Write-Host "  2. Stop MySQL" -ForegroundColor Yellow
        Write-Host "  3. Run this script again" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Database folder doesn't exist (already clean)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start MySQL from XAMPP Control Panel" -ForegroundColor White
Write-Host "  2. Run: npx prisma db push" -ForegroundColor White
Write-Host ""
