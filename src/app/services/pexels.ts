// Pexels API Service for fetching images
import { PEXELS_API_KEY, PEXELS_API_URL } from "../config/api";

const API_KEY = PEXELS_API_KEY;

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface PexelsResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

/**
 * Search for images on Pexels
 * @param query - Search query (e.g., "sunset", "cat", "city")
 * @param perPage - Number of results per page (default: 6)
 * @returns Array of photo URLs
 */
export async function searchPexelsImages(
  query: string,
  perPage: number = 6,
  page: number = 1
): Promise<PexelsPhoto[]> {
  try {

    const response = await fetch(
      `${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`,
      {
        method: "GET",
        headers: {
          Authorization: API_KEY,
        },
      }
    );


    if (!response.ok) {
      throw new Error(`Image generation error ${response.status}`);
    }

    const data: PexelsResponse = await response.json();

    return data.photos;
  } catch (error) {
    throw error;
  }
}

