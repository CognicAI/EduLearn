-- Add sort_order to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing assignments to have a default sort order (optional, based on creation time)
WITH ordered_assignments AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY module_id ORDER BY created_at) as rn
    FROM assignments
    WHERE module_id IS NOT NULL
)
UPDATE assignments
SET sort_order = ordered_assignments.rn
FROM ordered_assignments
WHERE assignments.id = ordered_assignments.id;
