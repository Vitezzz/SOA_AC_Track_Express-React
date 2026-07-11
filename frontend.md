## Proxy
El navegador no deja por seguridad que los puertos del back y front se hablen

El proxy le dice a vite cuando alguien llame a /api en puerto 5173 tu encargate de llamar al back y traer la respuesta

fetch("/api/auth/login")
       │
       ▼
   Vite (5173)  ──►  "Esto empieza con /api, lo reenvío"
       │
       ▼
   Express (3000) ──►  Responde con JSON
       │
       ▼
   Vite recibe la respuesta y se la devuelve a tu fetch

   