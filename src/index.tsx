import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

// API route to get all verses or filter by testament/book
app.get('/api/verses', async (c) => {
  const { env } = c;
  const testament = c.req.query('testament');
  const book = c.req.query('book');
  const category = c.req.query('category');
  
  let query = 'SELECT * FROM verses WHERE 1=1';
  const params: any[] = [];
  
  if (testament) {
    query += ' AND testament = ?';
    params.push(testament);
  }
  if (book) {
    query += ' AND book = ?';
    params.push(book);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY id';
  
  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, verses: result.results });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch verses' }, 500);
  }
});

// API route to get a random verse
app.get('/api/verses/random', async (c) => {
  const { env } = c;
  
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM verses ORDER BY RANDOM() LIMIT 1'
    ).first();
    return c.json({ success: true, verse: result });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch random verse' }, 500);
  }
});

// API route to get daily verse
app.get('/api/verses/daily', async (c) => {
  const { env } = c;
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const result = await env.DB.prepare(`
      SELECT v.*, dv.theme, dv.reflection 
      FROM daily_verses dv
      JOIN verses v ON dv.verse_id = v.id
      WHERE dv.date = ?
    `).bind(today).first();
    
    if (!result) {
      // If no daily verse set, return a random verse
      const randomVerse = await env.DB.prepare(
        'SELECT * FROM verses ORDER BY RANDOM() LIMIT 1'
      ).first();
      return c.json({ success: true, verse: randomVerse, isRandom: true });
    }
    
    return c.json({ success: true, verse: result });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch daily verse' }, 500);
  }
});

// API route to get all adventures
app.get('/api/adventures', async (c) => {
  const { env } = c;
  const difficulty = c.req.query('difficulty');
  
  let query = 'SELECT * FROM adventures WHERE 1=1';
  const params: any[] = [];
  
  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }
  
  query += ' ORDER BY order_index';
  
  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, adventures: result.results });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch adventures' }, 500);
  }
});

// API route to get specific adventure with questions
app.get('/api/adventures/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  
  try {
    const adventure = await env.DB.prepare(
      'SELECT * FROM adventures WHERE id = ?'
    ).bind(id).first();
    
    if (!adventure) {
      return c.json({ success: false, error: 'Adventure not found' }, 404);
    }
    
    // Parse JSON fields
    if (adventure.verse_ids) {
      adventure.verse_ids = JSON.parse(adventure.verse_ids as string);
    }
    if (adventure.questions) {
      adventure.questions = JSON.parse(adventure.questions as string);
    }
    
    // Fetch associated verses
    if (adventure.verse_ids && Array.isArray(adventure.verse_ids)) {
      const verseIds = adventure.verse_ids.join(',');
      const verses = await env.DB.prepare(
        `SELECT * FROM verses WHERE id IN (${verseIds})`
      ).all();
      adventure.verses = verses.results;
    }
    
    return c.json({ success: true, adventure });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch adventure' }, 500);
  }
});

