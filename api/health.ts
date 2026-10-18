export default function handler(req: any, res: any) {
  res.status(200).json({
    status: "ok",
    message: "Vercel serverless functions are active and working!",
    timestamp: new Date().toISOString(),
  })
}
