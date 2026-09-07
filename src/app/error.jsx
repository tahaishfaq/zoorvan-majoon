"use client";
export default function Error({ reset }) {
  return (
    <div className="container section empty">
      <h1>We couldn’t load this page.</h1>
      <p>Please try again in a moment.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
