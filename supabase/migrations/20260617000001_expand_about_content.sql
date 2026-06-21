-- Update about section with full page content
update site_content set content = '{
  "title": "The Story of EVORA",
  "description": "Born from a passion for timeless design and uncompromising quality, EVORA creates luxury fashion for the modern woman who values both elegance and authenticity.",
  "mission_title": "Our Mission",
  "mission": "We believe luxury should be accessible, sustainable, and timeless. Every piece in our collection is thoughtfully designed to transcend seasons and trends, becoming a cherished part of your wardrobe for years to come. From the finest fabrics to meticulous craftsmanship, we pour our hearts into every detail. Our commitment to quality means you can wear EVORA with confidence, knowing each piece was made to last.",
  "mission_image": "",
  "values": [
    {"title": "Timeless Design", "description": "We create pieces that transcend trends, designed to be worn and loved for years."},
    {"title": "Quality Craftsmanship", "description": "Every stitch, every detail is executed with precision and care by skilled artisans."},
    {"title": "Sustainable Luxury", "description": "We are committed to ethical practices and sustainable materials wherever possible."}
  ],
  "team_title": "The Team",
  "team_description": "A small, dedicated team of designers, curators, and dreamers united by a shared love for beautiful fashion.",
  "team": [
    {"name": "Sarah Chen", "role": "Founder & Creative Director", "avatar_url": ""},
    {"name": "Marcus Webb", "role": "Head of Design", "avatar_url": ""},
    {"name": "Aisha Patel", "role": "Brand Director", "avatar_url": ""},
    {"name": "James Liu", "role": "Operations Lead", "avatar_url": ""}
  ]
}' where section_key = 'about';
