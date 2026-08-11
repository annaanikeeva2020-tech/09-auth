import { cookies } from "next/headers";
import axios from "axios";

import type { Note } from "@/types/note";
import type { User } from "@/types/user";

const baseURL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

interface FetchNotesParams {
  page: number;
  perPage?: number;
  search?: string;
  tag?: string;
}

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export async function fetchNotes({
  page,
  perPage = 12,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const cookieStore = await cookies();

  const response = await axios.get<FetchNotesResponse>(
    `${baseURL}/notes`,
    {
      params: {
        page,
        perPage,
        search,
        ...(tag ? { tag } : {}),
      },
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );

  return response.data;
}

export async function fetchNoteById(
  noteId: string
): Promise<Note> {
  const cookieStore = await cookies();

  const response = await axios.get<Note>(
    `${baseURL}/notes/${noteId}`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );

  return response.data;
}

export async function getMe(): Promise<User> {
  const cookieStore = await cookies();

  const response = await axios.get<User>(
    `${baseURL}/users/me`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );

  return response.data;
}

export async function checkSession(): Promise<User | null> {
  const cookieStore = await cookies();

  try {
    const response = await axios.get<User | null>(
      `${baseURL}/auth/session`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
      }
    );

    return response.data ?? null;
  } catch {
    return null;
  }
}