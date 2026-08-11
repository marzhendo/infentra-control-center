-- Add slug column to divisions
ALTER TABLE divisions ADD COLUMN slug TEXT UNIQUE;

-- Delete all existing divisions to reset (safe since this is early development)
DELETE FROM divisions;

-- Insert the 10 divisions for INFENTRA
INSERT INTO divisions (name, slug) VALUES 
('Acara', 'acara'),
('PDD', 'pdd'),
('IT Team', 'it-team'),
('Kestari', 'kestari'),
('Danus', 'danus'),
('Humas', 'humas'),
('Sponsorship', 'sponsorship'),
('Konsumsi', 'konsumsi'),
('Perlengkapan', 'perlengkapan'),
('Keamanan', 'keamanan');
