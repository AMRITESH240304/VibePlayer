export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const objectKey = url.pathname.replace("/songs/", "")
    
    const r2Response = await env.SONGS_BUCKET.get(objectKey)
    
    if (!r2Response) {
      return new Response("Not Found", { status: 404 })
    }

    return new Response(r2Response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000",
      }
    })
  },
}
