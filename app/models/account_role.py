from app.dependencies import GOOGLE_SPREADSHEET_API_URL


class AccountRolesModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection

    def assign_role_to_account(self, account_id, role_id):
        cursor = self.db_connection.cursor()
        cursor.execute(
            '''
            INSERT INTO account_roles (account_id, role_id)
            VALUES (?, ?)
            ON CONFLICT(account_id, role_id) DO NOTHING
            ''',
            (account_id, role_id)
        )
        self.db_connection.commit()

    def get_roles_by_account_id(self, account_id):
        cursor = self.db_connection.cursor()
        cursor.execute(
            '''
            SELECT r.* FROM roles r
            JOIN account_roles ar ON r.id = ar.role_id
            WHERE ar.account_id = ?
            ''',
            (account_id,)
        )
        roles = cursor.fetchall()
        return [dict(row) for row in roles]

    def remove_role_from_account(self, account_id, role_id):
        cursor = self.db_connection.cursor()
        cursor.execute(
            'DELETE FROM account_roles WHERE account_id = ? AND role_id = ?',
            (account_id, role_id)
        )
        self.db_connection.commit()
