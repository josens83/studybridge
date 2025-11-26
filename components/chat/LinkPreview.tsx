'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Globe, Loader2 } from 'lucide-react';
import NextImage from 'next/image';

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
}

interface LinkPreviewProps {
  url: string;
  isOwn?: boolean;
}

// Simple metadata cache to prevent refetching
const metadataCache = new Map<string, LinkMetadata | null>();

export default function LinkPreview({ url, isOwn = false }: LinkPreviewProps) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      // Check cache first
      if (metadataCache.has(url)) {
        setMetadata(metadataCache.get(url) || null);
        setIsLoading(false);
        return;
      }

      try {
        // Use a simple approach - just display the URL with basic info
        // For full metadata, you'd need a server-side API
        const urlObj = new URL(url);
        const basicMetadata: LinkMetadata = {
          url,
          siteName: urlObj.hostname.replace('www.', ''),
          title: urlObj.hostname.replace('www.', ''),
        };

        // For YouTube videos, we can generate thumbnail
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
          const videoId = urlObj.hostname.includes('youtu.be')
            ? urlObj.pathname.slice(1)
            : urlObj.searchParams.get('v');
          if (videoId) {
            basicMetadata.image = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            basicMetadata.siteName = 'YouTube';
            basicMetadata.title = 'YouTube 동영상';
          }
        }

        // For common social sites, add icons/names
        if (urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com')) {
          basicMetadata.siteName = 'X (Twitter)';
        } else if (urlObj.hostname.includes('instagram.com')) {
          basicMetadata.siteName = 'Instagram';
        } else if (urlObj.hostname.includes('facebook.com')) {
          basicMetadata.siteName = 'Facebook';
        } else if (urlObj.hostname.includes('github.com')) {
          basicMetadata.siteName = 'GitHub';
        } else if (urlObj.hostname.includes('naver.com')) {
          basicMetadata.siteName = 'Naver';
        } else if (urlObj.hostname.includes('kakao.com')) {
          basicMetadata.siteName = 'Kakao';
        }

        metadataCache.set(url, basicMetadata);
        setMetadata(basicMetadata);
      } catch (err) {
        setError(true);
        metadataCache.set(url, null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  if (isLoading) {
    return (
      <div className={`mt-2 p-3 rounded-lg border ${isOwn ? 'border-blue-400 bg-blue-500/50' : 'border-gray-200 bg-gray-50'}`}>
        <Loader2 className={`w-4 h-4 animate-spin ${isOwn ? 'text-white' : 'text-gray-400'}`} />
      </div>
    );
  }

  if (error || !metadata) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block mt-2 rounded-lg border overflow-hidden transition hover:opacity-90 ${
        isOwn
          ? 'border-blue-400 bg-blue-500/30'
          : 'border-gray-200 bg-white'
      }`}
    >
      {metadata.image && (
        <div className="relative w-full h-32">
          <NextImage
            src={metadata.image}
            alt={metadata.title || 'Preview'}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="p-3">
        <div className={`flex items-center gap-1 text-xs mb-1 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
          <Globe className="w-3 h-3" />
          <span>{metadata.siteName}</span>
        </div>
        {metadata.title && (
          <p className={`text-sm font-medium line-clamp-1 ${isOwn ? 'text-white' : 'text-gray-900'}`}>
            {metadata.title}
          </p>
        )}
        {metadata.description && (
          <p className={`text-xs mt-1 line-clamp-2 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            {metadata.description}
          </p>
        )}
        <div className={`flex items-center gap-1 mt-2 text-xs ${isOwn ? 'text-blue-200' : 'text-blue-600'}`}>
          <ExternalLink className="w-3 h-3" />
          <span className="truncate">{url}</span>
        </div>
      </div>
    </a>
  );
}

// URL detection utility
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"\]]+)/gi;
  const matches = text.match(urlRegex);
  return matches || [];
}

// Render text with clickable links
export function renderTextWithLinks(
  text: string,
  isOwn: boolean = false
): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s<>"\]]+)/gi;
  const parts = text.split(urlRegex);
  const matches: string[] = text.match(urlRegex) || [];

  const result: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part && matches.includes(part)) {
      result.push(
        <a
          key={`link-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline break-all ${isOwn ? 'text-blue-200' : 'text-blue-600'} hover:opacity-80`}
        >
          {part}
        </a>
      );
    } else if (part) {
      result.push(part);
    }
  });

  return result;
}
