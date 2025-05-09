from app.dependencies import GOOGLE_SPREADSHEET_API_URL


class RolesModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection

    def insert_role(self, role, description=None):
        cursor = self.db_connection.cursor()
        cursor.execute(
            '''
            INSERT INTO roles (role, description)
            VALUES (?, ?)
            ON CONFLICT(role) DO UPDATE SET
                description = excluded.description
            ''',
            (role, description)
        )
        self.db_connection.commit()

    def get_role_by_id(self, role_id):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM roles WHERE id = ?', (role_id,))
        role = cursor.fetchone()
        return dict(role) if role else None

    def get_role_by_role(self, role):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM roles WHERE role = ?', (role,))
        role = cursor.fetchone()
        return dict(role) if role else None

    def get_roles(self):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM roles')
        roles = cursor.fetchall()
        return [dict(row) for row in roles]
    
    def update_role(self, role_id, updates):
        cursor = self.db_connection.cursor()
        set_clause = ', '.join(f"{key} = ?" for key in updates.keys())
        values = list(updates.values())
        values.append(role_id)

        result = cursor.execute(f'''
        UPDATE roles
        SET {set_clause}
        WHERE id = ?
        ''', values)
        self.db_connection.commit()
        return result.rowcount > 0

    def delete_role(self, role_id):
        cursor = self.db_connection.cursor()
        result = cursor.execute('DELETE FROM roles WHERE id = ?', (role_id,))
        self.db_connection.commit()
        return result.rowcount > 0
