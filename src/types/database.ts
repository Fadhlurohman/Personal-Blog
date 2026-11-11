export type PostStatus = 'draft' | 'published';
export type MediaType = 'image' | 'video';

export interface Profile {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  comments_enabled: boolean;
  media?: Media[];
  comments_count?: number;
}

export interface Media {
  id: string;
  post_id: string | null;
  file_url: string;
  file_type: MediaType;
  caption: string;
  display_order: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  display_name: string;
  content: string;
  is_hidden: boolean;
  created_at: string;
  is_owner?: boolean; // Dynamically computed server-side via HttpOnly cookie verification
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  social_links: {
    github?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    email?: string;
    [key: string]: string | undefined;
  };
  updated_at: string;
}

export type Database = any;
