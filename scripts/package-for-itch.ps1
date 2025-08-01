# Package Birthday Bundle for itch.io Upload
# This script creates ONE zip file with the games and root index.html

param(
    [string]$OutputDir = ".\birthday-bundle-build",
    [switch]$CleanFirst = $false
)

Write-Host "🎮 Packaging Birthday Bundle for itch.io..." -ForegroundColor Cyan

# Get the script's directory (should be scripts folder)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root
Set-Location $ProjectRoot

# Create output directory
$BuildDir = Join-Path $ProjectRoot $OutputDir
if ($CleanFirst -and (Test-Path $BuildDir)) {
    Write-Host "🧹 Cleaning existing build directory..." -ForegroundColor Yellow
    Remove-Item $BuildDir -Recurse -Force
}

if (!(Test-Path $BuildDir)) {
    New-Item -ItemType Directory -Path $BuildDir | Out-Null
}

# Items to include in the bundle (exactly what you specified)
$ItemsToInclude = @(
    @{
        Name = "Galaxy Garden Crush"
        Source = "galaxy-garden-crush"
        Type = "Folder"
    },
    @{
        Name = "Captain's Card"
        Source = "captains-card"
        Type = "Folder"
    },
    @{
        Name = "Detective Case"
        Source = "detective-case"
        Type = "Folder"
    },
    @{
        Name = "Root Index"
        Source = "index.html"
        Type = "File"
    }
)

# Create the bundle zip
Write-Host "📦 Creating birthday-bundle.zip..." -ForegroundColor Green
$BundleZipPath = Join-Path $BuildDir "birthday-bundle.zip"

if (Test-Path $BundleZipPath) {
    Remove-Item $BundleZipPath -Force
}

try {
    # Create temp directory for the bundle
    $TempDir = Join-Path $BuildDir "temp-bundle"
    if (Test-Path $TempDir) {
        Remove-Item $TempDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $TempDir | Out-Null
    
    # Copy specified items
    foreach ($Item in $ItemsToInclude) {
        $SourcePath = Join-Path $ProjectRoot $Item.Source
        if (Test-Path $SourcePath) {
            Write-Host "   📁 Adding $($Item.Name)..." -ForegroundColor Gray
            
            if ($Item.Type -eq "Folder") {
                $DestPath = Join-Path $TempDir $Item.Source
                Copy-Item $SourcePath $DestPath -Recurse
            } else {
                # It's a file
                Copy-Item $SourcePath $TempDir
            }
        } else {
            Write-Host "   ⚠️  Warning: $($Item.Source) not found, skipping..." -ForegroundColor Yellow
        }
    }
    
    # Create the bundle zip
    Compress-Archive -Path "$TempDir\*" -DestinationPath $BundleZipPath -CompressionLevel Optimal
    
    # Clean up temp directory
    Remove-Item $TempDir -Recurse -Force
    
    $BundleSize = (Get-Item $BundleZipPath).Length / 1MB
    Write-Host "✅ Created birthday-bundle.zip ($([math]::Round($BundleSize, 2)) MB)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to create bundle zip: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Show summary
Write-Host "`n🎉 Packaging Complete!" -ForegroundColor Cyan
Write-Host "📁 Output: $BundleZipPath" -ForegroundColor Gray
Write-Host "📦 Size: $([math]::Round($BundleSize, 2)) MB" -ForegroundColor Gray

Write-Host "`n💡 Upload Tips for itch.io:" -ForegroundColor Yellow
Write-Host "   • Upload birthday-bundle.zip as your game files" -ForegroundColor Gray
Write-Host "   • Set main file to 'homepage/index.html' (or whichever game you want as entry point)" -ForegroundColor Gray
Write-Host "   • Set viewport to 1200x800 if experiencing scaling issues" -ForegroundColor Gray
Write-Host "   • Enable 'Mobile friendly' for touch support" -ForegroundColor Gray
Write-Host "   • Use 'Any' orientation for best compatibility" -ForegroundColor Gray
Write-Host "   • Consider disabling fullscreen for better mobile experience" -ForegroundColor Gray

Write-Host "`n🚀 Ready for upload to itch.io!" -ForegroundColor Green
