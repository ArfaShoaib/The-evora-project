TASK: Tax settings ki tarah hi ek "Shipping" setting Admin Panel mein add karni hai. Farq sirf yeh hai ke Shipping ek FIXED amount hogi (PKR mein), percentage nahi. Yeh PKR value database mein store hogi, aur agar user USD currency select kare to existing exchange-rate conversion logic se convert ho ke dikhni chahiye.

STRICT CONSTRAINT: Sirf naya Shipping section/logic add karna hai, tax logic ko touch nahi karna. Koi existing UI/color/layout change nahi karni.

DATABASE:
- Tax wale row ki tarah hi pattern follow karo: `site_content` table mein naya row, key = "shipping", value (jsonb) = {"shipping_cost_pkr": <number>}
- Agar admin ne abhi tak set nahi kiya to default 0 ya "Free" treat karo

ADMIN UI (Settings page mein, Tax Settings ke sath/neeche naya card):
- Heading: "SHIPPING SETTINGS"
- Input field: "Shipping Cost (PKR)" — number input, default value existing DB se pre-filled
- Helper text: "This is a fixed shipping cost in PKR. It will be converted automatically for other currencies."
- Optional: checkbox/toggle "Free Shipping" — agar enable ho to shipping_cost_pkr ko 0 treat karo aur checkout par "Free" dikhao
- "Save" button — Server Action se `site_content` mein key="shipping" wala row update/upsert kare
- Save hone par toast confirmation

CALCULATION LOGIC (checkout/cart/order-summary mein, jahan tax bhi calculate hoti hai):
1. DB se `key = 'shipping'` wala row fetch karo, value.shipping_cost_pkr nikalo (jaisa tax ke liye value.tax_percentage nikala tha)
2. Agar selected currency PKR hai → shipping_cost_pkr seedha use karo, koi conversion nahi
3. Agar selected currency USD hai → existing exchange-rate function/rate use karke shipping_cost_pkr ko USD mein convert karo (wahi rate jo product prices convert karne ke liye already use ho raha hai)
4. Agar shipping_cost_pkr === 0, to "Free" label dikhao jaisa abhi screenshots mein dikh raha hai
5. Converted shipping amount ko toFixed(2) se round karo
6. Order Total = Subtotal + Tax + Shipping (in selected currency)

GOAL: Admin ek hi jagah se shipping cost PKR mein set kare, aur checkout har currency mein usko sahi convert kar ke dikhaye aur total mein add kare — tax ki tarah hi dynamic, koi hardcoded shipping number na ho.

Make this change ONLY in: (1) Settings page admin component (new Shipping card), (2) Server Action/Supabase query for saving & fetching shipping_cost_pkr, (3) cart/checkout total calculation logic. Do not touch tax logic or any unrelated component.