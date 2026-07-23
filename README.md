# HaloAI — AI Voice Receptionist for Small Business in Poland 📞🤖

**HaloAI** is a lightweight, self-service AI voice receptionist for micro-SMBs in Poland (hairdressers, mechanics, beauty salons, plumbers, tutors).

---

## 🎯 Key Features
1. **Missed Call Interception:** Automatically handles call forwarding from the owner's phone when busy or unavailable.
2. **Natural Polish Conversation:** Powered by ElevenLabs TTS (Polish voice) and OpenAI GPT-4o-mini for natural dialogue.
3. **Automated Booking & Alerts:** Automatically logs appointments into Google Calendar and sends instant SMS/Telegram alerts to the business owner.
4. **RODO / GDPR Compliance:** Spoken disclaimer at the start of every call to meet EU regulations.

---

## 🛠 System Architecture
* **Voice Engine:** Vapi.ai / Retell AI
* **TTS (Voice):** ElevenLabs (Polish accent)
* **LLM Core:** OpenAI GPT-4o-mini
* **Backend:** Python (FastAPI) + Webhooks
* **Notifications:** Telegram Bot API / Twilio SMS

---

## 📁 Project Structure
* `prompts/` — Industry-specific prompt templates in English (`mechanic_prompt.md`, `barber_prompt.md`, `beauty_prompt.md`).
* `server.py` — FastAPI webhook server to handle call events.
* `.env.example` — Environment configuration keys.
