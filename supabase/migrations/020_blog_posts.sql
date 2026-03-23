CREATE TABLE blog_posts (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text        UNIQUE NOT NULL,
  title       text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  category    text        NOT NULL DEFAULT 'General',
  date        date        NOT NULL DEFAULT CURRENT_DATE,
  read_time   int         NOT NULL DEFAULT 5,
  author      text        NOT NULL DEFAULT 'The MathKix Team',
  content     text        NOT NULL DEFAULT '',
  published   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Published posts are publicly readable"
  ON blog_posts FOR SELECT
  USING (published = true);
