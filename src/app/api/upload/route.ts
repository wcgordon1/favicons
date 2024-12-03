import { NextResponse } from 'next/server'
import sharp from 'sharp'
import archiver from 'archiver'
import { writeFile, mkdir, rm } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { Readable } from 'stream'

export async function POST(request: Request) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Create a unique temporary directory for this request
  const tempDir = join(process.cwd(), 'temp', randomUUID())
  await mkdir(tempDir, { recursive: true })

  const logs: string[] = []
  const log = (message: string) => {
    console.log(message)
    logs.push(message)
  }

  try {
    log('Starting image conversion process...')

    // Process the image into different formats
    await Promise.all([
      sharp(buffer).resize(512, 512).toFile(join(tempDir, 'web-app-manifest-512x512.png'))
        .then(() => log('Created web-app-manifest-512x512.png')),
      sharp(buffer).resize(192, 192).toFile(join(tempDir, 'web-app-manifest-192x192.png'))
        .then(() => log('Created web-app-manifest-192x192.png')),
      sharp(buffer).resize(180, 180).toFile(join(tempDir, 'apple-touch-icon.png'))
        .then(() => log('Created apple-touch-icon.png')),
      sharp(buffer).resize(96, 96).toFile(join(tempDir, 'favicon-96x96.png'))
        .then(() => log('Created favicon-96x96.png')),
      sharp(buffer).resize(48, 48).toFile(join(tempDir, 'favicon-48x48.png'))
        .then(() => log('Created favicon-48x48.png')),
      sharp(buffer).resize(32, 32).toFile(join(tempDir, 'favicon-32x32.png'))
        .then(() => log('Created favicon-32x32.png')),
      sharp(buffer).resize(16, 16).toFile(join(tempDir, 'favicon-16x16.png'))
        .then(() => log('Created favicon-16x16.png')),
      createMultiSizeIco(buffer, join(tempDir, 'favicon.ico'))
        .then(() => log('Created favicon.ico')),
      file.type === 'image/svg+xml'
        ? writeFile(join(tempDir, 'favicon.svg'), buffer).then(() => log('Copied original favicon.svg'))
        : sharp(buffer).resize(48, 48).toFormat('svg').toFile(join(tempDir, 'favicon.svg'))
            .then(() => log('Created favicon.svg'))
    ])

    log('All image conversions completed.')

    // Create ZIP file
    log('Starting ZIP file creation...')
    const archive = archiver('zip', { zlib: { level: 9 } })
    const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      archive.on('data', (chunk) => chunks.push(chunk))
      archive.on('end', () => {
        log('ZIP file creation completed.')
        resolve(Buffer.concat(chunks))
      })
      archive.on('error', reject)

      archive.directory(tempDir, false)
      archive.finalize()
    })

    // Clean up the temporary directory
    await rm(tempDir, { recursive: true, force: true })
    log('Temporary directory cleaned up.')

    // Create a readable stream from the ZIP buffer
    const stream = new Readable()
    stream.push(zipBuffer)
    stream.push(null)

    log('Sending ZIP file for download...')

    return new NextResponse(stream as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="favicons.zip"',
        'Content-Length': zipBuffer.length.toString(),
        'X-Conversion-Logs': JSON.stringify(logs)
      }
    })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing image',
      logs: logs
    }, { status: 500 })
  }
}

async function createMultiSizeIco(inputBuffer: Buffer, outputPath: string) {
  const sizes = [16, 32, 48]
  const buffers = await Promise.all(
    sizes.map(size => sharp(inputBuffer).resize(size, size).toFormat('png').toBuffer())
  )
  
  const icoBuffer = await sharp(buffers[0])
    .ensureAlpha()
    .toFormat('ico', { sizes })
    .toBuffer()
  
  await writeFile(outputPath, icoBuffer)
}

