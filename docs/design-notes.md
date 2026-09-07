# Design and asset notes

Reading: a Pakistani single-product herbal shop, traditional and approachable. Design variance 3, motion 2, visual density 5. Native components and Tailwind utilities, no external dashboard theme. The marketing skill applies to storefront pages; administrative pages use straightforward forms and tables.

Colors: Dark Maroon #5F1111, Herbal Green #356B2E, Muted Gold #C89432, Warm Cream #FFF8EE, Border Beige #EAD7BC. Maroon is the primary action color; green communicates the herbal identity; gold is used for focus states. Five-pixel corners for ordinary controls and containers, an arch for the hero photograph.

Self-hosted DM Sans for practical shop UI, Lora for traditional brand headings, and Noto Naskh Arabic for Urdu. The serif is intentional for the majoon shop's heritage identity. No fabricated reviews, certifications, efficacy statistics or medical claims.

Provisional raster asset: `public/images/zoorvan-product.png`. Generated with the built-in image generation tool. It is a packaging concept and must be replaced or approved by the merchant before launch.

Prompt:

> Use case: product-mockup. Asset type: ecommerce website product hero photograph. Create a realistic provisional packaging concept for a Pakistani men's herbal majoon brand named ZOORVAN. One squat wide dark amber glass jar with a textured matte dark maroon screw lid, cream paper label with traditional dark maroon fine ornamental border, large legible typography 'ZOORVAN' and below 'MAJOON', small 'HERBAL BLEND' text. Jar on worn pale sandstone tabletop with a few green leaves and a small wooden spoon holding brown herbal paste, no other ingredients. Warm cream plaster backdrop with soft arch-shaped shadow, authentic modest South Asian herbal shop feeling, natural sunlight from left. Landscape 3:2 composition, jar centered, fills 65% height. Earthy warm cream, dark maroon #5F1111, herbal green #356B2E and muted gold #C89432. No medical claims, no seals, no people, no watermark. Photorealistic, detailed label paper and glass. Do not put extra copy outside label.

QA: Desktop at 1440px and mobile at 390px were visually inspected. Mobile navigation, accordion FAQs, bag persistence, checkout validation, preview success, tracking and route coverage are exercised by Playwright. Motion is limited to hover feedback and loading placeholders, with reduced-motion support. Native dialog behavior traps focus in admin editors. Form errors are associated with their inputs.
