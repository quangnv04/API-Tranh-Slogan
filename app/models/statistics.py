import sqlite3
from typing import List, Tuple, Dict
from app.dependencies import GOOGLE_SPREADSHEET_API_URL


class StatisticsModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection
        self.db_connection.row_factory = sqlite3.Row

    type_to_formats = {
        'date': {
            'formats': ["%Y-%m-%d"],
            'display': "strftime('%d/%m/%Y', created_at)"
        },
        'year': {
            'formats': ["%Y"],
            'display': "strftime('%Y', created_at)"
        },
        'month': {
            'formats': ["%Y", "%m"],
            'display': "CONCAT(strftime('%m', created_at), '/', strftime('%Y', created_at))"
        },
        'week': {
            'formats': ["%Y", "%W"],
            'display': "CONCAT('Tuần ', strftime('%W', created_at), '/', strftime('%Y', created_at))"
        }
    }

    def build_group_by_and_order_by(self, type: str) -> Tuple[str, str, str]:
        type = type.lower()
        type_upper = type.upper()

        if type not in self.type_to_formats:
            raise ValueError(f"Unsupported type: {type}")

        group_by_list = [
            f"strftime('{fmt}', created_at)"
            for fmt in self.type_to_formats[type]['formats']
        ]

        select_display = self.type_to_formats[type]['display']
        select_query = f"{select_display} AS Order{type_upper}"
        group_by = ", ".join(group_by_list)
        order_by = ", ".join(group_by_list)

        return select_query, group_by, order_by

    async def revenue_data(self, type: str, startDate: str = '', endDate: str = '',
                           limit: int = 7, offset: int = 0) -> List[Dict]:
        select_query, group_by, order_by = self.build_group_by_and_order_by(type)
        cursor = self.db_connection.cursor()

        base_query = f"""
            SELECT {select_query}, IFNULL(SUM(CAST(REPLACE(REPLACE(price, 'đ', ''), ',', '') AS REAL)), 0) AS total_price
            FROM orders
        """

        conditions = ["finished = 1"]
        params = []

        if startDate:
            conditions.append("created_at >= ?")
            params.append(startDate)
        if endDate:
            conditions.append("created_at <= ?")
            params.append(endDate)

        where_clause = " AND ".join(conditions)
        query = f"""
            {base_query}
            WHERE {where_clause}
            GROUP BY {group_by}
            ORDER BY {order_by}
            LIMIT {limit} OFFSET {offset}
        """

        cursor.execute(query, params)
        data = cursor.fetchall()
        return [dict(row) for row in data]

    async def revenue_count_order(self, type: str, startDate: str = '', endDate: str = '',
                                  limit: int = 7, offset: int = 0) -> List[Dict]:
        select_query, group_by, order_by = self.build_group_by_and_order_by(type)
        cursor = self.db_connection.cursor()

        base_query = f"""
            SELECT {select_query}, IFNULL(COUNT(id), 0) AS total_count
            FROM orders
        """

        conditions = ["finished = 1"]
        params = []

        if startDate:
            conditions.append("created_at >= ?")
            params.append(startDate)
        if endDate:
            conditions.append("created_at <= ?")
            params.append(endDate)

        where_clause = " AND ".join(conditions)
        query = f"""
            {base_query}
            WHERE {where_clause}
            GROUP BY {group_by}
            ORDER BY {order_by}
            LIMIT {limit} OFFSET {offset}
        """

        cursor.execute(query, params)
        data = cursor.fetchall()
        return [dict(row) for row in data]

    async def get_daily_revenue_and_order_count(self):
        cursor = self.db_connection.cursor()

        query = """
        SELECT
            COALESCE(SUM(CASE 
                WHEN DATE(created_at) = DATE('now') 
                THEN CAST(REPLACE(REPLACE(price, 'đ', ''), ',', '') AS REAL)
                END), 0) AS today_revenue,
            
            COALESCE(COUNT(CASE 
                WHEN DATE(created_at) = DATE('now') 
                THEN 1 
                END), 0) AS today_order_count,

            CASE 
                WHEN COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now', '-1 day') THEN CAST(REPLACE(REPLACE(price, 'đ', ''), ',', '') AS REAL) END), 0) = 0 THEN
                    0.0
                ELSE
                    ROUND(
                        100.0 * (
                            COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now') THEN CAST(REPLACE(REPLACE(price, 'đ', ''), ',', '') AS REAL) END), 0) - 
                            COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now', '-1 day') THEN CAST(REPLACE(REPLACE(price, 'đ', ''), ',', '') AS REAL) END), 0)
                        ) / COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now', '-1 day') THEN CAST(REPLACE(REPLACE(price, 'đ', ''), ',', '') AS REAL) END), 1),
                        2
                    )
            END AS revenue_percent_change,

            CASE 
                WHEN COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now', '-1 day') THEN 1 END), 0) = 0 THEN
                    0.0
                ELSE
                    ROUND(
                        100.0 * (
                            COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END), 0) - 
                            COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now', '-1 day') THEN 1 END), 0)
                        ) / COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now', '-1 day') THEN 1 END), 1),
                        2
                    )
            END AS order_count_percent_change

        FROM orders
        WHERE DATE(created_at) IN (DATE('now'), DATE('now', '-1 day'))
        AND finished = 1;
        """

        cursor.execute(query)
        row = cursor.fetchone()

        return dict(row) if row else None
