# PowerShell script to copy MP3s from mp3s folder to assets/music with correct names
# Run this script after you've put your 5 MP3 files in the mp3s folder

$mp3sFolder = "c:\Projects\birthday-bundle\mp3s"
$musicFolder = "c:\Projects\birthday-bundle\galaxy-garden-crush\assets\music"

# Check if mp3s folder exists and has files
if (-not (Test-Path $mp3sFolder)) {
    Write-Host "mp3s folder not found at $mp3sFolder" -ForegroundColor Red
    exit 1
}

$mp3Files = Get-ChildItem -Path $mp3sFolder -Filter "*.mp3" | Sort-Object Name

if ($mp3Files.Count -eq 0) {
    Write-Host "No MP3 files found in $mp3sFolder" -ForegroundColor Red
    exit 1
}

if ($mp3Files.Count -ne 5) {
    Write-Host "Expected 5 MP3 files, found $($mp3Files.Count)" -ForegroundColor Yellow
    Write-Host "Files found:" -ForegroundColor Yellow
    $mp3Files | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Yellow }
}

# Copy files with correct names
for ($i = 0; $i -lt [Math]::Min(5, $mp3Files.Count); $i++) {
    $sourceFile = $mp3Files[$i].FullName
    $destFile = Join-Path $musicFolder "song$($i + 1).mp3"
    
    Write-Host "Copying $($mp3Files[$i].Name) -> song$($i + 1).mp3" -ForegroundColor Green
    Copy-Item -Path $sourceFile -Destination $destFile -Force
}

# Delete old WAV files
Write-Host "`nRemoving old WAV files..." -ForegroundColor Yellow
$wavFiles = Get-ChildItem -Path $musicFolder -Filter "*.wav"
foreach ($wavFile in $wavFiles) {
    Write-Host "Removing $($wavFile.Name)" -ForegroundColor Yellow
    Remove-Item -Path $wavFile.FullName -Force
}

Write-Host "`nDone! Your MP3 files have been copied and WAV files removed." -ForegroundColor Green

# Show the new file sizes for comparison
Write-Host "`nNew MP3 file sizes:" -ForegroundColor Cyan
Get-ChildItem -Path $musicFolder -Filter "*.mp3" | Select-Object Name, @{Name="Size (MB)"; Expression={[Math]::Round($_.Length / 1MB, 2)}} | Format-Table -AutoSize
