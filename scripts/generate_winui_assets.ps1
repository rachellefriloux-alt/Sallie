Add-Type -AssemblyName System.Drawing

function Resize-Png($src, $dest, $width, $height) {
    $image = [System.Drawing.Image]::FromFile($src)
    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CompositingQuality = 'HighQuality'
    $graphics.InterpolationMode = 'HighQualityBicubic'
    $graphics.SmoothingMode = 'HighQuality'
    $graphics.DrawImage($image, 0, 0, $width, $height)
    $bitmap.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    $image.Dispose()
}

$sourceIcon = "c:\Sallie\desktop\assets\icon-512.png"
$assetsDir = "c:\Sallie\SallieStudioApp\Assets"
New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null

Resize-Png $sourceIcon (Join-Path $assetsDir 'Square150x150Logo.png') 150 150
Resize-Png $sourceIcon (Join-Path $assetsDir 'Square44x44Logo.png') 44 44
Resize-Png $sourceIcon (Join-Path $assetsDir 'StoreLogo.png') 50 50
