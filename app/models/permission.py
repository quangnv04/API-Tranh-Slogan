from app.dependencies import GOOGLE_SPREADSHEET_API_URL


class PermissionsModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection

    def insert_permission(self, permission, api_path, description=None):
        cursor = self.db_connection.cursor()
        cursor.execute(
            '''
            INSERT INTO permissions (permission, api_path, description)
            VALUES (?, ?, ?)
            ON CONFLICT(permission) DO UPDATE SET
                api_path = excluded.api_path,
                description = excluded.description
            ''',
            (permission, api_path, description)
        )
        self.db_connection.commit()

    def get_permission_by_id(self, permission_id):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM permissions WHERE id = ?', (permission_id,))
        permission = cursor.fetchone()
        return dict(permission) if permission else None

    def get_permissions(self):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM permissions')
        permissions = cursor.fetchall()
        return [dict(row) for row in permissions]

    def delete_permission(self, permission_id):
        cursor = self.db_connection.cursor()
        cursor.execute('DELETE FROM permissions WHERE id = ?', (permission_id,))
        self.db_connection.commit()
