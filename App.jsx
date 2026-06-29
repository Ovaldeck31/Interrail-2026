import { useState, useEffect, useRef, useCallback } from "react";
// Firebase via dynamic import (CDN-compatible, no npm needed)
let db = null;
let firebaseReady = false;
const firebaseCallbacks = [];

async function initFirebase() {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { getFirestore, doc, setDoc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    
    const firebaseConfig = {
      apiKey: "AIzaSyCf_bHj-lIvmyXPtqfYH9jeIKebHfoNddM",
      authDomain: "interrail2026-ca598.firebaseapp.com",
      projectId: "interrail2026-ca598",
      storageBucket: "interrail2026-ca598.firebasestorage.app",
      messagingSenderId: "815410971749",
      appId: "1:815410971749:web:9450ac0b629d729e65b28c"
    };

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseReady = true;
    window.__fbDoc = doc;
    window.__fbSetDoc = setDoc;
    window.__fbOnSnapshot = onSnapshot;
    firebaseCallbacks.forEach(cb => cb());
  } catch(e) {
    console.warn("Firebase init failed:", e);
  }
}

initFirebase();

async function saveToCloud(key, value) {
  if (!firebaseReady) return;
  try {
    await window.__fbSetDoc(window.__fbDoc(db, "interrail2026", key), { data: JSON.stringify(value) });
  } catch (e) { console.warn("Cloud save failed:", e); }
}

function useCloudStorage(key, init) {
  const [val, setValRaw] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let unsub = null;
    const setupListener = () => {
      if (!firebaseReady) return;
      unsub = window.__fbOnSnapshot(window.__fbDoc(db, "interrail2026", key), (snap) => {
        if (snap.exists()) {
          try {
            const parsed = JSON.parse(snap.data().data);
            setValRaw(parsed);
            localStorage.setItem(key, JSON.stringify(parsed));
          } catch {}
        }
        setSynced(true);
      }, () => setSynced(true));
    };

    if (firebaseReady) {
      setupListener();
    } else {
      firebaseCallbacks.push(setupListener);
    }
    return () => { if (unsub) unsub(); };
  }, [key]);

  const setVal = useCallback((updater) => {
    setValRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(key, JSON.stringify(next));
      saveToCloud(key, next);
      return next;
    });
  }, [key]);

  return [val, setVal, synced];
}

// ─── DATA (2026) ────────────────────────────────────────────────────────────────────

const STOPS = [
  { id: 0,  date: "2026-07-06", from: "",           to: "Berlin",       country: "DE", lat: 52.52,   lng: 13.405,  train: "Startpunkt", ticket: "", hostel: { name: "Zuhause", room: "", address: "Berlin", checkin: "", checkout: "" }, math: { name: "FU Berlin – Institut für Mathematik / HU Berlin – Institut für Mathematik / TU Berlin – Institut für Mathematik", address: "FU: Arnimallee 6, 14195 Berlin · HU: Unter den Linden 6, 10099 Berlin · TU: Straße des 17. Juni 136, 10623 Berlin" }, sights: [] },
  { id: 1,  date: "2026-07-06", from: "Berlin",      to: "Bonn",         country: "DE", lat: 50.7374, lng: 7.0982,  train: "ICE 1548 · Berlin Gesundbrunnen (Gl. 5) → Köln Hbf (Gl. 8) · 07:12–12:16\nBus RE5 · Köln Hbf (Breslauer Platz) → Bonn Hbf (Colmantstraße) · 12:36–13:21", ticket: "Selbstzahler / Deutschlandticket", hostel: { name: "Max Hostel", room: "4-Bett-Zimmer", address: "Maxstraße 7, 53111 Bonn", checkin: "ca. 18:00", checkout: "ca. 06:20" }, math: { name: "Mathematikzentrum Universität Bonn (inkl. Hausdorff-Zentrum)", address: "Endenicher Allee 60, 53115 Bonn" }, sights: [] },
  { id: 2,  date: "2026-07-08", from: "Bonn",        to: "Heidelberg",   country: "DE", lat: 49.3988, lng: 8.6724,  train: "Bus RE5 · Bonn Hbf (Colmantstraße) → Remagen · 06:51–07:35\nRB26 · Remagen (Gl. 4) → Mainz Hbf (Gl. 11) · 07:54–09:55\nRE4 · Mainz Hbf (Gl. 5a/b) → Ludwigshafen(Rh)Hbf (Gl. 9) · 10:13–10:56\nS1 · Ludwigshafen(Rh)Hbf (Gl. 3) → Heidelberg Hbf (Gl. 7) · 11:30–11:54", ticket: "Deutschlandticket", hostel: { name: "Lotte – The Backpackers", room: "5-Bett-Schlafsaal", address: "Burgweg 3, 69117 Heidelberg-Altstadt", checkin: "ca. 18:00", checkout: "ca. 08:00" }, math: { name: "Mathematikon – Fakultät für Mathematik und Informatik, Uni Heidelberg", address: "Im Neuenheimer Feld 205, 69120 Heidelberg" }, sights: [] },
  { id: 3,  date: "2026-07-09", from: "Heidelberg",  to: "Karlsruhe",    country: "DE", lat: 49.0069, lng: 8.4037,  train: "S3 · Heidelberg Hbf (Gl. 8) → Karlsruhe Hbf (Gl. 5) · 15:18–16:00", ticket: "Deutschlandticket", hostel: { name: "Space Hostel Karlsruhe", room: "Kapsel", address: "Kaiserstraße 170, 76133 Karlsruhe", checkin: "ca. 18:00", checkout: "ca. 07:30" }, math: { name: "KIT – Fakultät für Mathematik, Kollegiengebäude Mathematik", address: "Englerstraße 2, 76131 Karlsruhe" }, sights: [] },
  { id: 4,  date: "2026-07-11", from: "Karlsruhe",   to: "München",      country: "DE", lat: 48.1351, lng: 11.582,  train: "RE1 · Karlsruhe Hbf (Gl. 12) → Stuttgart Hbf (Gl. 4) · 08:32–09:27\nRE5 · Stuttgart Hbf (Gl. 14) → Ulm Hbf (Gl. 2) · 09:37–10:43\nRE9 · Ulm Hbf (Gl. 25) → München Hbf (Gl. 16) · 11:19–13:20", ticket: "Deutschlandticket", hostel: { name: "", room: "", address: "", checkin: "", checkout: "" }, math: { name: "Department of Mathematics, Technische Universität München (TUM)", address: "Boltzmannstraße 3, 85748 Garching bei München" }, sights: [] },
  { id: 5,  date: "2026-07-14", from: "München",     to: "Salzburg",     country: "AT", lat: 47.8095, lng: 13.055,  train: "RE5 · München Hbf (Gl. 9) → Salzburg Hbf · 09:47–11:46", ticket: "Deutschlandticket", hostel: { name: "a&o Salzburg Hauptbahnhof", room: "4-Bett-Schlafsaal", address: "Fanny-von-Lehnert-Straße 4, 5020 Salzburg", checkin: "ca. 18:00", checkout: "ca. 08:00" }, math: { name: "", address: "" }, sights: [] },
  { id: 6,  date: "2026-07-15", from: "Salzburg",    to: "Rom",          country: "IT", lat: 41.9028, lng: 12.4964, train: "Nightjet 295 · Salzburg Hbf (Gl. 8) → Roma Tiburtina · 22:02–10:05 (+1)", ticket: "Interrail-Tag-1", hostel: { name: "JO&JOE Roma", room: "4-Bett-Schlafsaal", address: "Via delle Quattro Fontane, 113, 00184 Roma RM, Italien", checkin: "ca. 19:00", checkout: "ca. 07:00" }, math: { name: "", address: "" }, sights: [] },
  { id: 7,  date: "2026-07-19", from: "Rom",         to: "Florenz",      country: "IT", lat: 43.7696, lng: 11.2558, train: "FR 9406 · Roma Tiburtina → Firenze S. M. Novella · 07:45–09:11", ticket: "Selbstzahler", hostel: { name: "Emerald Palace", room: "5-Bett-Schlafsaal", address: "Via dell'Ariento, 2, 50123 Firenze FI, Italien", checkin: "ca. 15:00", checkout: "ca. 07:00" }, math: { name: "", address: "" }, sights: [] },
  { id: 8,  date: "2026-07-21", from: "Florenz",     to: "Nizza",        country: "FR", lat: 43.7102, lng: 7.262,   train: "FA 8588 · Firenze Campo Di Marte → Genova Brignole · 07:54–10:55\nIC 641 · Genova P.Za Principe → Ventimiglia · 16:58–18:59\nTER86072 · Ventimiglia → Nice Ville · 19:12–20:09", ticket: "Interrail-Tag-2", hostel: { name: "", room: "", address: "", checkin: "", checkout: "" }, math: { name: "", address: "" }, sights: [] },
  { id: 9,  date: "2026-07-24", from: "Nizza",       to: "Montpellier",  country: "FR", lat: 43.6108, lng: 3.8767,  train: "", ticket: "Interrail-Tag-3", hostel: { name: "", room: "", address: "", checkin: "", checkout: "" }, math: { name: "", address: "" }, sights: [] },
  { id: 10, date: "2026-07-26", from: "Montpellier", to: "Barcelona",    country: "ES", lat: 41.3851, lng: 2.1734,  train: "", ticket: "Interrail-Tag-4", hostel: { name: "", room: "", address: "", checkin: "", checkout: "" }, math: { name: "", address: "" }, sights: [] },
  { id: 11, date: "2026-07-31", from: "Barcelona",   to: "Paris",        country: "FR", lat: 48.8566, lng: 2.3522,  train: "", ticket: "Interrail-Tag-5", hostel: { name: "", room: "", address: "", checkin: "", checkout: "" }, math: { name: "", address: "" }, sights: [] },
  { id: 12, date: "2026-08-03", from: "Paris",       to: "Antwerpen",    country: "BE", lat: 51.2194, lng: 4.4025,  train: "", ticket: "Interrail-Tag-6", hostel: { name: "", room: "", address: "", checkin: "", checkout: "" }, math: { name: "", address: "" }, sights: [] },
  { id: 13, date: "2026-08-05", from: "Antwerpen",   to: "Den Haag",     country: "NL", lat: 52.0705, lng: 4.3007,  train: "", ticket: "Selbstzahler", hostel: { name: "", room: "", address: "", checkin: "", checkout: "" }, math: { name: "", address: "" }, sights: [] },
  { id: 14, date: "2026-08-07", from: "Den Haag",    to: "Berlin",       country: "DE", lat: 52.52,   lng: 13.405,  train: "Heimreise", ticket: "Interrail-Tag-7", hostel: { name: "–", room: "Heimreise", address: "", checkin: "", checkout: "" }, math: { name: "", address: "" }, sights: [] },
];

