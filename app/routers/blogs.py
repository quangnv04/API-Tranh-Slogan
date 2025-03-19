import time
from fastapi import Request, Depends
from starlette.responses import HTMLResponse, RedirectResponse
from app.dependencies import router, templates, get_db, DEBUG
from app.models.blogs import BlogsModel
from sqlite3 import Connection as SQLite3Connection
from starlette.concurrency import run_in_threadpool


@router.get("/blogs", response_class=HTMLResponse)
async def get_blogs(request: Request):
    time_debug = "0.3"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("blogs.html", {"request": request, "time": time_debug})


@router.get("/blog/{slug}", response_class=HTMLResponse)
async def get_blog_detail(request: Request, slug: str, db: SQLite3Connection = Depends(get_db)):
    time_debug = "0.3"
    if DEBUG == 'True':
        time_debug = time.time()

    blog = await run_in_threadpool(BlogsModel(db).get_blogs_by_slug, slug)

    if blog is None:
        return RedirectResponse(url='/blogs', status_code=303)

    blog['key_takeaways'] = blog['key_takeaways'].split("\n")

    return templates.TemplateResponse("blogs-detail.html", {
        "request": request,
        "blog": blog,
        "time": time_debug
    })

