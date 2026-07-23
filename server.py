import os
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
import uvicorn

app = FastAPI(title="HaloAI API Server", version="1.0.0")

@app.get("/")
async def root():
    return HTMLResponse(content="""
    <html>
        <head>
            <title>HaloAI — Voice Receptionist API</title>
            <style>
                body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; text-align: center; max-width: 480px; }
                h1 { color: #38bdf8; margin-top: 0; }
                .status { background: #166534; color: #4ade80; padding: 6px 12px; border-radius: 20px; font-weight: bold; display: inline-block; font-size: 0.85rem; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>HaloAI 📞🤖</h1>
                <p>Wirtualny Asystent Głosowy dla Małych Firm w Polsce</p>
                <div class="status">● System Operational</div>
            </div>
        </body>
    </html>
    """)

@app.post("/webhook/vapi")
async def vapi_webhook(request: Request):
    """
    Webhook endpoint to receive call events from Vapi.ai / Voice Engine
    """
    try:
        body = await request.json()
        message_type = body.get("message", {}).get("type")
        
        if message_type == "end-of-call-report":
            # Extract summary, call recording, client details
            call_summary = body.get("message", {}).get("summary", "Brak podsumowania")
            transcript = body.get("message", {}).get("transcript", "")
            
            print(f"[HaloAI Call Finished] Summary: {call_summary}")
            # TODO: Send Telegram notification to master
            
        return JSONResponse(content={"status": "success"})
    except Exception as e:
        print(f"Error handling webhook: {e}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8060))
    uvicorn.run(app, host="0.0.0.0", port=port)
