import ImageUploader from '@/components/ImageUploader'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">FaviconConverter.com</div>
            <h1 className="block mt-1 text-lg leading-tight font-medium text-black">Convert your image to favicon formats</h1>
            <p className="mt-2 text-gray-500">Upload an image and we'll convert it into multiple favicon-compatible file types and sizes.</p>
            <ImageUploader />
            <div className="mt-6">
              <h2 className="text-md font-medium text-gray-900">Conversion Details:</h2>
              <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                <li>PNG: 512x512, 192x192, 96x96</li>
                <li>Apple Touch Icon: 180x180 PNG</li>
                <li>ICO: 48x48 (simplified version)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

