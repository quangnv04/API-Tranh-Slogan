from fastapi import Depends, HTTPException, Request, Response
from app.models.products import ProductsModel
from app.dependencies import router, get_db_for_new_thread

@router.get('/api/admin/products')
async def products(db=Depends(get_db_for_new_thread)):
    products_model = ProductsModel(db)
    products = products_model.get_all_products()
    return products

@router.get('/api/admin/product/{product_slug}')
async def get_products(product_slug: str, db=Depends(get_db_for_new_thread)):
    product_model = ProductsModel(db)
    product = product_model.get_product_by_slug(product_slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/api/admin/product/{product_slug}")
async def update_product(product_slug: str, request: Request, db=Depends(get_db_for_new_thread)):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

    if not data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    if "status" in data:
        new_status = data["status"]
        if new_status not in ("active", "inactive"):
            raise HTTPException(status_code=400, detail="Invalid status value")

    product_model = ProductsModel(db)

    if not product_model.get_product_by_slug(product_slug):
        raise HTTPException(status_code=404, detail="Product not found")

    success = product_model.update_product(product_slug, data)

    if success:
        return {"message": "Product updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update product")

@router.patch('/api/admin/product/{product_slug}/delete')
async def delete_product(product_slug: str, db=Depends(get_db_for_new_thread)):
    product_model = ProductsModel(db)
    existing_product = product_model.get_product_by_slug(product_slug)

    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if existing_product.get('status') == 'deleted':
        raise HTTPException(status_code=400, detail="Product already deleted")

    success = product_model.delete_product(product_slug)
    if success:
        return {"message": "Product deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete product")