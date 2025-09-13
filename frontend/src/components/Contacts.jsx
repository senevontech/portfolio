// src/components/Contact.jsx
import React, { useState } from "react";
// import GlassBall3D from "./GlassBall3D";
// import Eye3D from "./eye3D";
import TextPressure from "./TextPressure";
import "../styles/contacts.css";
import { submitContact } from "../api/axios";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    message: "",
    extra: "", // honeypot (bots may fill this)
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    // WhatsApp/message optional
    return "";
  }

  const trimPayload = (f) => ({
    name: f.name.trim(),
    email: f.email.trim(),
    whatsapp: (f.whatsapp || "").trim(),
    message: (f.message || "").trim(),
  });

  async function onSubmit(e) {
    e.preventDefault();
    // simple honeypot: if filled, silently succeed but do nothing
    if (form.extra) {
      setToast({ type: "success", msg: "Request sent! Check your email for confirmation." });
      setForm({ name: "", email: "", whatsapp: "", message: "", extra: "" });
      return;
    }

    const err = validate();
    if (err) {
      setToast({ type: "error", msg: err });
      return;
    }

    setSubmitting(true);
    setToast({ type: "", msg: "" });
    try {
      const data = await submitContact(trimPayload(form));
      if (!data?.ok) throw new Error(data?.error || "Request submitted");

      setToast({
        type: "success",
        msg: "Request sent! Check your email for confirmation.",
      });
      setForm({ name: "", email: "", whatsapp: "", message: "", extra: "" });
    } catch (err) {
      const message =
        err?.message === "Request failed" && err?.status === 0
          ? "Could not reach server. Is the backend running?"
          : err?.message || "Failed to send. Please try again.";
      setToast({ type: "error", msg: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="contact reveal">
      <div className="contact-wrap glass">
        <div className="contact-left">
          <h3>Contact Us:</h3>
          <ul className="contact-list">
            <li>
              📧{" "}
              <a href="mailto:senevontech@gmail.com">senevontech@gmail.com</a>
            </li>
            <li>
              📞 <a href="tel:+919477235928">+91 9477235928</a>
            </li>
            <li>📍 Newtown, Kolkata-700080</li>
          </ul>

          <div className="contact-or">Or</div>

          <form className="contact-form" onSubmit={onSubmit} noValidate>
            {/* Honeypot (hidden from users) */}
            <input
              type="text"
              name="extra"
              value={form.extra}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
            />

            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              aria-label="Your name"
              required
              disabled={submitting}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              aria-label="Your email"
              required
              disabled={submitting}
            />
            <input
              type="text"
              name="whatsapp"
              placeholder="WhatsApp No."
              value={form.whatsapp}
              onChange={handleChange}
              aria-label="Your WhatsApp number"
              disabled={submitting}
            />
            <textarea
              name="message"
              placeholder="Tell us about your project (optional)"
              rows={4}
              value={form.message}
              onChange={handleChange}
              aria-label="Your message"
              disabled={submitting}
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send Request"}
            </button>
          </form>

          {toast.msg ? (
            <div
              className={`contact-toast ${toast.type === "success" ? "ok" : "err"}`}
              role="status"
              aria-live="polite"
            >
              {toast.msg}
            </div>
          ) : null}
        </div>

        {/* Optional 3D / Eye blocks kept commented per your file */}
        {/* <div className="contact-3d">
          <GlassBall3D modelUrl="/models/glassBall.glb" fit={0.8} sizeMultiplier={1.6} />
        </div> */}

        <div style={{ position: "relative", height: "300px" }}>
          <TextPressure
            text="Hello!"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="#ffffff"
            strokeColor="#ff0000"
            minFontSize={36}
          />
        </div>

        {/* <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", gap: 40 }}>
          <Eye3D size={220} />
          <Eye3D size={280} irisColor="#9b5cff" glowColor="rgba(155,92,255,0.55)" tilt={12} />
        </div> */}
      </div>
    </section>
  );
}
