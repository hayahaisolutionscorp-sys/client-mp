import { IPress } from '@/models';
import { PRESS_RELEASES_API, SEO_API } from 'constants/api';
import { IS_BUILD_TIME } from '../config';

import pressData from '@/data/press.json';
import { DEFAULT_PRESS_BUILDER_CONTENT, type PressBuilderContent } from '@/lib/press-builder';

export interface IPressPage {
  id: string;
  page_type: string;
  title: string;
  content: PressBuilderContent | null;
  seo_config: Record<string, unknown> | null;
  header_config: Record<string, unknown> | null;
  show_in_footer: boolean;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface IPressSection {
  id: string;
  page_id: string;
  type: string;
  bg_type: string | null;
  bg_url: string | null;
  bg_alt: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string | null;
}

const FALLBACK_PRESS_PAGE: IPressPage = {
  id: 'press-fallback',
  page_type: 'press',
  title: 'News & Updates',
  content: DEFAULT_PRESS_BUILDER_CONTENT,
  seo_config: null,
  header_config: null,
  show_in_footer: false,
  slug: 'press',
  created_at: null,
  updated_at: null,
};

export async function getPressPage(): Promise<IPressPage> {
  if (IS_BUILD_TIME) {
    return FALLBACK_PRESS_PAGE;
  }

  try {
    const res = await fetch(`${SEO_API}/press`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch press page');
    }

    const { data } = await res.json();
    return data;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching press page:', e);
    }
    return FALLBACK_PRESS_PAGE;
  }
}

export async function getPressSections(): Promise<IPressSection[]> {
  try {
    if (IS_BUILD_TIME) {
      return [];
    }

    const res = await fetch(`${SEO_API}/press/page-sections`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch press sections');
    }

    const { data } = await res.json();
    return (data as IPressSection[]).sort(
      (left, right) => (left.display_order || 0) - (right.display_order || 0)
    );
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching press sections:', e);
    }
    return [];
  }
}

export async function getPress(): Promise<IPress[]> {
  try {
    if (IS_BUILD_TIME) {
      return pressData.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        publish_date: p.publishedDate,
        slug: p.id,
        display_order: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: null,
      })) as IPress[];
    }

    const res = await fetch(PRESS_RELEASES_API, {
      cache: 'no-store',
    });

    if (res.ok) {
      const { data } = await res.json();
      return (data as IPress[])
        .filter((item) => item.is_active)
        .sort((left, right) => {
          const orderDiff = (left.display_order || 0) - (right.display_order || 0);
          if (orderDiff !== 0) {
            return orderDiff;
          }
          return new Date(right.publish_date).getTime() - new Date(left.publish_date).getTime();
        });
    }

    return [];
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching press:', e);
    }
    return (pressData as any[]).map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      publish_date: p.publishedDate,
      slug: p.id,
      display_order: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: null,
    })) as IPress[];
  }
}



export async function getPressById(
  idOrSlug: number | string
): Promise<IPress | undefined> {
  const press = await getPress();
  return press.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug);
}
