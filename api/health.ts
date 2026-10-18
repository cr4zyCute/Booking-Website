export default function handler(req: any, res: any) {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify({
    status: "ok",
    message: "Vercel serverless functions are active and working!",
    timestamp: new Date().toISOString(),
  }))
}
