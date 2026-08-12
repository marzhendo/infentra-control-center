CREATE TYPE public.task_priority AS ENUM ('Low', 'Medium', 'High');

ALTER TABLE public.tasks 
ADD COLUMN priority public.task_priority NOT NULL DEFAULT 'Medium';
