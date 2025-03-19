import sqlite3
from app.dependencies import GOOGLE_SPREADSHEET_API_URL
from app.models import blogs

class BlogsModel:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection
        self.db_connection.row_factory = sqlite3.Row

    def insert_blogs(self, blogs):
        cursor = self.db_connection.cursor()
        for blog in blogs:
            try:
                date = blog['date'].split('T')[0]
                cursor.execute(
                    '''
                    INSERT INTO blogs (hash, title, slug, tags, keywords, short_content, content, key_takeaways, thumbnail, categories, date, publish, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT(hash) DO UPDATE SET
                    title           = excluded.title,
                    slug            = excluded.slug,
                    tags            = excluded.tags,
                    keywords        = excluded.keywords,
                    short_content   = excluded.short_content,
                    content         = excluded.content,
                    thumbnail       = excluded.thumbnail,
                    categories      = excluded.categories,
                    date            = excluded.date,
                    publish         = excluded.publish,
                    updated_at      = CURRENT_TIMESTAMP
                    ''',
                    (
                        blog['hash'],
                        blog['title'],
                        blog['slug'],
                        blog['tags'],
                        blog['keywords'],
                        blog['shortContent'],
                        blog['content'],
                        blog['keyTakeaways'],
                        blog['thumbnail'],
                        blog['categories'],
                        date,
                        blog['publish']
                    )
                )
            except Exception as e:
                print(f"An error occurred: {e}")
                self.db_connection.rollback()
        self.db_connection.commit()

    def get_blogs(self, page, limit):
        offset = (page - 1) * limit
        cursor = self.db_connection.cursor()
        cursor.execute('''
        SELECT id,
               title,
               slug,
               tags,
               short_content,
               thumbnail,
               date,
               key_takeaways
        FROM blogs
        WHERE publish = TRUE
        ORDER BY date DESC LIMIT ? OFFSET ?''', (limit, offset))
        blogs = cursor.fetchall()
        columns = [column[0] for column in cursor.description]

        return [dict(zip(columns, blog)) for blog in blogs]

    def get_blogs_by_slug(self, slug):
        cursor = self.db_connection.cursor()
        cursor.execute('SELECT * FROM blogs WHERE slug = ?', (slug,))
        blog = cursor.fetchone()
        return dict(blog) if blog else None
    
    def count_blogs(self):
        cursor = self.db_connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM blogs WHERE publish = TRUE")
        result = cursor.fetchone()
        return result[0] if result else 0


