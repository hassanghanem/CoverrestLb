export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)

    if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.get("v")) {
      return urlObj.searchParams.get("v")
    }

    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1)
    }

    if (urlObj.pathname.startsWith("/embed/")) {
      return urlObj.pathname.split("/embed/")[1]
    }

    return null
  } catch (error) {
    console.error("Invalid YouTube URL:", url)
    return null
  }
}
