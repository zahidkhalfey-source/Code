# Allergy Check

An iPhone web app for logging what your child eats each day and flagging anything that matches their allergens.

- **Home screen:** Breakfast, Lunch, Dinner, Snacks.
- **Add food** to a meal in three ways:
  - **Type it:** a name, plus ingredients if you have them.
  - **Barcode:** scan it with the camera (or type the number). The product's ingredients and allergens come from [Open Food Facts](https://world.openfoodfacts.org).
  - **Photo:** photograph the ingredients label. The text is read on the phone and you can correct it before saving.
- Every item is checked as soon as it's added, and the phone buzzes if it contains an allergen.
- **End-of-day report:** a red, amber or green verdict, the items grouped by meal, and a Share button for sending it by text. You can step back through earlier days.
- **Allergens (⚙︎):** tap common ones or type your own. Common allergens also catch related words. For example, *Milk* also flags butter, cheese, whey and casein, and *Tree nuts* flags almond, cashew, pesto and marzipan.

Everything is stored on the phone. Only barcode numbers leave the device, for the product lookup.

## Put it on your iPhone

1. Host the folder over HTTPS. The camera needs HTTPS. This repo includes a GitHub Pages workflow: in **Settings → Pages**, set *Source* to **GitHub Actions**, then merge to `main`.
2. Open the Pages URL in **Safari** on the iPhone.
3. Tap **Share → Add to Home Screen**. It then opens full-screen like a normal app.

## Limits

This is a helper, not a guarantee. Product databases can be out of date or wrong, and reading labels from photos can miss words. Always check the label yourself.
