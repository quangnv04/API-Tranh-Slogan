import json
from fastapi import Depends
from app.dependencies import router, get_db_for_new_thread
from app.adapters.blogs import BlogsAdapter
from app.models.blogs import BlogsModel


@router.get("/api/sync-blogs")
def sync_products(db=Depends(get_db_for_new_thread)):
    products_adapter = BlogsAdapter(db)
    return products_adapter.sync_blogs()


@router.get("/api/blogs")
def read_products(page: int = 1, limit: int = 2, db=Depends(get_db_for_new_thread)):
    blogs = BlogsModel(db).get_blogs(page, limit)
    total_blogs = BlogsModel(db).count_blogs()
    total_pages = (total_blogs + limit - 1) // limit 

    return {
        "blogs": blogs,
        "totalPages": total_pages
    }

