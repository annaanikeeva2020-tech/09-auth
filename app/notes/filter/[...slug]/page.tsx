import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";

import { fetchNotes } from "@/lib/api";
import NotesClient from "./Notes.client";
import { notFound } from 'next/navigation';
import type { Metadata } from "next";

interface NotesPageProps {
  params: Promise<{slug: string[];}>;
}

export async function generateMetadata({ params }: NotesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentFilter = slug && slug.length > 0 ? slug[0] : 'all';
  const filterTitle = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);

  return {
    title: `${filterTitle} | NoteHub`,
    description: `View and manage notes filtered by tag: ${currentFilter}.`,
    openGraph: {
      title: `${filterTitle} | NoteHub`,
      description: `View and manage notes filtered by tag: ${currentFilter}.`,
      url: `https://notehub.com/notes/filter/${currentFilter}`,
      images: [
        {
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          width: 1200,
          height: 630,
          alt: 'NoteHub',
        },
      ],
    },
  };
}


const validTags = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];


export default async function NotesPage({ params }: NotesPageProps) {
  const { slug } = await params;

  const rawTag = slug[0];
  if (rawTag !== 'all' && !validTags.includes(rawTag)) {
    notFound();
  }
  
  const currentTag = slug[0] === "all" ? undefined : slug[0];

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["notes", 1, "", currentTag],
    queryFn: () =>
      fetchNotes({
        page: 1,
        search: "",
        tag: currentTag,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={currentTag} />
    </HydrationBoundary>
  );
}