export function sendJson(res, status, obj) {
      res.statusCode = status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(obj));
}

export function getCookie(req, name) {
      const cookie = req.headers?.cookie || "";
        const parts = cookie.split(";").map(s => s.trim());
          for (const p of parts) {
                if (p.startsWith(name + "=")) return decodeURIComponent(p.slice(name.length + 1));
          }
            return null;
}
