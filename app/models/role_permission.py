from app.dependencies import GOOGLE_SPREADSHEET_API_URL


class RolePermissionsModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection

    def assign_permission_to_role(self, role_id, permission_id):
        cursor = self.db_connection.cursor()
        cursor.execute(
            '''
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (?, ?)
            ON CONFLICT(role_id, permission_id) DO NOTHING
            ''',
            (role_id, permission_id)
        )
        self.db_connection.commit()

    def get_permissions_by_role_id(self, role_id):
        cursor = self.db_connection.cursor()
        cursor.execute(
            '''
            SELECT p.* FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
            ''',
            (role_id,)
        )
        permissions = cursor.fetchall()
        return [dict(row) for row in permissions]

    def remove_permission_from_role(self, role_id, permission_id):
        cursor = self.db_connection.cursor()
        cursor.execute(
            'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
            (role_id, permission_id)
        )
        self.db_connection.commit()
