import json
from fastapi import Depends
from app.dependencies import router, get_db
from app.adapters.products import ProductsAdapter
from app.models.products import ProductsModel


@router.get("/api/sync-products")
def sync_products(db=Depends(get_db)):
    products_adapter = ProductsAdapter(db)
    return products_adapter.sync_products()


@router.get("/api/products")
def read_products(page: int = 1, limit: int = 16, keyword: str = '', db=Depends(get_db)):
    products = ProductsModel(db).get_products(page, limit, keyword)
    total_products = ProductsModel(db).count_products()
    total_pages = (total_products + limit - 1) // limit
    for product in products:
        if product.get('images') != '':
            try:
                product['thumbnail'] = json.loads(product['images'].replace("'", '"'))[:6]
            except json.JSONDecodeError:
                product['thumbnail'] = []
            del product['images']
        product['title'] = product['type'] + ' ' + product['sku'] + ' ' + product['title']
    return {
        "products": products,
        "totalPages": total_pages
    }

@router.get("/api/sets")
def read_products(page: int = 1, limit: int = 16, keyword: str = '', db=Depends(get_db)):
    products = ProductsModel(db).get_sets(page, limit, keyword)
    total_products = ProductsModel(db).count_products()
    total_pages = (total_products + limit - 1) // limit
    for product in products:
        if product.get('images') != '':
            try:
                product['thumbnail'] = json.loads(product['images'].replace("'", '"'))[:6]
            except json.JSONDecodeError:
                product['thumbnail'] = []
            del product['images']
        if 'address' in product and product.get('address'):
            product['address'] = format_address(product['address'])
        product['title'] = product['type'] + ' ' + product['sku'] + ' ' + product['title']
    return {
        "products": products,
        "totalPages": total_pages
    }

