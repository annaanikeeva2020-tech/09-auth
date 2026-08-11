import axios from "axios";
import type { Note, NoteTag } from "@/types/note";

const client = axios.create({
  baseURL: "https://notehub-public.goit.study/api",
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NOTEHUB_TOKEN}`,
  },
});

interface FetchNotesParams {
  page: number;
  perPage?: number;
  search?: string;
  tag?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface NewNoteData {
  title: string;
  content: string;
  tag: NoteTag;
}

export async function fetchNotes({
  page,
  perPage = 12,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response = await client.get<FetchNotesResponse>('/notes', {
    params: {
      page: page,
      perPage: perPage,
      search: search,
      ...(tag ? { tag } : {}),
    },
  });
  return response.data;
}

export async function fetchNoteById(noteId: string): Promise<Note> {
  const response = await client.get<Note>(`/notes/${noteId}`);
  return response.data;
}

export async function createNote(noteData: NewNoteData): Promise<Note> {
  const response = await client.post<Note>('/notes', noteData);
  return response.data;
}

export async function deleteNote(noteId: string): Promise<Note> {
  const response = await client.delete<Note>(`/notes/${noteId}`);
  return response.data;
}