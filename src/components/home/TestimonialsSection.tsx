import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Thabo Mokoena',
    role: 'Business Management Graduate',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    content: 'CCPQ helped me advance my career while working full-time. The flexible online format was exactly what I needed to balance work and studies.',
    rating: 5,
  },
  {
    name: 'Nomvula Dlamini',
    role: 'HR Management Student',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    content: 'The course content is practical and relevant to the South African workplace. I\'ve already started applying what I\'ve learned in my current role.',
    rating: 5,
  },
  {
    name: 'Sipho Ndlovu',
    role: 'IT Support Graduate',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    content: 'The student support team was incredibly helpful throughout my journey. They made online learning feel personal and engaging.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from real students about their experience with CCPQ.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-card p-6 rounded-xl shadow-card card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Quote className="h-8 w-8 text-accent/30 mb-4" />
              
              <p className="text-foreground mb-6">"{testimonial.content}"</p>
              
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}