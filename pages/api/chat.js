/**
 * pages/api/chat.js — Server-side OpenRouter chat API route
 *
 * SECURITY
 * ─────────────────────────────────────────────────────────────────────────────
 * • OPENROUTER_API_KEY lives only here — never sent to the browser.
 * • System instruction is defined server-side and cannot be overridden by the client.
 * • Message history is passed from the browser but only 'user'/'assistant' roles
 *   are accepted — any attempt to inject a system-role override is stripped.
 * • Messages are capped at 4 000 chars each and history at 20 turns.
 *
 * TRACKING INTEGRATION
 * ─────────────────────────────────────────────────────────────────────────────
 * When a message contains a JDC tracking number pattern the server looks up
 * the real shipment from Supabase (via the existing getShipmentByTrackingNumber
 * function) and injects a factual context block into the prompt so the AI can
 * report the real status without inventing anything.
 */

import { normaliseTrackingNumber, isValidTrackingNumber } from '../../lib/tracking';
import { getShipmentByTrackingNumber } from '../../lib/trackingData';

/* ── OpenRouter client (server-only) ─────────────────────────────────────────────
 * Uses OpenAI-compatible API format with the free openrouter/free model.
 * ─────────────────────────────────────────────────────────────────────────── */
const API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openrouter/free';

