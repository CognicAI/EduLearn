-- Insert academic categories for a college/university LMS
-- This script adds common academic departments and course categories

INSERT INTO categories (name, slug, description, icon, color) VALUES
-- STEM Subjects
('Computer Science', 'computer-science', 'Programming, algorithms, software development, and computer systems', '💻', '#3B82F6'),
('Engineering', 'engineering', 'Mechanical, electrical, civil, and other engineering disciplines', '⚙️', '#8B5CF6'),
('Mathematics', 'mathematics', 'Calculus, algebra, statistics, and mathematical theory', '📐', '#EC4899'),
('Physics', 'physics', 'Classical mechanics, quantum physics, and thermodynamics', '🔬', '#06B6D4'),
('Chemistry', 'chemistry', 'Organic, inorganic, physical, and analytical chemistry', '🧪', '#10B981'),
('Biology', 'biology', 'Molecular biology, genetics, ecology, and life sciences', '🧬', '#84CC16'),

-- Business & Economics
('Business Administration', 'business-administration', 'Management, entrepreneurship, and business strategy', '💼', '#F59E0B'),
('Economics', 'economics', 'Microeconomics, macroeconomics, and economic theory', '📊', '#EF4444'),
('Finance & Accounting', 'finance-accounting', 'Financial management, accounting principles, and investments', '💰', '#14B8A6'),
('Marketing', 'marketing', 'Digital marketing, brand management, and market research', '📱', '#F97316'),

-- Humanities & Social Sciences
('English & Literature', 'english-literature', 'Writing, literature analysis, and communication skills', '📚', '#6366F1'),
('History', 'history', 'World history, cultural studies, and historical analysis', '🏛️', '#9333EA'),
('Psychology', 'psychology', 'Cognitive psychology, behavioral science, and mental health', '🧠', '#D946EF'),
('Sociology', 'sociology', 'Social structures, culture, and human behavior', '👥', '#0EA5E9'),
('Philosophy', 'philosophy', 'Ethics, logic, metaphysics, and critical thinking', '🤔', '#8B5CF6'),

-- Arts & Design
('Fine Arts', 'fine-arts', 'Painting, sculpture, and visual arts', '🎨', '#EC4899'),
('Music', 'music', 'Music theory, performance, and composition', '🎵', '#A855F7'),
('Design', 'design', 'Graphic design, UI/UX, and creative design principles', '✨', '#06B6D4'),

-- Languages
('Languages', 'languages', 'Foreign languages, linguistics, and translation', '🌍', '#10B981'),

-- Health & Medicine
('Health Sciences', 'health-sciences', 'Public health, nutrition, and healthcare management', '🏥', '#EF4444'),
('Medicine', 'medicine', 'Medical sciences, clinical practice, and healthcare', '⚕️', '#DC2626'),

-- Other
('Law', 'law', 'Legal studies, constitutional law, and jurisprudence', '⚖️', '#78716C'),
('Education', 'education', 'Teaching methods, pedagogy, and educational theory', '🎓', '#F59E0B'),
('Environmental Science', 'environmental-science', 'Ecology, sustainability, and environmental studies', '🌱', '#22C55E'),
('Data Science', 'data-science', 'Machine learning, data analysis, and AI', '📈', '#3B82F6');

-- Verify insertion
SELECT COUNT(*) as total_categories FROM categories WHERE is_deleted = false;
SELECT name, slug FROM categories ORDER BY name LIMIT 10;
