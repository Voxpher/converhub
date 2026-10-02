'use client';

import { useState } from 'react';

const CONTACT_EMAIL = 'hello@example.com'; // placeholder — replace before launch

export function ContactForm() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const inputClass =
    'mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `${message}\n\n— ${name}`.trim();
    const href =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(subject || 'ConvertHub feedback')}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="contact-name" className="text-sm font-medium">
          Your name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          maxLength={100}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-subject" className="text-sm font-medium">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Tool request, bug report…"
          maxLength={150}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what is on your mind…"
          rows={5}
          maxLength={5000}
          required
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        Open in my email app
      </button>
    </form>
  );
}
