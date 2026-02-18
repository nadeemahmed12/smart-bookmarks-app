"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  useEffect(() => {
  const getSession = async () => {
    const { data } = await supabase.auth.getSession()
    setSession(data.session)

    if (data.session) {
      fetchBookmarks(data.session.user.id)
    }
  }

  getSession()

  const { data: listener } = supabase.auth.onAuthStateChange(
  async (_event, session) => {
    setSession(session)

    if (session?.user?.id) {
      await fetchBookmarks(session.user.id)
    } else {
      setBookmarks([]) // logout case
    }
  }
)

  return () => {
    listener.subscription.unsubscribe()
  }
}, [])


  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  useEffect(() => {
  if (!session?.user?.id) return

  const channel = supabase
    .channel(`bookmarks-${session.user.id}`)
    .on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "bookmarks",
  },
      (payload) => {
        console.log("Realtime event:", payload)
        fetchBookmarks(session.user.id)
      }
    )
    .subscribe((status) => {
      console.log("Realtime status:", status)
    })

  return () => {
    supabase.removeChannel(channel)
  }
}, [session?.user?.id])


  const addBookmark = async () => {
  if (!title || !url) return

  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    alert("Session not ready. Please try again.")
    return
  }

  const { error } = await supabase
    .from("bookmarks")
    .insert([
      {
        title,
        url,
        user_id: session.user.id,
      },
    ])

  if (error) {
    console.error("Insert error:", error)
    alert(error.message)
    return
  }

  setTitle("")
  setUrl("")
  fetchBookmarks(session.user.id)
}

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
    fetchBookmarks(session.user.id)
  }

  if (!session) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Smart Bookmarks App
        </h1>

        <p className="text-gray-500 mb-8">
          Save and manage your favorite links securely.
        </p>

        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({ provider: "google" })
          }
          className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg py-3 hover:bg-gray-100 transition shadow-sm"
        >
          {/* Google SVG Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="24px"
            height="24px"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.4 0 6.5 1.2 8.9 3.2l6.6-6.6C35.6 2.3 30.1 0 24 0 14.7 0 6.7 5.5 2.7 13.4l7.9 6.1C12.6 13.3 17.8 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.1 24.5c0-1.7-.1-3.3-.4-4.9H24v9.3h12.4c-.5 2.8-2 5.2-4.3 6.8l6.6 5.1c3.9-3.6 7.4-8.9 7.4-16.3z"
            />
            <path
              fill="#FBBC05"
              d="M10.6 28.5c-1-2.8-1-5.8 0-8.6l-7.9-6.1C.9 17.5 0 20.7 0 24s.9 6.5 2.7 9.2l7.9-6.7z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.5 0 12-2.1 16-5.7l-6.6-5.1c-2 1.3-4.6 2.1-9.4 2.1-6.2 0-11.4-3.8-13.4-9.1l-7.9 6.1C6.7 42.5 14.7 48 24 48z"
            />
          </svg>

          <span className="text-gray-700 font-medium">
            Sign in with Google
          </span>
        </button>

      </div>
    </div>
  )
}


  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-start py-16 px-4">
    <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">

      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Smart Bookmarks App
      </h1>

      <p className="text-center text-gray-500 mb-6">
        Welcome {session.user.email}
      </p>

      {/* Input Section */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Bookmark Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="text"
          placeholder="Website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          onClick={addBookmark}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
        >
          Add
        </button>
      </div>

      {/* Bookmark List */}
      <div className="space-y-4">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="bg-gray-50 hover:bg-gray-100 transition border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm"
          >
            <div>
              <p className="font-semibold text-gray-800">
                {bookmark.title}
              </p>
              <a
                href={bookmark.url}
                target="_blank"
                className="text-blue-600 text-sm hover:underline"
              >
                {bookmark.url}
              </a>
            </div>

            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-10 text-center">
        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

    </div>
  </div>
)
}
