import json
from fastapi import Depends, HTTPException, Request, Response
from app.models.products import ProductsModel
from app.dependencies import router, get_db_for_new_thread

@router.get('/api/admin/products')
async def products(db=Depends(get_db_for_new_thread)):
    products_model = ProductsModel(db)
    products = products_model.get_all_products()
    return products

@router.get('/api/admin/product/{product_hash}')
async def get_products(product_hash: str, db=Depends(get_db_for_new_thread)):
    product_model = ProductsModel(db)
    product = product_model.get_product_by_hash(product_hash)
    if product.get('images') != '':
            try:
                product['thumbnail'] = json.loads(product['images'].replace("'", '"'))[:6]
            except json.JSONDecodeError:
                product['thumbnail'] = []
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
   
@router.post("/api/admin/product")
async def create_product(request: Request, db=Depends(get_db_for_new_thread)):
    try:
        data = await request.json()
        sku = data.get("sku")
        title = data.get("title")
        type = data.get("type")
        canvas_price = data.get("canvas_price")
        mica_price = data.get("mica_price")
        images = data.get("images")
        discount = data.get("discount")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    if not sku or not title or not type or not canvas_price or not mica_price or not images:
        raise HTTPException(status_code=400, detail="SKU, Title, Type, Canvas price, Mica price, Images is required")
    
    if discount != '':
        try:
            discount = float(discount)
        except ValueError:
            raise HTTPException(status_code=400, detail="Discount must be a number")
        
        if not (0 <= discount <= 100):
            raise HTTPException(status_code=400, detail="Discount must be between 0 and 100")  

    product_model = ProductsModel(db)

    existing_sku = db.execute(
        "SELECT * FROM products WHERE sku = :sku", {"sku": sku}
    ).fetchone()
    if existing_sku:
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    data["hash"] = product_model._generate_hash({
        "type": type,
        "sku": sku,
        "title": title
    })

    try:
        product_model.insert_products([data])
        return {"message": "Product created or updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create product")

@router.put("/api/admin/product/{product_hash}")
async def update_product(product_hash: str, request: Request, db=Depends(get_db_for_new_thread)):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

    if not data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    product_model = ProductsModel(db)

    existing_product = product_model.get_product_by_hash(product_hash)
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # current_type = existing_product["type"]
    # current_sku = existing_product["sku"]
    # current_title = existing_product["title"]

    # new_type = data.get("type", current_type)
    # new_title = data.get("title", current_title)
    # if new_type != current_type or new_title != current_title:
    #     new_hash = product_model._generate_hash({
    #         "type": new_type,
    #         "sku": current_sku,
    #         "title": new_title
    #     })
    #     data["hash"] = new_hash
    
    success = product_model.update_product(product_hash, data)

    if success:
        return {"message": "Product updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update product")

@router.patch('/api/admin/product/{product_hash}/delete')
async def delete_product(product_hash: str, db=Depends(get_db_for_new_thread)):
    product_model = ProductsModel(db)
    existing_product = product_model.get_product_by_hash(product_hash)

    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")

    success = product_model.delete_product(product_hash)
    if success:
        return {"message": "Product deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete product")