import sqlite3
import urllib.parse
from app.dependencies import GOOGLE_SPREADSHEET_API_URL


class ProductsModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection
        self.db_connection.row_factory = sqlite3.Row

    def insert_products(self, products):
        cursor = self.db_connection.cursor()
        for product in products:
            if product.get('hash', '') == '':
                continue
            images = str(product['images'])

            cursor.execute(
                '''
                INSERT INTO products (hash, sku, title, slug, type, canvas_price, mica_price, discount, images, description, publish, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT(hash) DO UPDATE SET
                sku=excluded.sku,
                title=excluded.title,
                slug=excluded.slug,
                type=excluded.type,
                canvas_price=excluded.canvas_price,
                mica_price=excluded.mica_price,
                discount=excluded.discount,
                images=excluded.images,
                description=excluded.description,
                publish=excluded.publish,
                updated_at=CURRENT_TIMESTAMP
                ''',
                (
                    product['hash'],
                    product['sku'],
                    product['title'],
                    product['slug'],
                    product['type'],
                    str(product['canvasPrice']),
                    str(product['micaPrice']),
                    product['discount'],
                    images,
                    product['description'],
                    product['publish'],
                )
            )
        self.db_connection.commit()

    def get_products(self, page, limit, keyword, type = None):
        offset = (page - 1) * limit
        cursor = self.db_connection.cursor()
        keyword_like_query = ''
        keyword_params = []
        if keyword:
            decoded_keywords = urllib.parse.unquote(keyword).split(', ')
            keyword_conditions = []
            for dk in decoded_keywords:
                condition = '(LOWER(address) LIKE ? OR LOWER(name) LIKE ? OR LOWER(name_of_product) LIKE ?)'
                keyword_conditions.append(condition)
                keyword_params.extend([f'%{dk.lower()}%', f'%{dk.lower()}%', f'%{dk.lower()}%'])
            keyword_like_query = 'AND (' + ' OR '.join(keyword_conditions) + ')'
        
        # product_types = ["Tranh Động Lực", "Tranh Tiếng Anh"]
        type_filter = ''
        if type:
            type_filter = f'AND type = ?'
            keyword_params.append(type)

        cursor.execute(f'''
        SELECT hash, sku, title, slug, type, canvas_price, mica_price, discount, images, description, publish
        FROM products
        WHERE publish = TRUE {keyword_like_query} {type_filter}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        ''', (*keyword_params, limit, offset))
        products = cursor.fetchall()
        return [dict(row) for row in products]
    
    def get_sets(self, page, limit, keyword):
        offset = (page - 1) * limit
        cursor = self.db_connection.cursor()
        keyword_like_query = ''
        keyword_params = []
        if keyword:
            decoded_keywords = urllib.parse.unquote(keyword).split(', ')
            keyword_conditions = []
            for dk in decoded_keywords:
                condition = '(LOWER(address) LIKE ? OR LOWER(name) LIKE ? OR LOWER(name_of_product) LIKE ?)'
                keyword_conditions.append(condition)
                keyword_params.extend([f'%{dk.lower()}%', f'%{dk.lower()}%', f'%{dk.lower()}%'])
            keyword_like_query = 'AND (' + ' OR '.join(keyword_conditions) + ')'
            
        set_types = ["Bộ 3 Tranh", "Bộ 4 Tranh", "Bộ 5 Tranh", "Bộ 6 Tranh"]
        type_filter = 'AND (type = ? OR type = ? OR type = ? OR type = ?)'

        cursor.execute(f'''
        SELECT hash, sku, title, slug, type, canvas_price, discount, images, description, publish
        FROM products
        WHERE publish = TRUE {keyword_like_query} {type_filter}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        ''', (*keyword_params, set_types[0], set_types[1], set_types[2], set_types[3], limit, offset))
        products = cursor.fetchall()
        return [dict(row) for row in products]

    def get_product_by_slug(self, slug):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM products WHERE slug = ?', (slug,))
        product = cursor.fetchone()
        return dict(product) if product else None

    def get_all_products(self):
        cursor = self.db_connection.cursor()
        cursor.execute(f'''
        SELECT *
        FROM products
        WHERE publish = TRUE
        ORDER BY id ASC
        ''', ())
        products = cursor.fetchall()
        return [dict(row) for row in products]
    
    # def count_products(self):
    #     cursor = self.db_connection.cursor()
    #     cursor.execute("SELECT COUNT(*) FROM products WHERE publish = TRUE")
    #     result = cursor.fetchone()
    #     return result[0] if result else 0
    
    def count_products(self, type=None):
        cursor = self.db_connection.cursor()
        if type:
            cursor.execute("SELECT COUNT(*) FROM products WHERE publish = TRUE AND type = ?", (type,))
        else:
            cursor.execute("SELECT COUNT(*) FROM products WHERE publish = TRUE")
        result = cursor.fetchone()
        return result[0] if result else 0
    
    def delete_product(self, product_slug):
        cursor = self.db_connection.cursor()
        result = cursor.execute('DELETE FROM products WHERE slug = ?', (product_slug,))
        self.db_connection.commit()
        return result.rowcount > 0