const DE_MATH_CITIES = ["Berlin", "Bonn", "Heidelberg", "Karlsruhe", "München"];

const MATH_CRITERIA = [
  { key: "historisch",  label: "Historische Bedeutung",          type: "obj",
    hint: "Welche Mathematiker haben hier gewirkt? Gibt es historische Sammlungen oder Gedenktafeln?",
    prompts: ["Namen bekannter Lehrstuhlinhaber", "Gründungsjahr / Epoche", "Bedeutung für die Mathematikgeschichte"] },
  { key: "lehre",       label: "Lehre & Studienstruktur",        type: "obj",
    hint: "Wie ist der Bachelor aufgebaut? Pflichtveranstaltungen, Kohortengröße, Lehrqualität?",
    prompts: ["Modulstruktur im 1. Jahr", "Vorlesungsgrößen", "Ruf der Lehre unter Studierenden"] },
  { key: "fachschaft",  label: "Fachschaft & Studentenleben",    type: "obj",
    hint: "Wie aktiv ist die Fachschaft? Tutorien, Ersti-Betreuung, soziales Miteinander?",
    prompts: ["Erreichbarkeit der Fachschaft", "Tutorien-Angebot", "Gemeinschaftsgefühl im Institut"] },
  { key: "infrastruktur", label: "Bibliothek & Infrastruktur",   type: "obj",
    hint: "Lernräume, Bibliothek, CIP-Pools, Druckmöglichkeiten, Aufenthaltsräume?",
    prompts: ["Öffnungszeiten Bibliothek", "Anzahl Lernplätze", "Computerzugang"] },
  { key: "forschung",   label: "Forschungsschwerpunkte",         type: "obj",
    hint: "Welche Gebiete dominieren? Exzellenzcluster, Sonderforschungsbereiche?",
    prompts: ["Algebra / Analysis / Stochastik / Geometrie", "Exzellenzcluster", "Interdisziplinäre Projekte"] },
  { key: "stadt",       label: "Stadt & Lebensqualität",         type: "obj",
    hint: "Wie ist die Stadt als Studienort? Mietpreise, Verkehr, Kulturangebot, Größe?",
    prompts: ["Mietpreisniveau", "ÖPNV-Anbindung", "Kulturelles Angebot"] },
  { key: "atmosphaere", label: "Atmosphäre des Gebäudes",        type: "subj",
    hint: "Wie fühlt sich das Institut beim Betreten an? Einladend, historisch, kalt, inspirierend?",
    prompts: ["Erster Eindruck", "Architektur & Raumgefühl", "Stimmung im Haus"] },
  { key: "eindruck",    label: "Persönliche Wirkung",            type: "subj",
    hint: "Was hat beim Besuch überrascht oder beeindruckt? Was blieb hängen?",
    prompts: ["Stärkstes Erlebnis", "Was war anders als erwartet?", "Begegnungen mit Menschen"] },
  { key: "studieren",   label: "Könnte ich hier studieren?",     type: "subj",
    hint: "Was spricht konkret dafür oder dagegen?",
    prompts: ["Dafür spricht…", "Dagegen spricht…", "Gesamteindruck auf einer Skala"] },
];

const fmtDate = (d) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────

function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [val, key]);
  return [val, setVal];
}

// alias so App can switch to cloud
const useAppStorage = useCloudStorage;

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────

const T = {
  bg:      "#0c0e14",
  surface: "#13161f",
  card:    "#181c28",
  hover:   "#1e2235",
  border:  "#252840",
  accent:  "#4f72ff",
  accentD: "#2a3d99",
  gold:    "#c9933a",
  text:    "#dde1f5",
  muted:   "#6b7299",
  subtle:  "#3a3f5c",
  green:   "#3d9e6e",
  red:     "#b84f4f",
  sans:    "'Inter', system-ui, sans-serif",
};