// API route to track user progress
app.post('/api/progress', async (c) => {
  const { env } = c;
  const { userId, adventureId, status, score, timeSpent } = await c.req.json();
  
  try {
    // Check if progress exists
    const existing = await env.DB.prepare(
      'SELECT * FROM user_progress WHERE user_id = ? AND adventure_id = ?'
    ).bind(userId, adventureId).first();
    
    if (existing) {
      // Update existing progress
      await env.DB.prepare(`
        UPDATE user_progress 
        SET status = ?, score = ?, attempts = attempts + 1, 
            time_spent = time_spent + ?, updated_at = CURRENT_TIMESTAMP,
            completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE user_id = ? AND adventure_id = ?
      `).bind(status, score, timeSpent || 0, status, userId, adventureId).run();
    } else {
      // Create new progress
      await env.DB.prepare(`
        INSERT INTO user_progress (user_id, adventure_id, status, score, time_spent)
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, adventureId, status, score, timeSpent || 0).run();
    }
    
    // Update user total points if completed
    if (status === 'completed') {
      await env.DB.prepare(`
        UPDATE users SET total_points = total_points + ? WHERE id = ?
      `).bind(score, userId).run();
    }
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to update progress' }, 500);
  }
});

// API route to create a new user (defaults to parent)
app.post('/api/users', async (c) => {
  const { env } = c;
  const { username, email, displayName, avatarUrl } = await c.req.json();

  if (!username) {
    return c.json({ success: false, error: 'Username is required' }, 400);
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO users (username, email, display_name, avatar_url, role) VALUES (?, ?, ?, ?, ?)'
    ).bind(username, email, displayName, avatarUrl, 'parent').run();

    return c.json({ success: true, userId: result.meta.last_row_id });
  } catch (error: any) {
    console.error('Failed to create user:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, error: 'Username or email already taken' }, 409);
    }
    return c.json({ success: false, error: 'Failed to create user' }, 500);
  }
});

// API route for a parent to create a child account
app.post('/api/users/child', async (c) => {
  const { env } = c;
  const { parentId, username, displayName, email, avatarUrl } = await c.req.json();

  if (!parentId || !username) {
    return c.json({ success: false, error: 'Parent ID and username are required' }, 400);
  }

  try {
    // Verify the parent exists and is a 'parent'
    const parent = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ? AND role = ?'
    ).bind(parentId, 'parent').first();

    if (!parent) {
      return c.json({ success: false, error: 'Invalid parent account' }, 403);
    }

    // Create the child user
    const result = await env.DB.prepare(
      'INSERT INTO users (username, display_name, email, avatar_url, role, parent_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(username, displayName, email, avatarUrl, 'child', parentId).run();

    return c.json({ success: true, userId: result.meta.last_row_id });
  } catch (error: any) {
    console.error('Failed to create child account:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, error: 'Username or email already taken' }, 409);
    }
    return c.json({ success: false, error: 'Failed to create child account' }, 500);
  }
});

// API route to get user stats
app.get('/api/users/:id/stats', async (c) => {
  const { env } = c;
  const userId = c.req.param('id');
  const requestingUserId = c.req.query('requestingUserId');

  try {
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first<any>();
    
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Authorization: allow if the requesting user is the user themselves, or their parent.
    if (requestingUserId) {
      if (user.id !== parseInt(requestingUserId) && user.parent_id !== parseInt(requestingUserId)) {
        return c.json({ success: false, error: 'Unauthorized' }, 403);
      }
    }

    // Get progress stats
    const progressStats = await env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_adventures,
        COUNT(DISTINCT adventure_id) as total_attempted,
        SUM(score) as total_score,
        SUM(time_spent) as total_time
      FROM user_progress
      WHERE user_id = ?
    `).bind(userId).first();
    
    // Get badges
    const badges = await env.DB.prepare(`
      SELECT b.* FROM badges b
      JOIN user_badges ub ON b.id = ub.badge_id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC
    `).bind(userId).all();
    
    return c.json({ 
      success: true, 
      user,
      stats: progressStats,
      badges: badges.results
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch user stats' }, 500);
  }
});

// API route to get current user's profile and children
app.get('/api/users/me', async (c) => {
  const { env } = c;
  const userId = c.req.query('userId');

  if (!userId) {
    return c.json({ success: false, error: 'User ID is required' }, 400);
  }

  try {
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first<any>();

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    let children = [];
    if (user.role === 'parent') {
      const childrenResult = await env.DB.prepare(
        'SELECT id, username, display_name, avatar_url, total_points FROM users WHERE parent_id = ?'
      ).bind(userId).all();
      children = childrenResult.results;
    }

    return c.json({ success: true, user, children });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch user profile' }, 500);
  }
});

// API route to get leaderboard
app.get('/api/leaderboard', async (c) => {
  const { env } = c;
  const limit = parseInt(c.req.query('limit') || '10');
  
  try {
    const result = await env.DB.prepare(`
      SELECT id, username, display_name, avatar_url, total_points, current_streak
      FROM users
      ORDER BY total_points DESC
      LIMIT ?
    `).bind(limit).all();
    
    return c.json({ success: true, leaderboard: result.results });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch leaderboard' }, 500);
  }
});

// Main HTML page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VerseVenture - Bible Adventure App</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
    </head>
    <body class="bg-gradient-to-b from-blue-50 to-green-50 min-h-screen">
        <div id="app" class="container mx-auto px-4 py-8">
            <!-- App content will be loaded here -->
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `);
});

export default app