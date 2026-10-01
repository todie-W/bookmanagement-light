// Wir speichern die originale fetch-Funktion, bevor wir sie überschreiben.
// So können wir sie intern weiterhin nutzen – ohne endlose Rekursion.
const originalFetch = window.fetch;

// window.fetch wird global überschrieben ("monkey patching").
// Jeder fetch()-Aufruf in der App läuft ab jetzt automatisch durch diesen Interceptor –
// ohne dass einzelne Komponenten oder Services etwas ändern müssen.
window.fetch = async (url, options, ...rest) => {
  // Schritt 1: Request ganz normal ausführen.
  let res = await originalFetch(url, { ...options }, ...rest);

  // Schritt 2: Antwort-Header prüfen.
  // Der WWW-Authenticate-Header wurde von unserer authenticate-Middleware gesetzt,
  // wenn der Access Token abgelaufen war.
  //const authHeader = res.headers.get("www-authenticate");

  // if (authHeader?.includes("token_expired")) {
  //   // Schritt 3: Refresh-Endpunkt aufrufen.
  //   // credentials: 'include' ist entscheidend – nur so schickt der Browser
  //   // den httpOnly-Cookie (refreshToken) mit, den er selbst nicht lesen kann.
  //   const refreshRes = await originalFetch(`/api/auth/refresh`, {
  //     method: "GET",
  //     credentials: "include",
  //   });

    // Schritt 4: War der Refresh erfolgreich?
    // Wenn nicht (RefreshToken abgelaufen, nicht in DB, User gelöscht...), muss sich der User neu einloggen.
    // if (!refreshRes.ok) throw new Error("Login required");

    // Schritt 5: Original-Request wiederholen.
    // Der Server hat im Refresh-Schritt neue Cookies gesetzt –
    // der Browser schickt den frischen Access Token jetzt automatisch mit.
    // res = await originalFetch(url, { ...options }, ...rest);
  // }

  return res; // fetch response zurück an den normalen Ablauf geben
};

export {}; // Datei muss z.B. in App.tsx oder main.tsx importiert werden