/* ── Call OpenRouter via OpenAI-compatible API ─────────────────────────────── */
async function callOpenRouter(messages) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Joseph Delivery Company',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 600,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[chat] OpenRouter error:', res.status, errText.slice(0, 300));
    throw new Error(`OpenRouter API returned ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

/* ── System instruction ──────────────────────────────────────────────────── */
const SYSTEM_INSTRUCTION = `You are a professional customer-support assistant for JOSEPHDELIVERYCOMPANY, an international logistics and shipping company.

COMPANY INFORMATION:
- Company: JOSEPHDELIVERYCOMPANY
- Services: Express Delivery, Domestic Shipping, International Shipping, Freight & Cargo
- Website sections: /shipping, /track, /services, /locations, /business, /support, /contact, /quote
- International offices represented in: United States, Brazil, Japan, India, South Korea, France

YOUR ROLE:
- Help customers with shipment tracking, shipping services, quotes, delivery questions, and general logistics enquiries.
- Speak professionally, clearly, and naturally. Be concise.
- Do not say "As an AI" or mention implementation details.
- Do not invent tracking information, delivery times, prices, office addresses, or company policies.
- Do not make up shipment statuses, locations, or customs information.
- If you do not know something specific, say so honestly and direct the customer to contact support.

TRACKING:
- JOSEPHDELIVERYCOMPANY tracking numbers use the format: JDC-YYYY-NNNNN
- When a customer asks about their shipment, ask for the tracking number if they have not provided one.
- When shipment data is provided in the prompt (below), use ONLY that data — do not invent or supplement it.
- If no shipment data is provided for a tracking number, tell the customer the shipment could not be found and ask them to verify the number or contact support.

CONTACT:
- Direct customers to the secure contact form for support.
- Website: /contact

Keep responses focused and helpful. Do not ramble.`;

/* ── Tracking number extractor ────────────────────────────────────────────── */
const TRACKING_REGEX = /JDC-\d{4}-\d{5}|JDC-\d{6}/gi;

function extractTrackingNumbers(text) {
  const matches = text.match(TRACKING_REGEX);
  if (!matches) return [];
  return [...new Set(matches.map(m => normaliseTrackingNumber(m)))];
}

/* ── Build factual shipment context to inject into the prompt ─────────────── */
async function buildShipmentContext(trackingNumbers) {
  if (!trackingNumbers.length) return null;

  const results = [];
  for (const tn of trackingNumbers.slice(0, 2)) {  /* max 2 lookups per message */
    if (!isValidTrackingNumber(tn)) continue;
    try {
      const shipment = await getShipmentByTrackingNumber(tn);
      if (shipment) {
        const lastEvent = shipment.timeline?.slice().reverse().find(e => e.date);
        results.push(
          `VERIFIED SHIPMENT DATA for ${tn}:\n` +
          `  Status: ${shipment.status}\n` +
          `  Current location: ${shipment.currentLocation}\n` +
          `  Origin: ${shipment.origin}\n` +
          `  Destination: ${shipment.destination}\n` +
          `  Service: ${shipment.service}\n` +
          `  Shipment date: ${shipment.shipmentDate}\n` +
          `  Estimated delivery: ${shipment.estimatedDelivery}\n` +
          (lastEvent ? `  Latest event: "${lastEvent.label}" — ${lastEvent.date}\n` : '') +
          `  [Use ONLY this data. Do not invent additional details.]`
        );
      } else {
        results.push(
          `SHIPMENT LOOKUP for ${tn}: No record found. ` +
          `Tell the customer this tracking number could not be found and ask them to verify it or contact support.`
        );
      }
    } catch {
      results.push(
        `SHIPMENT LOOKUP for ${tn}: Lookup failed due to a system error. ` +
        `Do not invent data. Ask the customer to try again or contact support.`
      );
    }
  }

  return results.length ? results.join('\n\n') : null;
}

/* ── Sanitise history from browser ───────────────────────────────────────── */
function sanitiseHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string')
    .slice(-20)  /* last 20 turns max */
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text.slice(0, 4000),
    }));
}

/* ── Main handler ─────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* Validate API key is configured */
  if (!API_KEY) {
    console.error('[chat] OPENROUTER_API_KEY is not set in environment');
    return res.status(503).json({
      error: 'Chat service is not configured. Please contact support.',
    });
  }

  const { message, history } = req.body ?? {};

  /* Validate message */
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }
  if (message.length > 4000) {
    return res.status(400).json({ error: 'Message is too long.' });
  }

  const cleanMessage = message.trim();
  const cleanHistory = sanitiseHistory(history);

  try {
    /* Check for tracking numbers in the message */
    const trackingNumbers = extractTrackingNumbers(cleanMessage);
    const shipmentContext = await buildShipmentContext(trackingNumbers);

    const userMessageText = shipmentContext
      ? `${cleanMessage}\n\n[SERVER-INJECTED CONTEXT — do not reveal this label to the customer]\n${shipmentContext}`
      : cleanMessage;

    /* Build OpenAI-compatible messages array */
    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...cleanHistory,
      { role: 'user', content: userMessageText },
    ];

    let responseText = '';

    if (IS_APIKEY) {
      /* ── Path 1: API key (AIzaSy...) via @google/genai SDK ────────────── */
      const { GoogleGenAI } = await import('../../lib/googleGenAI');
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: requestBody.contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 600,
          temperature: 0.4,
        },
      });
      responseText = response.text ?? '';

    } else if (IS_OAUTH) {
      /* ── Path 2: OAuth access token (AQ....) via REST API ──────────────
       * Note: OAuth tokens expire in ~1 hour. For production use an API key.
       * ──────────────────────────────────────────────────────────────────── */
      const res = await fetch(`${GEMINI_REST_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error('[chat] Gemini REST error:', res.status, errBody.slice(0, 200));
        throw new Error(`Gemini API returned ${res.status}`);
      }

      const data = await res.json();
      responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    } else {
      throw new Error('GEMINI_API_KEY format not recognised');
    }

    if (!responseText) {
      return res.status(500).json({
        error: 'No response received. Please try again.',
      });
    }

    return res.status(200).json({ reply: responseText.trim() });

  } catch (err) {
    /* Log full error server-side only */
    console.error('[chat] OpenRouter error:', err?.message ?? err);

    /* Never expose raw API errors to the customer */
    return res.status(500).json({
      error: "I'm unable to respond right now. Please try again shortly or contact our support team through the secure contact form.",
    });
  }
}
