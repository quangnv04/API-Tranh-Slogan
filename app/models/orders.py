import sqlite3
import urllib.parse
from app.dependencies import GOOGLE_SPREADSHEET_API_URL

class OrdersModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection
        self.db_connection.row_factory = sqlite3.Row

    def insert_orders(self, order):
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(
                '''
                INSERT INTO orders (id, name, address, phone_number, product, notes, time_created, orders, finished)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
                ''',
                (
                    order['id'],
                    order['name'],
                    order['address'],
                    order['phoneNumber'],
                    order['product'],
                    order.get('notes', ''),
                    order.get('order', 'Chưa xác nhận'), 
                    order['finished'] if 'finished' in order else 0
                )
            )
            self.db_connection.commit()
            return True
        except KeyError as e:
            print(f"Lỗi: Thiếu key trong đơn hàng: {e}. Đơn hàng: {order}")
            self.db_connection.rollback()  # Rollback trong trường hợp lỗi
            raise
        except Exception as e:
            print(f"Lỗi chèn đơn hàng: {e}. Đơn hàng: {order}")
            self.db_connection.rollback()
            raise


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
        SELECT id, name, address, phone_number, product, notes, time_created, orders, finished
        FROM orders
        WHERE 1=1 {keyword_like_query}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        ''', (*keyword_params, limit, offset))

        orders = cursor.fetchall()
        return [dict(row) for row in orders]
    
    def get_orders_by_id(self, id):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM orders WHERE id = ?', (id,))
        order = cursor.fetchone()
        return dict(order) if order else None

    def update_order(self, order_id, updates):
        cursor = self.db_connection.cursor()
        set_clause = ', '.join(f"{key} = ?" for key in updates.keys())
        values = list(updates.values())
        values.append(order_id)

        cursor.execute(f'''
        UPDATE orders
        SET {set_clause}
        WHERE id = ?
        ''', values)
        self.db_connection.commit()

    def delete_order(self, order_id):
        cursor = self.db_connection.cursor()
        result = cursor.execute('DELETE FROM orders WHERE id = ?', (order_id,))
        self.db_connection.commit()
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
        WHERE 1=1 {keyword_like_query}
        ''', keyword_params)

        result = cursor.fetchone()
        return result['count'] if result else 0

    def get_all_orders(self):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM orders')
        orders = cursor.fetchall()
        return [dict(row) for row in orders]
