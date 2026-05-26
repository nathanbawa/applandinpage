Add-Type -AssemblyName System.Drawing

$inputPath = "C:\Users\natha\Downloads\GenialprojectRW\images\logobank.png"
$img = [System.Drawing.Image]::FromFile($inputPath)
$bmp = New-Object System.Drawing.Bitmap($img)

[int]$w = $bmp.Width
[int]$h = $bmp.Height

[int]$colW = [int]($w / 2)
[int]$rowH = [int]($h / 3)

$banks = @(
    @{ Name="rbc"; Col=0; Row=0 },
    @{ Name="td"; Col=1; Row=0 },
    @{ Name="cibc"; Col=0; Row=1 },
    @{ Name="bmo"; Col=1; Row=1 },
    @{ Name="scotia"; Col=0; Row=2 } 
)

# Make black transparent
$bmp.MakeTransparent([System.Drawing.Color]::Black)

foreach ($bank in $banks) {
    [int]$cropX = $bank.Col * $colW
    [int]$cropY = $bank.Row * $rowH
    [int]$cropW = $colW
    
    if ($bank.Name -eq "scotia") {
        # Scotiabank is centered in the bottom row. Let's crop from the middle.
        $cropX = [int]($w / 4)
    }
    
    $cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $rowH)
    
    $targetBmp = New-Object System.Drawing.Bitmap($cropW, $rowH)
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $rowH)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $outPath = "C:\Users\natha\Downloads\GenialprojectRW\images\" + $bank.Name + ".png"
    $targetBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
}

$bmp.Dispose()
$img.Dispose()
Write-Output "Done cropping!"
