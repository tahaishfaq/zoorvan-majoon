"use client";

export default function AdminError({ reset }) {
  return (
    <section className="admin-page">
      <h1>Couldn’t load this section.</h1>
      <p>Please try again in a moment.</p>
      <button type="button" className="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
