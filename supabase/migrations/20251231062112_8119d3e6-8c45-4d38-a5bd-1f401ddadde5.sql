-- Add more course categories to match CCPQ's offerings
INSERT INTO public.course_categories (id, name, slug, description, icon) VALUES
(gen_random_uuid(), 'Accounting & Finance', 'accounting-finance', 'Master financial management and accounting principles', 'Calculator'),
(gen_random_uuid(), 'Marketing & Sales', 'marketing-sales', 'Learn marketing strategies and sales techniques', 'TrendingUp'),
(gen_random_uuid(), 'Education & Training', 'education-training', 'Develop teaching and training skills', 'GraduationCap'),
(gen_random_uuid(), 'Legal & Compliance', 'legal-compliance', 'Understanding of legal frameworks and compliance', 'Scale'),
(gen_random_uuid(), 'Hospitality & Tourism', 'hospitality-tourism', 'Excel in hospitality and tourism industries', 'Plane'),
(gen_random_uuid(), 'Beauty & Wellness', 'beauty-wellness', 'Professional beauty and wellness courses', 'Sparkles'),
(gen_random_uuid(), 'Engineering & Technical', 'engineering-technical', 'Technical and engineering fundamentals', 'Wrench'),
(gen_random_uuid(), 'Safety & Security', 'safety-security', 'Occupational health, safety and security training', 'Shield'),
(gen_random_uuid(), 'Agriculture & Environment', 'agriculture-environment', 'Agricultural and environmental management', 'Leaf'),
(gen_random_uuid(), 'Media & Communication', 'media-communication', 'Media, journalism and communication skills', 'Radio'),
(gen_random_uuid(), 'Childcare & Early Development', 'childcare-development', 'Early childhood development and childcare', 'Baby'),
(gen_random_uuid(), 'Supply Chain & Logistics', 'supply-chain-logistics', 'Supply chain management and logistics', 'Truck'),
(gen_random_uuid(), 'Real Estate & Property', 'real-estate-property', 'Real estate and property management', 'Building'),
(gen_random_uuid(), 'Entrepreneurship', 'entrepreneurship', 'Start and grow your own business', 'Rocket'),
(gen_random_uuid(), 'Customer Service', 'customer-service', 'Excellence in customer relations and service', 'Headphones')
ON CONFLICT DO NOTHING;