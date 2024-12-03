'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import imageCompression from 'browser-image-compression'
import JSZip from 'jszip'
import saveAs from 'file-saver'

export default function ImageUploader() {
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    setFile(file)
    setImage(URL.createObjectURL(file))
    setLogs([])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  })

  const log = (message: string) => {
    setLogs(prevLogs => [...prevLogs, message])
  }

  const processImage = async (file: File, size: number): Promise<Blob> => {
    log(`Processing image to ${size}x${size}...`)
    const options = {
      maxWidthOrHeight: size,
      useWebWorker: true,
    }
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  }

  const createICO = async (file: File): Promise<Blob> => {
    log('Creating ICO file...')
    const sizes = [16, 32, 48]
    const pngBlobs = await Promise.all(sizes.map(size => processImage(file, size)))
    
    // Here we're just using the 48x48 PNG as ICO
    // For a proper ICO, you'd need a more complex solution
    return pngBlobs[2]
  }

  const handleConvert = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setLogs(['Starting conversion process...'])

    try {
      const zip = new JSZip()

      // Process images
      const tasks = [
        { name: 'web-app-manifest-512x512.png', size: 512 },
        { name: 'web-app-manifest-192x192.png', size: 192 },
        { name: 'apple-touch-icon.png', size: 180 },
        { name: 'favicon-96x96.png', size: 96 },
      ]

      for (const task of tasks) {
        const blob = await processImage(file, task.size)
        zip.file(task.name, blob)
        setProgress(prev => prev + 15)
      }

      // Create ICO
      const icoBlob = await createICO(file)
      zip.file('favicon.ico', icoBlob)

      setProgress(95)

      // Generate ZIP file
      log('Generating ZIP file...')
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'favicons.zip')

      setProgress(100)
      log('Conversion completed. ZIP file downloaded.')
    } catch (error) {
      console.error('Error processing image:', error)
      log('An error occurred during conversion. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setFile(null)
    setIsProcessing(false)
    setProgress(0)
    setLogs([])
  }

  return (
    <div className="mt-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${
          isDragActive ? 'border-indigo-600 bg-indigo-100' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-indigo-600">Drop the image here ...</p>
        ) : (
          <p className="text-gray-500">Drag and drop an image here, or click to select one</p>
        )}
      </div>
      {image && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Preview:</p>
          <div className="relative w-full h-48">
            <Image
              src={image}
              alt="Preview"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
      <Button 
        className="mt-4 w-full" 
        onClick={handleConvert} 
        disabled={!file || isProcessing}
      >
        {isProcessing ? 'Converting...' : 'Convert and Download'}
      </Button>
      {file && (
        <Button 
          className="mt-2 w-full" 
          onClick={handleReset}
          variant="outline"
        >
          Reset
        </Button>
      )}
      {isProcessing && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 mt-2 text-center">{progress}% complete</p>
        </div>
      )}
      {logs.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2">Conversion Logs:</p>
          <ScrollArea className="h-40 w-full rounded border p-4">
            <div className="font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

