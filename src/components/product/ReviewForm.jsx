"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input, { Field } from "@/components/ui/Input";

export default function ReviewForm({ onSubmit, submitting }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !comment) return;
    onSubmit({ rating, title, comment });
    setTitle("");
    setComment("");
    setRating(5);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-line bg-surface p-5">
      <h3 className="stencil text-base font-semibold text-ink">Write a review</h3>
      <Field label="Your rating" required>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              aria-label={`${n} star`}
              className="p-0.5"
            >
              <svg viewBox="0 0 20 20" className="h-6 w-6" fill={n <= rating ? "#C08829" : "#E4E0D6"}>
                <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
              </svg>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Title" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sum up your experience" maxLength={80} />
      </Field>
      <Field label="Review" required>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What did you like or dislike?"
          className="w-full rounded border border-line bg-surface px-3.5 py-2.5 text-sm placeholder:text-ink-muted focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/25"
        />
      </Field>
      <Button type="submit" variant="accent" disabled={submitting}>
        {submitting ? "Posting..." : "Post review"}
      </Button>
    </form>
  );
}
