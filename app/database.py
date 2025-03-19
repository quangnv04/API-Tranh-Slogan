import sqlite3
from threading import local


class Database:
    def __init__(self, db_url):
        self.db_url = db_url
        self._thread_local = local()

    def _get_connection(self):
        if not hasattr(self._thread_local, 'connection'):
            self._thread_local.connection = sqlite3.connect(self.db_url)
            self._thread_local.connection.row_factory = sqlite3.Row
        return self._thread_local.connection

    def connect(self):
        """Get the current thread-local connection or create a new one."""
        return self._get_connection()

    def close(self):
        """Close the current thread-local connection."""
        connection = getattr(self._thread_local, 'connection', None)
        if connection:
            connection.close()
            del self._thread_local.connection

    def create_connection(self):
        conn = sqlite3.connect(self.db_url, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def close_connection(self, conn):
        if conn:
            conn.close()
