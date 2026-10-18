export default function handler(req: any, res: any) {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify({
    status: "ok",
    file: "api/index.ts",
    url: req.url,
    method: req.method,
  }))
}
