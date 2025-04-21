from app.dependencies import GOOGLE_SPREADSHEET_API_URL


class AccountModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection

    def insert_account(self, account):
        cursor = self.db_connection.cursor()
        cursor.execute(
            '''
            INSERT INTO account (username, password_hash, email, phone, notes, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT(username) DO UPDATE SET
                password_hash = excluded.password_hash,
                email = excluded.email,
                phone = excluded.phone,
                notes = excluded.notes,
                status = excluded.status,
                updated_at = CURRENT_TIMESTAMP
            ''',
            (
                account['username'],
                account['password_hash'],
                account.get('email', None),
                account['phone'],
                account['notes'],
                account['status'],
            )
        )
        self.db_connection.commit()

    def get_account_by_id(self, account_id):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM account WHERE id = ?', (account_id,))
        account = cursor.fetchone()
        return dict(account) if account else None
    
    def get_account_by_username(self, username):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM account WHERE username = ?', (username,))
        account = cursor.fetchone()
        return dict(account) if account else None
    
    def get_account_by_email(self, email):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM account WHERE email = ?', (email,))
        account = cursor.fetchone()
        return dict(account) if account else None
    
    def get_account_by_phone(self, phone):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM account WHERE phone = ?', (phone,))
        account = cursor.fetchone()
        return dict(account) if account else None

    def get_accounts(self, page, limit, keyword=None):
        offset = (page - 1) * limit
        cursor = self.db_connection.cursor()
        keyword_like_query = ''
        keyword_params = []
        if keyword:
            keyword_like_query = 'AND (username LIKE ? OR email LIKE ?)'
            keyword_params = [f'%{keyword}%', f'%{keyword}%']

        cursor.execute(f'''
        SELECT *
        FROM account
        WHERE 1=1 {keyword_like_query}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        ''', (*keyword_params, limit, offset))
        accounts = cursor.fetchall()
        return [dict(row) for row in accounts]

    def update_account(self, account_id, updated_data):
        cursor = self.db_connection.cursor()
        set_clauses = []
        params = []
        for key, value in updated_data.items():
            set_clauses.append(f"{key} = ?")
            params.append(value)
        params.append(account_id)

        set_query = ', '.join(set_clauses)
        result = cursor.execute(
            f'''
            UPDATE account
            SET {set_query}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            ''',
            params
        )
        self.db_connection.commit()
        return result.rowcount > 0

    def delete_account(self, account_id):
        cursor = self.db_connection.cursor()
        cursor.execute('DELETE FROM account WHERE id = ?', (account_id,))
        self.db_connection.commit()

    def get_all_accounts(self):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM account')
        accounts = cursor.fetchall()
        return [dict(row) for row in accounts]