const g = {
  app:     { minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans, fontSize: 14 },
  hdr:     { background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  tabs:    { display: "flex", background: T.surface, borderBottom: `1px solid ${T.border}`, overflowX: "auto", gap: 0 },
  tab:     (a) => ({ padding: "11px 20px", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap", color: a ? T.text : T.muted, borderBottom: `2px solid ${a ? T.accent : "transparent"}`, background: "none", border: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: a ? T.accent : "transparent", transition: "color 0.15s" }),
  wrap:    { padding: "24px", maxWidth: 1000, margin: "0 auto" },
  card:    { background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 16 },
  lbl:     { fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" },
  inp:     { width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: "8px 11px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: T.sans },
  ta:      { width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 11px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 90, fontFamily: T.sans, lineHeight: 1.6 },
  btn:     (bg = T.accent, sm) => ({ background: bg, color: "#fff", border: "none", borderRadius: 7, padding: sm ? "5px 11px" : "8px 15px", cursor: "pointer", fontSize: sm ? 11 : 13, fontWeight: 600, letterSpacing: "0.02em", fontFamily: T.sans }),
  badge:   (bg = T.accentD) => ({ background: bg, color: T.text, borderRadius: 5, padding: "3px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-block" }),
  row:     { display: "flex", gap: 12, flexWrap: "wrap" },
  col:     { flex: 1, minWidth: 160 },
  divider: { borderTop: `1px solid ${T.border}`, margin: "16px 0" },
  sTitle:  { fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 },
};

// ─── SIDEBAR NAV ─────────────────────────────────────────────────────────────

function CityNav({ stops, selected, onSelect, diaryData }) {
  return (
    <div style={{ width: 180, flexShrink: 0 }}>
      {stops.map(st => (
        <div key={st.id} onClick={() => onSelect(st.id)}
          style={{ padding: "9px 13px", borderRadius: 7, cursor: "pointer", marginBottom: 3,
            background: selected === st.id ? T.hover : "transparent",
            borderLeft: `3px solid ${selected === st.id ? T.accent : "transparent"}`,
            transition: "all 0.12s" }}>
          <div style={{ fontSize: 10, color: T.muted }}>{fmtDate(st.date)}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 1 }}>{st.to}</div>
          {diaryData?.[st.to] && <div style={{ fontSize: 9, color: T.green, marginTop: 2, fontWeight: 700, letterSpacing: "0.04em" }}>EINTRAG</div>}
        </div>
      ))}
    </div>
  );
}

// ─── LEAFLET MAP ─────────────────────────────────────────────────────────────

function LeafletMap({ stops, userPos, selectedCity, addresses }) {
  const ref = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !ref.current) return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => {
      const L = window.L;
      const map = L.map(ref.current).setView([47, 10], 4);
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Route line – Berlin (start) + all stops
      const berlinCoords = [52.52, 13.405];
      const allCoords = [berlinCoords, ...stops.map(s => [s.lat, s.lng])];
      L.polyline(allCoords, { color: "#4f72ff", weight: 2, opacity: 0.6, dashArray: "6 4" }).addTo(map);

      // Berlin start marker
      const berlinIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;background:#c9933a;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(201,147,58,0.9)"></div>`,
        className: "", iconSize: [12, 12], iconAnchor: [6, 6],
      });
      L.marker(berlinCoords, { icon: berlinIcon }).addTo(map)
        .bindPopup("<b style='color:#222'>Berlin</b><br><span style='color:#555;font-size:12px'>Startpunkt · 6. Juli 2026</span>");

      // Math institute markers for German cities
      const mathInsts = [
        { name: "Bonn", lat: 50.7302, lng: 7.0827, inst: "Mathematikzentrum, Endenicher Allee 60" },
        { name: "Heidelberg", lat: 49.4175, lng: 8.6694, inst: "Mathematikon, Im Neuenheimer Feld 205" },
        { name: "Karlsruhe", lat: 49.0119, lng: 8.4139, inst: "KIT Fakultät Mathematik, Englerstraße 2" },
        { name: "München", lat: 48.1508, lng: 11.5682, inst: "LMU Mathematisches Institut, Theresienstr. 39" },
      ];
      mathInsts.forEach(mc => {
        const mIcon = L.divIcon({
          html: `<div style="width:9px;height:9px;background:#c9933a;border:2px solid #fff;border-radius:2px;transform:rotate(45deg);box-shadow:0 0 5px rgba(201,147,58,0.7)"></div>`,
          className: "", iconSize: [9, 9], iconAnchor: [4, 4],
        });
        L.marker([mc.lat, mc.lng], { icon: mIcon }).addTo(map)
          .bindPopup(`<b style="color:#222">${mc.name} – Mathe-Institut</b><br><span style="color:#555;font-size:11px">${mc.inst}</span>`);
      });

      // Stop markers
      stops.forEach(st => {
        const icon = L.divIcon({
          html: `<div style="width:10px;height:10px;background:#4f72ff;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(79,114,255,0.8)"></div>`,
          className: "",
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([st.lat, st.lng], { icon })
          .addTo(map)
          .bindPopup(`<b style="color:#222">${st.to}</b><br><span style="color:#555;font-size:12px">${fmtDate(st.date)}</span>${st.hostel.name ? `<br><span style="font-size:11px">${st.hostel.name}</span>` : ""}`);
      });

      // User position
      if (userPos) {
        const uIcon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#3d9e6e;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(61,158,110,0.9)"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([userPos.lat, userPos.lng], { icon: uIcon }).addTo(map).bindPopup("<b>Mein Standort</b>");
      }
    };
    document.head.appendChild(script);
    return () => {};
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", height: 460, borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}` }} />
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────────

const TABS = ["Übersicht", "Tagesplan", "Etappen", "Mathematik", "Karte", "Sehenswürdigkeiten", "Tagebuch"];

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [stops, setStops, stopsSynced] = useAppStorage("ir_stops_v2", STOPS);
  const [mathData, setMathData] = useAppStorage("ir_math_v2", {});
  const [diary, setDiary] = useAppStorage("ir_diary_v2", {});
  const [photos, setPhotos] = useAppStorage("ir_photos_v2", {});
  const [sights, setSights] = useAppStorage("ir_sights_v2", {});
  const [selectedId, setSelectedId] = useState(1);
  const [userPos, setUserPos] = useState(null);
  const [isRec, setIsRec] = useState(false);
  const [recTarget, setRecTarget] = useState(null);
  const recRef = useRef(null);

  const updateStop = useCallback((id, field, sub, val) =>
    setStops(p => p.map(s => s.id === id ? sub ? { ...s, [field]: { ...s[field], [sub]: val } } : { ...s, [field]: val } : s)), [setStops]);

  const updateMath = useCallback((city, key, val) =>
    setMathData(p => ({ ...p, [city]: { ...p[city], [key]: val } })), [setMathData]);

  const getPos = () => navigator.geolocation?.getCurrentPosition(
    p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
    () => alert("Standort nicht verfügbar.")
  );

  const startRec = (target, setter) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Spracherkennung nicht unterstützt.");
    const r = new SR(); r.lang = "de-DE"; r.continuous = false; r.interimResults = false;
    r.onresult = e => setter(prev => (prev || "") + " " + e.results[0][0].transcript);
    r.onend = () => { setIsRec(false); setRecTarget(null); };
    r.start(); recRef.current = r; setIsRec(true); setRecTarget(target);
  };
  const stopRec = () => { recRef.current?.stop(); setIsRec(false); setRecTarget(null); };

  const addPhoto = (city, e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhotos(p => ({ ...p, [city]: [...(p[city] || []), ev.target.result] }));
    r.readAsDataURL(f);
  };

  const stop = stops.find(s => s.id === selectedId) || stops[0];

  // ── OVERVIEW TAB ────────────────────────────────────────────────────────────

  const Overview = () => (
    <div>
      {/* Hero */}
      <div style={{ ...g.card, background: `linear-gradient(135deg, #13161f 0%, #1a1e30 100%)`, borderColor: T.subtle, marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Interrail · Sommer 2026</div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {[["Abfahrt", "6. Juli 2026"], ["Rückkehr", "7. August 2026"], ["Etappen", "14"], ["Länder", "8"]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: "-0.5px" }}>{v}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={g.card}>
        <div style={g.sTitle}>Reiseroute</div>
        {stops.map((st, i) => {
          const cityPhotos = photos[st.to] || [];
          const hasPhoto = cityPhotos.length > 0;
          return (
          <div key={st.id} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ textAlign: "center", width: 36, flexShrink: 0, paddingTop: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, margin: "0 auto", boxShadow: `0 0 6px ${T.accent}55` }} />
                {i < stops.length - 1 && <div style={{ width: 1, height: hasPhoto ? 60 : 28, background: T.border, margin: "4px auto 0" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: T.muted, letterSpacing: "0.04em" }}>{fmtDate(st.date)}</div>
                <div style={{ fontWeight: 600, color: T.text, marginTop: 1 }}>{st.from} <span style={{ color: T.muted, fontWeight: 400 }}>—</span> {st.to}</div>
                {st.train && <div style={{ fontSize: 11, color: T.muted, marginTop: 2, lineHeight: 1.5 }}>{st.train}</div>}
                {st.hostel.name && st.hostel.name !== "–" && <div style={{ fontSize: 11, color: T.gold, marginTop: 2 }}>{st.hostel.name}</div>}
                {/* Photo strip */}
                {hasPhoto && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {cityPhotos.slice(0, 4).map((src, pi) => (
                      <img key={pi} src={src} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: `1px solid ${T.border}` }} />
                    ))}
                    {cityPhotos.length > 4 && <div style={{ width: 60, height: 60, borderRadius: 6, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: T.muted }}>+{cityPhotos.length - 4}</div>}
                  </div>
                )}
                {/* OSM mini map link */}
                <div style={{ marginTop: 6 }}>
                  <a href={`https://www.openstreetmap.org/?mlat=${st.lat}&mlon=${st.lng}#map=13/${st.lat}/${st.lng}`}
                    target="_blank" rel="noreferrer"
                    style={{ fontSize: 10, color: T.accent, textDecoration: "none", letterSpacing: "0.04em" }}>
                    Auf Karte anzeigen →
                  </a>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                <button onClick={() => { setSelectedId(st.id); setActiveTab(2); }}
                  style={{ ...g.btn(T.accentD, true) }}>Bearbeiten</button>
                <button onClick={() => { setSelectedId(st.id); setActiveTab(4); }}
                  style={{ ...g.btn(T.subtle, true) }}>Karte</button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );

  // ── ETAPPEN TAB ─────────────────────────────────────────────────────────────

  const Etappen = () => (
    <div style={{ display: "flex", gap: 16 }}>
      <CityNav stops={stops} selected={selectedId} onSelect={setSelectedId} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={g.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: "-0.3px" }}>{stop.from} — {stop.to}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{fmtDate(stop.date)}</div>
            </div>
            {stop.ticket && <span style={g.badge(stop.ticket === "Gebucht" ? T.accentD : "#2a3d2a")}>{stop.ticket}</span>}
          </div>

          <div style={g.divider} />
          <div style={g.sTitle}>Zugverbindung</div>
          <textarea style={{ ...g.ta, minHeight: 60 }} value={stop.train}
            onChange={e => updateStop(stop.id, "train", null, e.target.value)} />

          <div style={{ ...g.divider }} />
          <div style={g.sTitle}>Unterkunft</div>
          <div style={g.row}>
            <div style={g.col}><label style={g.lbl}>Name</label><input style={g.inp} value={stop.hostel.name} onChange={e => updateStop(stop.id, "hostel", "name", e.target.value)} /></div>
            <div style={g.col}><label style={g.lbl}>Zimmertyp</label><input style={g.inp} value={stop.hostel.room} onChange={e => updateStop(stop.id, "hostel", "room", e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 10 }}><label style={g.lbl}>Adresse</label><input style={g.inp} value={stop.hostel.address} onChange={e => updateStop(stop.id, "hostel", "address", e.target.value)} /></div>
          <div style={{ ...g.row, marginTop: 10 }}>
            <div style={g.col}><label style={g.lbl}>Check-in</label><input style={g.inp} value={stop.hostel.checkin} onChange={e => updateStop(stop.id, "hostel", "checkin", e.target.value)} /></div>
            <div style={g.col}><label style={g.lbl}>Check-out</label><input style={g.inp} value={stop.hostel.checkout} onChange={e => updateStop(stop.id, "hostel", "checkout", e.target.value)} /></div>
          </div>

          <div style={g.divider} />
          <div style={g.sTitle}>Mathematisches Institut / Gebäude</div>
          <div style={g.row}>
            <div style={g.col}><label style={g.lbl}>Name</label><input style={g.inp} value={stop.math.name} onChange={e => updateStop(stop.id, "math", "name", e.target.value)} /></div>
            <div style={g.col}><label style={g.lbl}>Adresse</label><input style={g.inp} value={stop.math.address} onChange={e => updateStop(stop.id, "math", "address", e.target.value)} /></div>
          </div>

          <div style={g.divider} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={g.sTitle}>Fotos</div>
            <label style={{ ...g.btn(T.accent, true), cursor: "pointer", display: "inline-block" }}>
              + Foto hinzufügen
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => addPhoto(stop.to, e)} />
            </label>
          </div>
          {(photos[stop.to] || []).length === 0 && (
            <div style={{ color: T.muted, fontSize: 12, padding: "20px 0", textAlign: "center", border: `1px dashed ${T.border}`, borderRadius: 8 }}>
              Noch keine Fotos — füge welche hinzu
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
            {(photos[stop.to] || []).map((src, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <button onClick={() => setPhotos(p => ({ ...p, [stop.to]: p[stop.to].filter((_, j) => j !== i) }))}
                  style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── MATH TAB ────────────────────────────────────────────────────────────────

  const MathTab = () => {
    const [view, setView] = useState("detail");
    const [city, setCity] = useState("Bonn");
    const md = mathData[city] || {};
    const deStops = stops.filter(s => DE_MATH_CITIES.includes(s.to));
    const instInfo = stops.find(s => s.to === city);

    const Dots = ({ val, onChange }) => (
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[1,2,3,4,5].map(n => (
          <div key={n} onClick={() => onChange(n === val ? 0 : n)} style={{
            width: 18, height: 18, borderRadius: "50%", cursor: "pointer",
            background: n <= (val || 0) ? T.accent : T.surface,
            border: `2px solid ${n <= (val || 0) ? T.accent : T.border}`,
            transition: "all 0.12s",
          }} />
        ))}
        {val > 0 && <span style={{ fontSize: 10, color: T.muted, marginLeft: 4 }}>{val}/5</span>}
      </div>
    );

    const CriterionCard = ({ c }) => {
      const isSubj = c.type === "subj";
      return (
        <div style={{ ...g.card, borderLeft: `3px solid ${isSubj ? T.gold : T.accent}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: isSubj ? T.gold : T.accent,
                  background: isSubj ? "#2a200a" : "#0e1a3a",
                  padding: "2px 6px", borderRadius: 4 }}>
                  {isSubj ? "Subjektiv" : "Objektiv"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{c.hint}</div>
            </div>
            <Dots val={md[c.key + "_r"] || 0} onChange={v => updateMath(city, c.key + "_r", v)} />
          </div>
          {/* Prompt chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {c.prompts.map((p, i) => (
              <span key={i} style={{ fontSize: 10, color: T.muted, background: T.surface,
                border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 7px", cursor: "default" }}>
                {p}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <textarea
              style={{ ...g.ta, minHeight: 72, flex: 1, fontSize: 13 }}
              placeholder="Eigene Notizen…"
              value={md[c.key] || ""}
              onChange={e => updateMath(city, c.key, e.target.value)}
            />
            <button
              style={{ ...g.btn(isRec && recTarget === city + c.key ? T.red : T.subtle, true), flexShrink: 0, marginTop: 2 }}
              onClick={() => isRec ? stopRec() : startRec(city + c.key, v => updateMath(city, c.key, v))}
            >{isRec && recTarget === city + c.key ? "Stop" : "Diktat"}</button>
          </div>
        </div>
      );
    };

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <button style={g.btn(view === "detail" ? T.accent : T.subtle, true)} onClick={() => setView("detail")}>Einzelansicht</button>
          <button style={g.btn(view === "compare" ? T.accent : T.subtle, true)} onClick={() => setView("compare")}>Vergleichstabelle</button>
        </div>

        {view === "detail" && (
          <div style={{ display: "flex", gap: 16 }}>
            {/* City selector – only DE cities */}
            <div style={{ width: 160, flexShrink: 0 }}>
              {deStops.map(st => (
                <div key={st.id} onClick={() => setCity(st.to)}
                  style={{ padding: "9px 13px", borderRadius: 7, cursor: "pointer", marginBottom: 3,
                    background: city === st.to ? T.hover : "transparent",
                    borderLeft: `3px solid ${city === st.to ? T.accent : "transparent"}`,
                    transition: "all 0.12s" }}>
                  <div style={{ fontSize: 10, color: T.muted }}>{fmtDate(st.date)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 1 }}>{st.to}</div>
                  {mathData[st.to] && Object.keys(mathData[st.to]).length > 0 &&
                    <div style={{ fontSize: 9, color: T.accent, marginTop: 2, fontWeight: 700, letterSpacing: "0.04em" }}>BEWERTET</div>}
                </div>
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <div style={{ ...g.card, background: "linear-gradient(135deg, #13161f 0%, #1a1e30 100%)", marginBottom: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{city}</div>
                {instInfo?.math?.name && <div style={{ fontSize: 12, color: T.gold, marginTop: 3 }}>{instInfo.math.name}</div>}
                {instInfo?.math?.address && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{instInfo.math.address}</div>}
              </div>

              {/* Objective criteria */}
              <div style={{ fontSize: 10, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Objektive Kriterien</div>
              {MATH_CRITERIA.filter(c => c.type === "obj").map(c => <CriterionCard key={c.key} c={c} />)}

              <div style={{ ...g.divider, marginTop: 20 }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, marginTop: 16 }}>Subjektiver Eindruck</div>
              {MATH_CRITERIA.filter(c => c.type === "subj").map(c => <CriterionCard key={c.key} c={c} />)}
            </div>
          </div>
        )}

        {view === "compare" && (
          <div>
            {/* Score overview cards */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              {DE_MATH_CITIES.map(c => {
                const d = mathData[c] || {};
                const scores = MATH_CRITERIA.map(cr => d[cr.key + "_r"] || 0).filter(Boolean);
                const avg = scores.length ? (scores.reduce((a,b) => a+b,0)/scores.length).toFixed(1) : null;
                const filled = MATH_CRITERIA.filter(cr => d[cr.key]).length;
                const pct = avg ? (parseFloat(avg) / 5) * 100 : 0;
                return (
                  <div key={c} onClick={() => { setCity(c); setView("detail"); }}
                    style={{ ...g.card, flex: 1, minWidth: 140, cursor: "pointer", borderColor: city === c ? T.accent : T.border }}>
                    <div style={{ fontWeight: 700, color: T.text, marginBottom: 6 }}>{c}</div>
                    {avg ? (
                      <>
                        <div style={{ fontSize: 26, fontWeight: 700, color: T.accent, letterSpacing: "-1px" }}>{avg}<span style={{ fontSize: 11, color: T.muted, fontWeight: 400 }}>/5</span></div>
                        <div style={{ marginTop: 8, height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: T.accent, borderRadius: 2, transition: "width 0.4s" }} />
                        </div>
                      </>
                    ) : <div style={{ fontSize: 12, color: T.border }}>Noch keine Bewertung</div>}
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 6 }}>{filled}/{MATH_CRITERIA.length} Felder</div>
                  </div>
                );
              })}
            </div>

            {/* Bar chart: per-criterion comparison */}
            <div style={{ ...g.card, marginBottom: 16 }}>
              <div style={g.sTitle}>Kriterien-Diagramm</div>
              <div style={{ overflowX: "auto" }}>
                {MATH_CRITERIA.filter(c => c.type === "obj").map(c => {
                  const vals = DE_MATH_CITIES.map(city => ({ city, val: mathData[city]?.[c.key + "_r"] || 0 }));
                  const hasAny = vals.some(v => v.val > 0);
                  if (!hasAny) return null;
                  return (
                    <div key={c.key} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: T.muted, marginBottom: 5 }}>{c.label}</div>
                      {vals.map(({ city, val }) => (
                        <div key={city} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 80, fontSize: 11, color: T.text, flexShrink: 0 }}>{city}</div>
                          <div style={{ flex: 1, height: 8, background: T.surface, borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${(val/5)*100}%`, height: "100%", background: T.accent, borderRadius: 4, transition: "width 0.4s" }} />
                          </div>
                          <div style={{ width: 24, fontSize: 11, color: val > 0 ? T.text : T.border, textAlign: "right" }}>{val > 0 ? val : "–"}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {MATH_CRITERIA.filter(c => c.type === "subj").map(c => {
                  const vals = DE_MATH_CITIES.map(city => ({ city, val: mathData[city]?.[c.key + "_r"] || 0 }));
                  const hasAny = vals.some(v => v.val > 0);
                  if (!hasAny) return null;
                  return (
                    <div key={c.key} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: T.gold, marginBottom: 5 }}>{c.label}</div>
                      {vals.map(({ city, val }) => (
                        <div key={city} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 80, fontSize: 11, color: T.text, flexShrink: 0 }}>{city}</div>
                          <div style={{ flex: 1, height: 8, background: T.surface, borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${(val/5)*100}%`, height: "100%", background: T.gold, borderRadius: 4, transition: "width 0.4s" }} />
                          </div>
                          <div style={{ width: 24, fontSize: 11, color: val > 0 ? T.text : T.border, textAlign: "right" }}>{val > 0 ? val : "–"}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {!MATH_CRITERIA.some(c => DE_MATH_CITIES.some(city => mathData[city]?.[c.key + "_r"] > 0)) && (
                  <div style={{ color: T.muted, fontSize: 12, textAlign: "center", padding: 20 }}>Noch keine Bewertungen eingetragen.</div>
                )}
              </div>
            </div>

            {/* Detailed comparison table */}
            <div style={{ ...g.card, overflowX: "auto" }}>
              <div style={g.sTitle}>Kriterienvergleich</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: T.muted, borderBottom: `1px solid ${T.border}`, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", background: T.surface, width: 160 }}>Kriterium</th>
                    {DE_MATH_CITIES.map(c => (
                      <th key={c} style={{ padding: "8px 10px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 600, fontSize: 12, background: T.surface, whiteSpace: "nowrap", minWidth: 140 }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Section: Objektiv */}
                  <tr><td colSpan={5} style={{ padding: "10px 12px 4px", fontSize: 9, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.1em", background: T.bg }}>Objektiv</td></tr>
                  {MATH_CRITERIA.filter(c => c.type === "obj").map((c, i) => (
                    <tr key={c.key} style={{ background: i % 2 === 0 ? T.card : T.surface }}>
                      <td style={{ padding: "9px 12px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: 11 }}>{c.label}</td>
                      {DE_MATH_CITIES.map(city => {
                        const d = mathData[city] || {};
                        const r = d[c.key + "_r"] || 0;
                        const note = d[c.key] || "";
                        return (
                          <td key={city} style={{ padding: "9px 10px", borderBottom: `1px solid ${T.border}`, verticalAlign: "top" }}>
                            {r > 0 && <div style={{ display: "flex", gap: 2, marginBottom: note ? 4 : 0 }}>
                              {[1,2,3,4,5].map(n => <div key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: n <= r ? T.accent : T.border }} />)}
                            </div>}
                            {note && <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.4 }}>{note.slice(0,100)}{note.length > 100 ? "…" : ""}</div>}
                            {!r && !note && <span style={{ color: T.border }}>—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Section: Subjektiv */}
                  <tr><td colSpan={5} style={{ padding: "10px 12px 4px", fontSize: 9, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "0.1em", background: T.bg }}>Subjektiv</td></tr>
                  {MATH_CRITERIA.filter(c => c.type === "subj").map((c, i) => (
                    <tr key={c.key} style={{ background: i % 2 === 0 ? T.card : T.surface }}>
                      <td style={{ padding: "9px 12px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: 11 }}>{c.label}</td>
                      {DE_MATH_CITIES.map(city => {
                        const d = mathData[city] || {};
                        const r = d[c.key + "_r"] || 0;
                        const note = d[c.key] || "";
                        return (
                          <td key={city} style={{ padding: "9px 10px", borderBottom: `1px solid ${T.border}`, verticalAlign: "top" }}>
                            {r > 0 && <div style={{ display: "flex", gap: 2, marginBottom: note ? 4 : 0 }}>
                              {[1,2,3,4,5].map(n => <div key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: n <= r ? T.gold : T.border }} />)}
                            </div>}
                            {note && <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.4 }}>{note.slice(0,100)}{note.length > 100 ? "…" : ""}</div>}
                            {!r && !note && <span style={{ color: T.border }}>—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── MAP TAB ─────────────────────────────────────────────────────────────────

  const MapTab = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", overflowX: "auto" }}>
          {stops.map(st => (
            <button key={st.id} onClick={() => setSelectedId(st.id)}
              style={{ ...g.btn(selectedId === st.id ? T.accent : T.subtle, true), whiteSpace: "nowrap" }}>
              {st.to}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button style={g.btn(T.subtle, true)} onClick={getPos}>Standort</button>
          {userPos && <span style={g.badge(T.green)}>Aktiv</span>}
        </div>
      </div>
      {/* Selected stop info panel */}
      <div style={{ ...g.card, marginBottom: 14, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{fmtDate(stop.date)}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{stop.from} — {stop.to}</div>
          {stop.train && <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.6 }}>{stop.train}</div>}
        </div>
        {stop.hostel.name && stop.hostel.name !== "–" && (
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Unterkunft</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.gold }}>{stop.hostel.name}</div>
            {stop.hostel.address && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{stop.hostel.address}</div>}
            {stop.hostel.checkin && <div style={{ fontSize: 11, color: T.muted }}>Check-in: {stop.hostel.checkin}</div>}
          </div>
        )}
        {stop.math?.name && (
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Mathe-Institut</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.accent }}>{stop.math.name}</div>
            {stop.math.address && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{stop.math.address}</div>}
          </div>
        )}
      </div>
      <LeafletMap stops={stops} userPos={userPos} selectedCity={stop?.to} />

      {/* OSM embed preview for selected city */}
      <div style={{ ...g.card, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={g.sTitle}>{stop.to} – Detailkarte</div>
          <a href={`https://www.openstreetmap.org/?mlat=${stop.lat}&mlon=${stop.lng}#map=14/${stop.lat}/${stop.lng}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: T.accent, textDecoration: "none" }}>In neuem Tab öffnen →</a>
        </div>
        <iframe
          key={stop.id}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${stop.lng-0.04},${stop.lat-0.025},${stop.lng+0.04},${stop.lat+0.025}&layer=mapnik&marker=${stop.lat},${stop.lng}`}
          style={{ width: "100%", height: 300, border: "none", borderRadius: 8 }}
          title={`Karte ${stop.to}`}
        />
        {/* Addresses */}
        {(stop.hostel.address || stop.math?.address) && (
          <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {stop.hostel.address && (
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Unterkunft</div>
                <div style={{ fontSize: 12, color: T.gold }}>{stop.hostel.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{stop.hostel.address}</div>
                <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(stop.hostel.address)}`}
                  target="_blank" rel="noreferrer"
                  style={{ fontSize: 10, color: T.accent, textDecoration: "none" }}>Auf Karte suchen →</a>
              </div>
            )}
            {stop.math?.address && (
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Mathe-Institut</div>
                <div style={{ fontSize: 12, color: T.accent }}>{stop.math.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{stop.math.address}</div>
                <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(stop.math.address)}`}
                  target="_blank" rel="noreferrer"
                  style={{ fontSize: 10, color: T.accent, textDecoration: "none" }}>Auf Karte suchen →</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── SIGHTS TAB ──────────────────────────────────────────────────────────────

  const SightsTab = () => {
    const city = stop.to;
    const citySights = sights[city] || [];

    const addSight = () => setSights(p => ({ ...p, [city]: [...(p[city] || []), { name: "", type: "Allgemein", address: "", notes: "", visited: false }] }));
    const updateSight = (i, field, val) => setSights(p => ({ ...p, [city]: p[city].map((s, j) => j === i ? { ...s, [field]: val } : s) }));
    const removeSight = (i) => setSights(p => ({ ...p, [city]: p[city].filter((_, j) => j !== i) }));

    const TYPES = ["Allgemein", "Mathematik", "Museum", "Architektur", "Natur", "Kulinarik"];

    return (
      <div style={{ display: "flex", gap: 16 }}>
        <CityNav stops={stops} selected={selectedId} onSelect={setSelectedId} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{city}</div>
            <button style={g.btn(T.accent, true)} onClick={addSight}>+ Sehenswürdigkeit</button>
          </div>

          {citySights.length === 0 && (
            <div style={{ ...g.card, textAlign: "center", padding: 40, color: T.muted }}>
              Noch keine Sehenswürdigkeiten eingetragen.
            </div>
          )}

          {citySights.map((sight, i) => (
            <div key={i} style={{ ...g.card, borderLeft: `3px solid ${sight.type === "Mathematik" ? T.accent : sight.visited ? T.green : T.border}` }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 2, minWidth: 140 }}>
                  <label style={g.lbl}>Name</label>
                  <input style={g.inp} value={sight.name} placeholder="z. B. Mathematisches Institut"
                    onChange={e => updateSight(i, "name", e.target.value)} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={g.lbl}>Kategorie</label>
                  <select style={{ ...g.inp, cursor: "pointer" }} value={sight.type}
                    onChange={e => updateSight(i, "type", e.target.value)}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                  <button style={g.btn(sight.visited ? T.green : T.subtle, true)}
                    onClick={() => updateSight(i, "visited", !sight.visited)}>
                    {sight.visited ? "Besucht" : "Offen"}
                  </button>
                  <button style={g.btn(T.red, true)} onClick={() => removeSight(i)}>×</button>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={g.lbl}>Adresse / Standort</label>
                <input style={g.inp} value={sight.address} placeholder="Straße, PLZ, Stadt"
                  onChange={e => updateSight(i, "address", e.target.value)} />
              </div>
              <div>
                <label style={g.lbl}>Notizen</label>
                <textarea style={{ ...g.ta, minHeight: 60 }} value={sight.notes}
                  placeholder="Öffnungszeiten, Eintritt, Besonderheiten..."
                  onChange={e => updateSight(i, "notes", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── DIARY TAB ───────────────────────────────────────────────────────────────

  const DiaryTab = () => {
    const city = stop.to;
    return (
      <div style={{ display: "flex", gap: 16 }}>
        <CityNav stops={stops} selected={selectedId} onSelect={setSelectedId} diaryData={diary} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={g.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{city}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{fmtDate(stop.date)}</div>
              </div>
              <button
                style={g.btn(isRec && recTarget === "diary" + city ? T.red : T.subtle, true)}
                onClick={() => isRec ? stopRec() : startRec("diary" + city, v => setDiary(p => ({ ...p, [city]: (p[city] || "") + " " + v })))}>
                {isRec && recTarget === "diary" + city ? "Aufnahme stoppen" : "Diktieren"}
              </button>
            </div>
            <textarea
              style={{ ...g.ta, minHeight: 260 }}
              placeholder="Tagesbericht, Eindrücke, Erlebnisse, Gedanken..."
              value={diary[city] || ""}
              onChange={e => setDiary(p => ({ ...p, [city]: e.target.value }))}
            />
            <div style={g.divider} />
            <div style={g.sTitle}>Fotos</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {(photos[city] || []).map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 7, border: `1px solid ${T.border}` }} />
              ))}
              {!(photos[city]?.length) && <div style={{ color: T.muted, fontSize: 12 }}>Noch keine Fotos.</div>}
            </div>
            <label style={{ ...g.btn(T.subtle, true), cursor: "pointer", display: "inline-block" }}>
              Foto hinzufügen
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => addPhoto(city, e)} />
            </label>
            <div style={{ marginTop: 14, fontSize: 11, color: T.subtle }}>Wird automatisch gespeichert.</div>
          </div>
        </div>
      </div>
    );
  };


  // ── DAY PLAN TAB ─────────────────────────────────────────────────────────────

  const DayPlanTab = () => {
    const [dayPlans, setDayPlans] = useStorage("ir_dayplans_v1", {});
    const [selectedDate, setSelectedDate] = useState("2026-07-06");

    // Generate all dates from Jul 6 to Aug 7
    const allDates = [];
    const start = new Date("2026-07-06");
    const end = new Date("2026-08-07");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().slice(0, 10));
    }

    // Categorize each date
    const stopByDate = {};
    stops.forEach(st => { stopByDate[st.date] = st; });

    const getDateType = (date) => {
      if (stopByDate[date]) return "travel";
      const stop = [...stops].reverse().find(s => s.date <= date);
      if (stop && DE_MATH_CITIES.includes(stop.to) && date <= stop.date) return "math";
      return "city";
    };

    const getCityForDate = (date) => {
      if (stopByDate[date]) return stopByDate[date].to;
      const stop = [...stops].reverse().find(s => s.date <= date);
      return stop ? stop.to : "";
    };

    const city = getCityForDate(selectedDate);
    const citySights = sights[city] || [];
    const plan = dayPlans[selectedDate] || { slots: [], freeItems: [], notes: "" };

    const updatePlan = (newPlan) => setDayPlans(p => ({ ...p, [selectedDate]: newPlan }));

    const TIMESLOTS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];

    const addSlot = (time) => {
      const existing = plan.slots.find(s => s.time === time);
      if (existing) return;
      updatePlan({ ...plan, slots: [...plan.slots, { time, title: "", notes: "", sightId: null }].sort((a,b) => a.time.localeCompare(b.time)) });
    };

    const updateSlot = (time, field, val) => {
      updatePlan({ ...plan, slots: plan.slots.map(s => s.time === time ? { ...s, [field]: val } : s) });
    };

    const removeSlot = (time) => updatePlan({ ...plan, slots: plan.slots.filter(s => s.time !== time) });

    const addFreeItem = () => updatePlan({ ...plan, freeItems: [...(plan.freeItems || []), { title: "", done: false, sightId: null }] });
    const updateFreeItem = (i, field, val) => updatePlan({ ...plan, freeItems: plan.freeItems.map((it, j) => j === i ? { ...it, [field]: val } : it) });
    const removeFreeItem = (i) => updatePlan({ ...plan, freeItems: plan.freeItems.filter((_, j) => j !== i) });

    const typeColors = { travel: T.accent, math: T.gold, city: T.green };
    const typeLabels = { travel: "Reisetag", math: "Mathematik", city: "Stadtbesichtigung" };

    const fmtDateLong = (d) => {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(y, m - 1, day).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    };

    return (
      <div style={{ display: "flex", gap: 16 }}>
        {/* Calendar sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          {/* Month groups */}
          {["2025-07", "2025-08"].map(month => {
            const label = month === "2025-07" ? "Juli" : "August";
            const monthDates = allDates.filter(d => d.startsWith(month));
            return (
              <div key={month} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>{label}</div>
                {monthDates.map(date => {
                  const type = getDateType(date);
                  const dayCity = getCityForDate(date);
                  const isSelected = date === selectedDate;
                  const hasContent = dayPlans[date] && (dayPlans[date].slots?.length || dayPlans[date].freeItems?.length || dayPlans[date].notes);
                  return (
                    <div key={date} onClick={() => setSelectedDate(date)}
                      style={{ padding: "7px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 2,
                        background: isSelected ? T.hover : "transparent",
                        borderLeft: `3px solid ${isSelected ? typeColors[type] : "transparent"}`,
                        transition: "all 0.1s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 400, color: T.text }}>
                          {new Date(date).toLocaleDateString("de-DE", { weekday: "short", day: "numeric" })}
                        </div>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {hasContent && <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.green }} />}
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: typeColors[type], opacity: 0.7 }} />
                        </div>
                      </div>
                      {dayCity && <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{dayCity}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* Legend */}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 4 }}>
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 10, color: T.muted }}>{typeLabels[type]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day detail */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ ...g.card, borderLeft: `4px solid ${typeColors[getDateType(selectedDate)]}`, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{fmtDateLong(selectedDate)}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{city} · <span style={{ color: typeColors[getDateType(selectedDate)] }}>{typeLabels[getDateType(selectedDate)]}</span></div>
                {stopByDate[selectedDate] && (
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{stopByDate[selectedDate].train}</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => {
                  const idx = allDates.indexOf(selectedDate);
                  if (idx > 0) setSelectedDate(allDates[idx - 1]);
                }} style={g.btn(T.subtle, true)}>← Vorheriger</button>
                <button onClick={() => {
                  const idx = allDates.indexOf(selectedDate);
                  if (idx < allDates.length - 1) setSelectedDate(allDates[idx + 1]);
                }} style={g.btn(T.subtle, true)}>Nächster →</button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {/* Left: Time slots */}
            <div style={{ flex: 2, minWidth: 260 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={g.sTitle}>Zeitplan</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["08:00","10:00","12:00","14:00","16:00","18:00","20:00"].map(t => (
                    !plan.slots?.find(s => s.time === t) &&
                    <button key={t} onClick={() => addSlot(t)}
                      style={{ ...g.btn(T.subtle, true), fontSize: 10, padding: "3px 8px" }}>{t}</button>
                  ))}
                  <select onChange={e => { if (e.target.value) { addSlot(e.target.value); e.target.value = ""; } }}
                    style={{ ...g.inp, width: "auto", fontSize: 11, padding: "3px 8px", cursor: "pointer" }}>
                    <option value="">+ Uhrzeit</option>
                    {TIMESLOTS.filter(t => !plan.slots?.find(s => s.time === t)).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {(!plan.slots || plan.slots.length === 0) && (
                <div style={{ color: T.muted, fontSize: 12, padding: "16px 0" }}>Noch keine Zeitslots. Wähle eine Uhrzeit oben.</div>
              )}

              {(plan.slots || []).map(slot => (
                <div key={slot.time} style={{ ...g.card, marginBottom: 10, padding: 14 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: typeColors[getDateType(selectedDate)], minWidth: 50 }}>{slot.time}</div>
                    <input style={{ ...g.inp, flex: 1, fontSize: 13 }} placeholder="Was ist geplant?"
                      value={slot.title} onChange={e => updateSlot(slot.time, "title", e.target.value)} />
                    <button style={g.btn(T.red, true)} onClick={() => removeSlot(slot.time)}>×</button>
                  </div>
                  {citySights.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <select style={{ ...g.inp, fontSize: 11, cursor: "pointer" }}
                        value={slot.sightId ?? ""}
                        onChange={e => updateSlot(slot.time, "sightId", e.target.value || null)}>
                        <option value="">Sehenswürdigkeit verknüpfen…</option>
                        {citySights.map((s, i) => <option key={i} value={i}>{s.name || `Sehenswürdigkeit ${i+1}`}</option>)}
                      </select>
                      {slot.sightId !== null && citySights[slot.sightId] && (
                        <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>
                          {citySights[slot.sightId].address && <span>{citySights[slot.sightId].address}</span>}
                          {citySights[slot.sightId].notes && <span style={{ marginLeft: 8 }}>– {citySights[slot.sightId].notes.slice(0,60)}</span>}
                        </div>
                      )}
                    </div>
                  )}
                  <textarea style={{ ...g.ta, minHeight: 55, fontSize: 12 }} placeholder="Notizen zu diesem Slot…"
                    value={slot.notes} onChange={e => updateSlot(slot.time, "notes", e.target.value)} />
                </div>
              ))}
            </div>

            {/* Right: Free list + day notes */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={g.sTitle}>Freie Liste</div>
                <button style={g.btn(T.subtle, true)} onClick={addFreeItem}>+ Eintrag</button>
              </div>

              {(plan.freeItems || []).map((item, i) => (
                <div key={i} style={{ ...g.card, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: citySights.length > 0 ? 6 : 0 }}>
                    <div onClick={() => updateFreeItem(i, "done", !item.done)}
                      style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${item.done ? T.green : T.border}`,
                        background: item.done ? T.green : "transparent", cursor: "pointer", flexShrink: 0 }} />
                    <input style={{ ...g.inp, fontSize: 12, textDecoration: item.done ? "line-through" : "none", color: item.done ? T.muted : T.text }}
                      placeholder="Aktivität…" value={item.title}
                      onChange={e => updateFreeItem(i, "title", e.target.value)} />
                    <button style={g.btn(T.red, true)} onClick={() => removeFreeItem(i)}>×</button>
                  </div>
                  {citySights.length > 0 && (
                    <select style={{ ...g.inp, fontSize: 11, cursor: "pointer" }}
                      value={item.sightId ?? ""}
                      onChange={e => updateFreeItem(i, "sightId", e.target.value || null)}>
                      <option value="">Sehenswürdigkeit…</option>
                      {citySights.map((s, idx) => <option key={idx} value={idx}>{s.name || `Sehenswürdigkeit ${idx+1}`}</option>)}
                    </select>
                  )}
                </div>
              ))}

              {(!plan.freeItems || plan.freeItems.length === 0) && (
                <div style={{ color: T.muted, fontSize: 12, marginBottom: 12 }}>Noch keine Einträge.</div>
              )}

              <div style={g.divider} />
              <div style={g.sTitle}>Tagesnotizen</div>
              <textarea style={{ ...g.ta, minHeight: 120 }} placeholder="Allgemeine Notizen zum Tag…"
                value={plan.notes || ""}
                onChange={e => updatePlan({ ...plan, notes: e.target.value })} />
              <div style={{ fontSize: 10, color: T.subtle, marginTop: 8 }}>Wird automatisch gespeichert.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div style={g.app}>
      <div style={g.hdr}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", color: T.text }}>Interrail 2026</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>Berlin · 6. Juli — 7. August 2026</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={g.badge()}>32 Tage</span>
          <span style={{ ...g.badge(stopsSynced ? "#1a3a2a" : "#2a1a0a"), fontSize: 9 }}>
            {stopsSynced ? "Synced" : "Verbinde…"}
          </span>
        </div>
      </div>

      <div style={g.tabs}>
        {TABS.map((t, i) => (
          <button key={i} style={g.tab(activeTab === i)} onClick={() => setActiveTab(i)}>{t}</button>
        ))}
      </div>

      <div style={g.wrap}>
        {activeTab === 0 && <Overview />}
        {activeTab === 1 && <DayPlanTab />}
        {activeTab === 2 && <Etappen />}
        {activeTab === 3 && <MathTab />}
        {activeTab === 4 && <MapTab />}
        {activeTab === 5 && <SightsTab />}
        {activeTab === 6 && <DiaryTab />}
      </div>
    </div>
  );
}
