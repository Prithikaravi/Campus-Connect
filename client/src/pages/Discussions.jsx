import { useState } from "react";
import { discussions as mockDiscussions, discussionCategories } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Input from "../components/Input";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/format";

export default function Discussions() {
  const { user } = useAuth();
  // TODO (backend): replace mockDiscussions with api.get("/api/discussions")
  const [posts, setPosts] = useState(mockDiscussions);
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", body: "", category: "General" });
  const [openId, setOpenId] = useState(null);
  const [reply, setReply] = useState("");

  const list = posts.filter((p) => category === "All" || p.category === category);

  const createPost = (e) => {
    e.preventDefault();
    if (!newPost.title.trim()) return;
    setPosts([{ _id: String(Date.now()), ...newPost, author: user?.name || "You", date: new Date().toISOString(), replies: [] }, ...posts]);
    setNewPost({ title: "", body: "", category: "General" });
    setShowForm(false);
  };

  const addReply = (id) => {
    if (!reply.trim()) return;
    setPosts(posts.map((p) => (p._id === id ? { ...p, replies: [...p.replies, { author: user?.name || "You", text: reply }] } : p)));
    setReply("");
  };

  return (
    <div>
      <PageHeader title="Discussions" subtitle="Ask questions and share ideas with other students."
        action={<Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "New discussion"}</Button>} />

      {showForm && (
        <form onSubmit={createPost} className="mb-6 space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <Input label="Title" placeholder="What do you want to discuss?" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
          <div>
            <label htmlFor="d-body" className="mb-1.5 block text-sm font-medium text-slate-700">Details</label>
            <textarea id="d-body" rows={3} value={newPost.body} onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#5877D9] focus:outline-none focus:ring-2 focus:ring-[#5877D9]/30" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })} aria-label="Category"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm">
              {discussionCategories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
            <Button type="submit">Post discussion</Button>
          </div>
        </form>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {discussionCategories.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === c ? "bg-[#5877D9] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon="chat" title="No discussions yet" message="Start the first conversation in this category." />
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <article key={p._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <Badge>{p.category}</Badge>
                <span className="text-xs text-slate-400">{formatDate(p.date)}</span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-800">{p.title}</h3>
              {p.body && <p className="mt-1 text-sm text-slate-600">{p.body}</p>}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">Posted by {p.author}</span>
                <button onClick={() => setOpenId(openId === p._id ? null : p._id)} className="font-medium text-[#5877D9] hover:underline">
                  {p.replies.length} {p.replies.length === 1 ? "reply" : "replies"}
                </button>
              </div>

              {openId === p._id && (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  {p.replies.map((r, i) => (
                    <div key={i} className="rounded-xl bg-[#F6F8FC] px-4 py-3 text-sm">
                      <p className="font-semibold text-slate-800">{r.author}</p>
                      <p className="text-slate-600">{r.text}</p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#5877D9] focus:outline-none focus:ring-2 focus:ring-[#5877D9]/30" />
                    <Button onClick={() => addReply(p._id)}>Reply</Button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}