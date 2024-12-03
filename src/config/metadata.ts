export const siteConfig = {
  name: "FaviconConverter.com",
  description: "Free online tool to convert images to favicon formats. Create ICO, PNG, and Apple Touch icons instantly.",
  url: "https://faviconconverter.com",
  ogImage: "/images/og-image.jpg",
  features: {
    imageConverter: {
      title: "Image to Favicon Converter",
      description: "Convert any image to favicon formats. Support for ICO, PNG, and Apple Touch icons. Free online tool.",
      path: "/"
    },
    codePlatform: {
      title: "Code Platform",
      description: "Developer tools for favicon generation. API access, SDK integration, and automation tools.",
      path: "/code-platform"
    },
    nocodePlatform: {
      title: "No-Code Platform",
      description: "Visual favicon editor for designers. Drag-and-drop interface, real-time preview, and batch processing.",
      path: "/nocode-platform"
    }
  }
}

export type SiteConfig = typeof siteConfig

interface MetadataProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "article" | "website" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other"
  keywords?: string[]
  canonical?: string
}

import type { Metadata } from 'next'

export function constructMetadata({
  title,
  description,
  image,
  url,
  type = "website",
  keywords = [],
  canonical
}: MetadataProps = {}): Metadata {
  const defaultKeywords = [
    "favicon converter",
    "ico converter",
    "favicon generator",
    "apple touch icon",
    "favicon maker",
    "online favicon tool"
  ]

  return {
    title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
    description: description || siteConfig.description,
    keywords: [...defaultKeywords, ...keywords].join(", "),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      } as const,
    },
    canonical: canonical || url || siteConfig.url,
    openGraph: {
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description: description || siteConfig.description,
      url: url || siteConfig.url,
      siteName: siteConfig.name,
      type: type || "website",
      images: [
        {
          url: image || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description: description || siteConfig.description,
      images: [image || siteConfig.ogImage],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png"
    },
    manifest: "/site.webmanifest",
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonical || url || siteConfig.url,
    }
  } as const
} 