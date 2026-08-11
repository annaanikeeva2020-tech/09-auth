import api from "./api";
import type { Note, NoteTag } from "@/types/note";
import type { User } from "@/types/user";

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

interface AuthCredentials {
  email: string;
  password: string;
}

export async function fetchNotes({
  page,
  perPage = 12,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage,
      search,
      ...(tag ? { tag } : {}),
    },
  });

  return response.data;
}

export async function fetchNoteById(noteId: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${noteId}`);

  return response.data;
}

export async function createNote(noteData: NewNoteData): Promise<Note> {
  const response = await api.post<Note>("/notes", noteData);

  return response.data;
}

export async function deleteNote(noteId: string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${noteId}`);

  return response.data;
}

export async function register(
  credentials: AuthCredentials
): Promise<User> {
  const response = await api.post<User>("/auth/register", credentials);

  return response.data;
}

export async function login(
  credentials: AuthCredentials
): Promise<User> {
  const response = await api.post<User>("/auth/login", credentials);

  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function checkSession(): Promise<User | null> {
  const response = await api.get<User | null>("/auth/session");

  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/users/me");

  return response.data;
}

export async function updateMe(
  userData: Pick<User, "username">
): Promise<User> {
  const response = await api.patch<User>("/users/me", userData);

  return response.data;
}