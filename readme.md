# Mailer Lite Detective

## Some Instructions

Create a file called `.env` in this directory and fill it with the following info: 
```
export MAILER_LITE_KEY=<your MailerLite API key>
export SHOPIFY_API_KEY=<your Shopify API key>
export SHOPIFY_SHOP_NAME=<your Shopify store name (e.g. insect-expressions.myshopify.com)>
export SHOPIFY_PASSWORD=<your Shopify API password>
```

Run the script to add the last shopify order time of your mailer lite subscribers to their profiles.

e.g. 

`node --experimental-modules src/index.mjs`