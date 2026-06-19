DELETE FROM public.user_roles WHERE role = 'admin' AND user_id IN (SELECT id FROM auth.users WHERE email = 'nsanders2009@gmail.com');
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'mrcap11@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;