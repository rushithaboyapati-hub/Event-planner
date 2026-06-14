import os
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

app = FastAPI(title="Event Planner API Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _parse_backend_urls(env_name: str, default_urls: list[str]) -> list[str]:
    configured = os.getenv(env_name, "").strip()
    if configured:
        return [value.strip().rstrip("/") for value in configured.split(",") if value.strip()]
    return default_urls

SQL_BASES = _parse_backend_urls("SQL_API_URL", ["http://localhost:8080", "http://localhost:8090"])
MONGO_BASES = _parse_backend_urls("MONGO_API_URL", ["http://localhost:3001"])

client = httpx.AsyncClient(timeout=30.0)

async def proxy_request(base_urls, request: Request, target_path: str = None):
    path = target_path if target_path is not None else request.url.path
    query = request.url.query if request.url.query else ""
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)

    last_error = None
    for base_url in base_urls:
        target = f"{base_url}{path}"
        if query:
            target += f"?{query}"
        try:
            resp = await client.request(
                method=request.method,
                url=target,
                headers=headers,
                content=body,
            )
            response_headers = dict(resp.headers)
            for hop_by_hop in ("content-length", "transfer-encoding", "connection", "content-encoding"):
                response_headers.pop(hop_by_hop, None)
            return Response(content=resp.content, status_code=resp.status_code, headers=response_headers)
        except httpx.ConnectError as exc:
            last_error = exc
            continue

    return JSONResponse(status_code=502, content={"error": f"Backend unavailable: {', '.join(base_urls)}", "details": str(last_error) if last_error else None})

# Proxy: Spring Boot endpoints
@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_auth(path: str, request: Request):
    return await proxy_request(SQL_BASES, request)

@app.api_route("/api/sql/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_sql(path: str, request: Request):
    return await proxy_request(SQL_BASES, request, target_path=f"/api/{path}")

@app.api_route("/api/uinfo", methods=["GET"])
async def proxy_uinfo(request: Request):
    return await proxy_request(SQL_BASES, request)

@app.api_route("/api/health", methods=["GET"])
async def proxy_health(request: Request):
    return await proxy_request(SQL_BASES, request)

# Proxy: Node.js / MongoDB endpoints
@app.api_route("/api/mongo/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_mongo(path: str, request: Request):
    return await proxy_request(MONGO_BASES, request, target_path=f"/api/{path}")

@app.api_route("/api/mongo", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_mongo_root(request: Request):
    return await proxy_request(MONGO_BASES, request, target_path="/api")

# Gateway health
@app.get("/api/gateway/health")
async def gateway_health():
    sql_ok = False
    mongo_ok = False
    for base_url in SQL_BASES:
        try:
            r = await client.get(f"{base_url}/api/health", timeout=3.0)
            if r.status_code == 200:
                sql_ok = True
                break
        except Exception:
            continue
    for base_url in MONGO_BASES:
        try:
            r = await client.get(f"{base_url}/api/health", timeout=3.0)
            if r.status_code == 200:
                mongo_ok = True
                break
        except Exception:
            continue
    return {
        "status": "ok",
        "gateway": "FastAPI",
        "sql_backend": "connected" if sql_ok else "unavailable",
        "mongo_backend": "connected" if mongo_ok else "unavailable",
    }

# Serve static frontend if dist exists
static_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("FASTAPI_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
