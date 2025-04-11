import hashlib
import sqlite3
import urllib.parse
from app.dependencies import GOOGLE_SPREADSHEET_API_URL

class OrdersModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection
        self.db_connection.row_factory = sqlite3.Row
        
    def _generate_hash(self, order):
        hash_string = f"{order['name']}|{order['phone']}|{order['address']}|{order['product']}"
        return hashlib.md5(hash_string.encode('utf-8')).hexdigest()
 
    def insert_orders(self, order):
        cursor = self.db_connection.cursor()
        order_hash = self._generate_hash(order) or self._generate_hash(order)
        try:
            cursor.execute(
                '''
                INSERT INTO orders (hash, name, phone, address, product, notes, status, finished, price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(hash) DO UPDATE SET
                name = excluded.name,
                phone = excluded.phone,
                address = excluded.address,
                product = excluded.product,
                notes = excluded.notes,
                status = excluded.status,
                finished = excluded.finished,
                price = excluded.price
                ''',
                (
                    order_hash,
                    order['name'],
                    order['phone'],
                    order['address'],
                    order['product'],
                    order.get('notes', ''),
                    order.get('status', 'inactive'),
                    1 if order.get('finished', False) else 0,
                    order.get('price', '0 VNĐ')
                )
            )
            self.db_connection.commit()
            return {"success": True, "message": "Order inserted successfully"}
        
        except Exception as e:
            print(f"Lỗi chèn đơn hàng: {e}. Đơn hàng: {order}")
            self.db_connection.rollback()
            raise
            
    def insert_multiple_orders(self, orders_list):
        success_count = 0
        failed_count = 0
        
        for order in orders_list:
            result = self.insert_orders(order)
            if result.get("success"):
                success_count += 1
            else:
                failed_count += 1
                
        return {
            "success": success_count,
            "failed": failed_count
        }


    def get_orders(self, page, limit, keyword=None):
        offset = (page - 1) * limit
        cursor = self.db_connection.cursor()
        keyword_like_query = ''
        keyword_params = []

        if keyword:
            decoded_keywords = urllib.parse.unquote(keyword).split(', ')
            keyword_conditions = []
            for dk in decoded_keywords:
                condition = '(LOWER(name) LIKE ? OR LOWER(address) LIKE ? OR LOWER(product) LIKE ?)'
                keyword_conditions.append(condition)
                keyword_params.extend([f'%{dk.lower()}%', f'%{dk.lower()}%', f'%{dk.lower()}%'])
            keyword_like_query = 'AND (' + ' OR '.join(keyword_conditions) + ')'

        cursor.execute(f'''
        SELECT id, hash, name, phone, address, product, notes, created_at, status, finished
        FROM orders
        WHERE status='inactive' {keyword_like_query}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        ''', (*keyword_params, limit, offset))

        orders = cursor.fetchall()
        return [dict(row) for row in orders]
    
    def get_orders_by_hash(self, hash):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM orders WHERE hash = ?', (hash,))
        order = cursor.fetchone()
        return dict(order) if order else None

    def update_order(self, order_hash, updates):
        cursor = self.db_connection.cursor()
        set_clause = ', '.join(f"{key} = ?" for key in updates.keys())
        values = list(updates.values())
        values.append(order_hash)

        cursor.execute(f'''
        UPDATE orders
        SET {set_clause}
        WHERE hash = ?
        ''', values)
        self.db_connection.commit()

    def delete_order(self, order_hash):
        cursor = self.db_connection.cursor()
        cursor.execute('DELETE FROM orders WHERE hash = ?', (order_hash,))
        self.db_connection.commit()
        result = cursor.fetchone()
        return result.rowcount > 0
        
    def count_orders(self, keyword=None):
        cursor = self.db_connection.cursor()
        keyword_like_query = ''
        keyword_params = []

        if keyword:
            decoded_keywords = urllib.parse.unquote(keyword).split(', ')
            keyword_conditions = []
            for dk in decoded_keywords:
                condition = '(LOWER(name) LIKE ? OR LOWER(address) LIKE ? OR LOWER(product) LIKE ?)'
                keyword_conditions.append(condition)
                keyword_params.extend([f'%{dk.lower()}%', f'%{dk.lower()}%', f'%{dk.lower()}%'])
            keyword_like_query = 'AND (' + ' OR '.join(keyword_conditions) + ')'

        cursor.execute(f'''
        SELECT COUNT(*) as count
        FROM orders
        WHERE status='active' {keyword_like_query}
        ''', keyword_params)

        result = cursor.fetchone()
        return result['count'] if result else 0

    def get_all_orders(self):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM orders')
        orders = cursor.fetchall()
        return [dict(row) for row in orders]
