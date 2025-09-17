-- Insert sample Bible verses
INSERT OR IGNORE INTO verses (book, chapter, verse, text, testament, category) VALUES 
  ('Genesis', 1, 1, 'In the beginning God created the heaven and the earth.', 'old', 'creation'),
  ('John', 3, 16, 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', 'new', 'salvation'),
  ('Psalms', 23, 1, 'The Lord is my shepherd; I shall not want.', 'old', 'comfort'),
  ('Proverbs', 3, 5, 'Trust in the Lord with all thine heart; and lean not unto thine own understanding.', 'old', 'wisdom'),
  ('Matthew', 5, 14, 'Ye are the light of the world. A city that is set on an hill cannot be hid.', 'new', 'discipleship'),
  ('Romans', 8, 28, 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', 'new', 'promise'),
  ('Philippians', 4, 13, 'I can do all things through Christ which strengtheneth me.', 'new', 'strength'),
  ('Isaiah', 40, 31, 'But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.', 'old', 'strength'),
  ('1 Corinthians', 13, 4, 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.', 'new', 'love'),
  ('Joshua', 1, 9, 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.', 'old', 'courage');

-- Insert badges/achievements
INSERT OR IGNORE INTO badges (name, description, icon_emoji, requirement_type, requirement_value, category) VALUES 
  ('First Step', 'Complete your first adventure', '🎯', 'adventures', 1, 'beginner'),
  ('Scripture Scholar', 'Complete 10 adventures', '📚', 'adventures', 10, 'progress'),
  ('Verse Master', 'Learn 50 verses', '✨', 'verses', 50, 'mastery'),
  ('Week Warrior', '7-day streak', '🔥', 'streak', 7, 'dedication'),
  ('Month Champion', '30-day streak', '🏆', 'streak', 30, 'dedication'),
  ('Point Pioneer', 'Earn 100 points', '⭐', 'points', 100, 'achievement'),
  ('Point Leader', 'Earn 500 points', '🌟', 'points', 500, 'achievement'),
  ('Bible Explorer', 'Study verses from both testaments', '🗺️', 'special', 0, 'exploration');

-- Insert sample adventures/lessons
INSERT OR IGNORE INTO adventures (title, description, difficulty, theme, verse_ids, questions, rewards_points, badge_id, order_index) VALUES 
  ('Creation Journey', 'Explore the story of creation and God''s power', 'easy', 'creation', '[1]', '[{"question":"Who created the heaven and earth?","options":["God","Man","Angels","Nature"],"correct":0,"explanation":"Genesis 1:1 tells us that God created everything"}]', 10, 1, 1),
  
  ('Love & Salvation', 'Discover God''s amazing love for the world', 'easy', 'salvation', '[2]', '[{"question":"What did God give because He loved the world?","options":["Gold","His only Son","A kingdom","Angels"],"correct":1,"explanation":"John 3:16 reveals God gave His only Son for our salvation"}]', 15, NULL, 2),
  
  ('The Good Shepherd', 'Learn about God''s care and provision', 'easy', 'comfort', '[3]', '[{"question":"What does the Lord being our shepherd mean?","options":["We are sheep","We shall not want","We live on a farm","We follow blindly"],"correct":1,"explanation":"Psalm 23 assures us that with God as our shepherd, we lack nothing"}]', 10, NULL, 3),
  
  ('Trust & Wisdom', 'Understanding how to trust God completely', 'medium', 'wisdom', '[4]', '[{"question":"How should we trust the Lord according to Proverbs?","options":["Partially","With our minds only","With all our heart","When convenient"],"correct":2,"explanation":"Proverbs 3:5 teaches us to trust God with ALL our heart"}]', 20, NULL, 4),
  
  ('Light of the World', 'Discover your purpose as God''s light', 'medium', 'discipleship', '[5]', '[{"question":"What are believers called in Matthew 5:14?","options":["Salt of the earth","Light of the world","Seeds of faith","Children of God"],"correct":1,"explanation":"Jesus calls us the light of the world to shine for Him"}]', 20, NULL, 5),
  
  ('Strength & Courage Bundle', 'Find strength in God during challenges', 'hard', 'strength', '[7,8,10]', '[{"question":"Through whom can we do all things?","options":["Our own strength","Christ","Good works","Positive thinking"],"correct":1},{"question":"What happens to those who wait upon the Lord?","options":["They get tired","They renew their strength","They become weak","They give up"],"correct":1},{"question":"What should we NOT be according to Joshua?","options":["Strong","Courageous","Afraid","Faithful"],"correct":2}]', 35, 2, 6);

-- Insert sample daily verses
INSERT OR IGNORE INTO daily_verses (verse_id, date, theme, reflection) VALUES 
  (2, DATE('now'), 'love', 'Reflect on God''s incredible love shown through Jesus Christ.'),
  (3, DATE('now', '+1 day'), 'comfort', 'Find peace knowing God is your shepherd and provider.'),
  (7, DATE('now', '+2 days'), 'strength', 'Remember that Christ gives you strength for every challenge.');

-- Insert sample users
INSERT OR IGNORE INTO users (username, email, display_name, avatar_url, total_points, current_streak, longest_streak) VALUES 
  ('explorer1', 'explorer@example.com', 'Bible Explorer', '👦', 45, 3, 7),
  ('seeker2', 'seeker@example.com', 'Truth Seeker', '👧', 120, 5, 14),
  ('learner3', 'learner@example.com', 'Scripture Learner', '🧑', 200, 12, 12);

-- Insert sample progress
INSERT OR IGNORE INTO user_progress (user_id, adventure_id, status, score, attempts, time_spent) VALUES 
  (1, 1, 'completed', 10, 1, 120),
  (1, 2, 'in_progress', 5, 2, 180),
  (2, 1, 'completed', 10, 1, 90),
  (2, 2, 'completed', 15, 1, 150),
  (2, 3, 'completed', 10, 2, 200);