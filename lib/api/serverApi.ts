import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import api from "./api";

import type { Note } from "@/types/note";
import type { User } from "@/types/user";

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

  const response = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage,
      search,
      ...(tag ? { tag } : {}),
    },
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}

export async function fetchNoteById(
  noteId: string
): Promise<Note> {
  const cookieStore = await cookies();

  const response = await api.get<Note>(`/notes/${noteId}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}

export async function getMe(): Promise<User> {
  const cookieStore = await cookies();

  const response = await api.get<User>("/users/me", {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}

export async function checkSession(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (accessToken) {
    return api.get<User | null>("/auth/session", {
      headers: {
        Cookie: `accessToken=${accessToken}`,
      },
    });
  }

  if (!refreshToken) {
    return null;
  }

  return api.get<User | null>("/auth/session", {
    headers: {
      Cookie: `refreshToken=${refreshToken}`,
    },
  });
}