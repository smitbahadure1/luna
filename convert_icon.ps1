Add-Type -AssemblyName System.Drawing

$iconPath = "assets\icon.png"
if (Test-Path $iconPath) {
    Write-Host "Reading $iconPath..."
    $img = [System.Drawing.Image]::FromFile($iconPath)
    
    if ($img.RawFormat.Guid -eq [System.Drawing.Imaging.ImageFormat]::Png.Guid) {
        Write-Host "Image is already PNG."
    }
    else {
        Write-Host "Image is NOT PNG (Format: $($img.RawFormat)). Converting..."
        $tempPath = "assets\icon_temp.png"
        $img.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()
        
        Move-Item $tempPath $iconPath -Force
        Write-Host "Converted and replaced assets\icon.png"
    }
}
else {
    Write-Error "File not found: $iconPath"
}
