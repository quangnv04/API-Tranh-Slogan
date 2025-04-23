import time
import json
from fastapi import Request, Depends
from starlette.responses import HTMLResponse, RedirectResponse
from app.dependencies import router, templates, get_db, DEBUG
from app.utils import extract_size_price
from app.models.products import ProductsModel
from sqlite3 import Connection as SQLite3Connection
from starlette.concurrency import run_in_threadpool


@router.get("/product/{slug}", response_class=HTMLResponse)
async def get_product_detail(request: Request, slug: str, db: SQLite3Connection = Depends(get_db)):
    time_debug = "0.4"
    if DEBUG == 'True':
        time_debug = time.time()

    product_model = ProductsModel(db)
    product = await run_in_threadpool(product_model.get_product_by_slug, slug)
    if product is None:
        return RedirectResponse(url='/', status_code=303)

    product['thumbnail'] = ''
    if product.get('images') != '':
        try:
            product['images'] = json.loads(product['images'].replace("'", '"'))
            product['images'].append('https://sen-2.s3.ap-southeast-1.amazonaws.com/product-details/cac-loai-khung-nhua-ps-van-go.png')
            product['images'].append('https://sen-2.s3.ap-southeast-1.amazonaws.com/product-details/cac-loai-khung-tranh.png')
            product['images'].append('https://sen-2.s3.ap-southeast-1.amazonaws.com/product-details/cac-loai-mau-khung-tranh.png')
            product['images'].append('https://sen-2.s3.ap-southeast-1.amazonaws.com/product-details/huong-dan-dong-dinh-treo-tranh.png')
            product['thumbnail'] = product['images'][0]
        except json.JSONDecodeError:
            product['images'] = []
    product['name'] = product['title']
    product['title'] = product['type'] + ' ' + product['sku'] + ' ' + product['title']
    product['description'] = f"Mua tranh slogan, động lực, treo tường và {product['title']} giá rẻ - Bảo hành 12 tháng, đổi mới 30 ngày, giao hàng toàn quốc. Mua {product['title']} tại đây."
    product['canvas_price'] = extract_size_price(product['canvas_price'])
    product['mica_price'] = extract_size_price(product['mica_price'])

    return templates.TemplateResponse("product-detail.html", {
        "request": request,
        "product": product,
        "time": time_debug
    })

@router.get("/set/{slug}", response_class=HTMLResponse)
async def get_set_detail(request: Request, slug: str, db: SQLite3Connection = Depends(get_db)):
    time_debug = "0.4"
    if DEBUG == 'True':
        time_debug = time.time()

    product_model = ProductsModel(db)
    product = await run_in_threadpool(product_model.get_product_by_slug, slug)
    if product is None:
        return RedirectResponse(url='/', status_code=303)

    product['thumbnail'] = ''
    if product.get('images') != '':
        try:
            product['images'] = json.loads(product['images'].replace("'", '"'))
            product['images'].append('https://sen-2.s3.ap-southeast-1.amazonaws.com/product-details/cac-loai-khung-nhua-ps-van-go.png')
            product['images'].append('https://sen-2.s3.ap-southeast-1.amazonaws.com/product-details/cac-loai-khung-tranh.png')
            product['images'].append('https://sen-2.s3.ap-southeast-1.amazonaws.com/product-details/cac-loai-mau-khung-tranh.png')
            product['images'].append('https://sen-2.s3.ap-southeast-1.amazonaws.com/product-details/huong-dan-dong-dinh-treo-tranh.png')
            product['thumbnail'] = product['images'][0]
        except json.JSONDecodeError:
            product['images'] = []
    product['name'] = product['title']
    product['title'] = product['type'] + ' ' + product['sku'] + ' ' + product['title']
    product['description'] = f"Mua tranh slogan, động lực, treo tường và {product['title']} giá rẻ - Bảo hành 12 tháng, đổi mới 30 ngày, giao hàng toàn quốc. Mua {product['title']} tại đây."
    product['canvas_price'] = extract_size_price(product['canvas_price'])

    return templates.TemplateResponse("set-detail.html", {
        "request": request,
        "product": product,
        "time": time_debug
    })
